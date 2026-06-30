import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { SYSTEEM_PROMPT, CHUNK_DREMPEL, MAX_CHUNK_GROOTTE, CHUNK_OVERLAP } from '@/lib/herstelregels';
import { extractPdfText, renderFotoPaginasNaarImages } from '@/lib/pdf-extractor';
import { getPrijzengeheugen, slaEenheidsprijzenOp, slaAnalyseOp } from '@/lib/database';
import type { AnalyseResultaat, Schade, KritiekeBevinding, Categorie } from '@/lib/types';

// ---------------------------------------------------------------------------
// Hulpfunctie: samenvoegen van meerdere chunk-resultaten tot één eindresultaat
// ---------------------------------------------------------------------------
function samenvoegResultaten(deelResultaten: AnalyseResultaat[]): AnalyseResultaat {
  const samengevoegdeSchades: Schade[] = [];
  const geziendeKritieke = new Set<string>();
  const samengevoegdeKritieke: KritiekeBevinding[] = [];
  const samengevoegdePrijzen: Record<string, number> = {};
  const categorieAantallen: Record<string, number> = {};

  for (const deel of deelResultaten) {
    for (const schade of (deel.schades ?? [])) {
      samengevoegdeSchades.push(schade);
    }

    for (const kb of (deel.kritieke_bevindingen ?? [])) {
      if (!geziendeKritieke.has(kb.titel)) {
        geziendeKritieke.add(kb.titel);
        samengevoegdeKritieke.push(kb);
      }
    }

    for (const [k, v] of Object.entries(deel.gevonden_eenheidsprijzen ?? {})) {
      samengevoegdePrijzen[k] = v;
    }

    for (const cat of (deel.categorieen ?? [])) {
      categorieAantallen[cat.naam] = (categorieAantallen[cat.naam] ?? 0) + cat.aantal;
    }
  }

  const totaalFouten = samengevoegdeSchades.reduce((s, sc) => s + (sc.fouten?.length ?? 0), 0)
    + samengevoegdeKritieke.length;

  const totaleVergoeding = samengevoegdeSchades.reduce((s, sc) => {
    return sc.schade_totaal_euro != null ? s + sc.schade_totaal_euro : s;
  }, 0) || null;

  const categorieen: Categorie[] = [
    'Sauswerk & wanden',
    'Tegelwerk',
    'Metselwerk',
    'Steigerwerk',
    'Objecten & meubels op foto',
    'Stucloper',
    'Trapgat-toeslag',
    'Bouwkundige staat (gevoeligheid)',
    'Afgewezen schades vs. trillingsgrenswaarden',
  ].map(naam => ({ naam, aantal: categorieAantallen[naam] ?? 0 }));

  return {
    totaal_fouten: totaalFouten,
    totale_gemiste_vergoeding: totaleVergoeding,
    gevonden_eenheidsprijzen: samengevoegdePrijzen,
    categorieen,
    kritieke_bevindingen: samengevoegdeKritieke,
    schades: samengevoegdeSchades,
  };
}

// ---------------------------------------------------------------------------
// Hulpfunctie: dossier splitsen in logische chunks per ruimte/hoofdstuk
// ---------------------------------------------------------------------------
function splitInChunks(tekst: string): string[] {
  const koptekstRegex = /(?=\n(?:\d+\.\d+(?:\.\d+)?\s|\b(?:Ruimte|Kamer|Woonkamer|Slaapkamer|Badkamer|Keuken|Hal|Gang|Berging|Garage|Zolder|Kelder|Trappenhuis|Bijkeuken|Overloop|Gevel|Voorgevel|Achtergevel|Zijgevel)\b))/i;

  const delen = tekst.split(koptekstRegex).filter(d => d.trim().length > 0);
  const chunks: string[] = [];
  let huidigChunk = '';

  for (const deel of delen) {
    if ((huidigChunk + deel).length > MAX_CHUNK_GROOTTE) {
      if (huidigChunk.trim()) chunks.push(huidigChunk);
      const overlap = huidigChunk.slice(-CHUNK_OVERLAP);
      huidigChunk = overlap + deel;
    } else {
      huidigChunk += deel;
    }
  }

  if (huidigChunk.trim()) chunks.push(huidigChunk);
  return chunks.length > 0 ? chunks : [tekst];
}

// ---------------------------------------------------------------------------
// Hulpfunctie: extracteer gebouwcontext (hoofdstuk 1+2) uit volledige tekst
// ---------------------------------------------------------------------------
function extracteerGebouwcontext(tekst: string): string {
  const CONTEXT_LENGTE = 8000;
  const h3Match = tekst.match(/\n(?:3\.|Hoofdstuk 3|HOOFDSTUK 3|Beoordeling schades)/i);
  if (h3Match && h3Match.index && h3Match.index > 1000) {
    return tekst.slice(0, Math.min(h3Match.index, CONTEXT_LENGTE * 2));
  }
  return tekst.slice(0, CONTEXT_LENGTE);
}

// ---------------------------------------------------------------------------
// Eén Claude-aanroep uitvoeren voor een chunk
// ---------------------------------------------------------------------------
async function analyseerdChunk(
  anthropic: Anthropic,
  gebouwcontext: string,
  chunkTekst: string,
  prijzenTekst: string,
  fotoAfbeeldingen: Array<{ pageIndex: number; base64: string; mediaType: string }>,
  chunkNummer: number,
  totaalChunks: number,
): Promise<AnalyseResultaat> {
  const isEersteChunk = chunkNummer === 1;

  const contextBlok = isEersteChunk || totaalChunks === 1
    ? `GEBOUWCONTEXT (bouwjaar, PGV-waarden, bouwkundige staat — gebruik dit voor REGEL 9 en REGEL 10):\n${gebouwcontext}\n\n`
    : `GEBOUWCONTEXT (ter referentie):\n${gebouwcontext.slice(0, 2000)}\n\n`;

  const chunkLabel = totaalChunks > 1
    ? `[Dit is deel ${chunkNummer} van ${totaalChunks}. Analyseer UITSLUITEND de schades in dit deel. Kritieke bevindingen (REGEL 9, REGEL 10) alleen rapporteren in deel 1.]\n\n`
    : '';

  const gebruikersprompt = `${chunkLabel}${contextBlok}DOSSIERTEKST — TE ANALYSEREN DEEL:\n${chunkTekst}${prijzenTekst}`;

  const contentBlocks: Anthropic.MessageParam['content'] = [
    { type: 'text', text: gebruikersprompt },
  ];

  for (const foto of fotoAfbeeldingen) {
    contentBlocks.push({
      type: 'image',
      source: { type: 'base64', media_type: foto.mediaType as 'image/jpeg', data: foto.base64 },
    });
    contentBlocks.push({ type: 'text', text: `[Afbeelding hierboven: pagina ${foto.pageIndex} van het dossier]` });
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8096,
    system: SYSTEEM_PROMPT,
    messages: [{ role: 'user', content: contentBlocks }],
  });

  const rawText = response.content.find(b => b.type === 'text')?.text ?? '';
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Geen JSON in chunk ${chunkNummer}`);
  return JSON.parse(jsonMatch[0]) as AnalyseResultaat;
}

// ---------------------------------------------------------------------------
// API route
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File | null;
    const testMode = request.nextUrl.searchParams.get('test') === 'true';

    if (!file) {
      return Response.json({ error: 'Geen PDF-bestand ontvangen.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return Response.json({ error: 'Alleen PDF-bestanden zijn toegestaan.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfData;
    try {
      pdfData = await extractPdfText(buffer);
    } catch (pdfErr) {
      console.error('PDF extractie fout:', pdfErr);
      return Response.json(
        { error: 'Het PDF-bestand kon niet worden uitgelezen. Controleer of het bestand niet beschadigd is.' },
        { status: 422 },
      );
    }

    const volledigeTekst = pdfData.text;
    const gebouwcontext = extracteerGebouwcontext(volledigeTekst);

    // Chunking: alleen als dossier groot genoeg is
    const gebruikChunking = volledigeTekst.length > CHUNK_DREMPEL;
    const chunks = gebruikChunking ? splitInChunks(volledigeTekst) : [volledigeTekst];

    // Alle foto-pagina's renderen zonder vast maximum
    const alleFotos = await renderFotoPaginasNaarImages(buffer, Infinity);

    const prijzengeheugen = await getPrijzengeheugen();
    const prijzenTekst = Object.keys(prijzengeheugen).length > 0
      ? `\n\nBEKENDE EENHEIDSPRIJZEN UIT EERDER GEANALYSEERDE DOSSIERS:\n${Object.entries(prijzengeheugen)
          .map(([k, v]) => `- ${k}: €${v} per eenheid (incl. BTW)`)
          .join('\n')}`
      : '';

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const chunkDeelResultaten: AnalyseResultaat[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkNummer = i + 1;
      const chunkTekst = chunks[i];

      // Verdeel foto's evenredig over chunks
      const fotosPerChunk = Math.ceil(alleFotos.length / chunks.length);
      const startFoto = i * fotosPerChunk;
      const chunkFotos = alleFotos.slice(startFoto, startFoto + fotosPerChunk);

      console.log(`Analyseer chunk ${chunkNummer}/${chunks.length} (${chunkTekst.length} tekens, ${chunkFotos.length} foto's)`);

      try {
        const deelResultaat = await analyseerdChunk(
          anthropic,
          gebouwcontext,
          chunkTekst,
          prijzenTekst,
          chunkFotos,
          chunkNummer,
          chunks.length,
        );
        chunkDeelResultaten.push(deelResultaat);
      } catch (err) {
        console.error(`Claude API fout bij chunk ${chunkNummer}:`, err);
        return Response.json(
          { error: `De AI-analyse kon niet worden uitgevoerd (deel ${chunkNummer}/${chunks.length}). Probeer het later opnieuw.` },
          { status: 503 },
        );
      }
    }

    const resultaat = chunks.length === 1 ? chunkDeelResultaten[0] : samenvoegResultaten(chunkDeelResultaten);

    if (resultaat.gevonden_eenheidsprijzen && Object.keys(resultaat.gevonden_eenheidsprijzen).length > 0) {
      const vandaag = new Date().toISOString().slice(0, 10);
      await slaEenheidsprijzenOp(resultaat.gevonden_eenheidsprijzen, vandaag);
    }

    const analyseId = uuidv4();
    await slaAnalyseOp(analyseId, file.name, JSON.stringify(resultaat));

    return Response.json({
      analyseId,
      totaal_fouten: resultaat.totaal_fouten,
      totale_gemiste_vergoeding: resultaat.totale_gemiste_vergoeding,
      categorieen: resultaat.categorieen,
      aantalChunks: chunks.length,
      ...(testMode ? { volledig: resultaat } : {}),
    });
  } catch (err) {
    console.error('Onverwachte fout:', err);
    return Response.json({ error: 'Er is een onverwachte fout opgetreden.' }, { status: 500 });
  }
}
