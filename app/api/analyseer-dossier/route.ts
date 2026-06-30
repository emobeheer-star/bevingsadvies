import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { SYSTEEM_PROMPT } from '@/lib/herstelregels';
import { extractPdfText, renderFotoPaginasNaarImages } from '@/lib/pdf-extractor';
import { getPrijzengeheugen, slaEenheidsprijzenOp, slaAnalyseOp } from '@/lib/database';
import type { AnalyseResultaat } from '@/lib/types';

const MAX_TEKST_TEKENS = 60000;
const MAX_FOTO_PAGINAS = 8;

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

    // Extract text
    let pdfData;
    try {
      pdfData = await extractPdfText(buffer);
    } catch (pdfErr) {
      console.error('PDF extractie fout:', pdfErr);
      return Response.json({ error: 'Het PDF-bestand kon niet worden uitgelezen. Controleer of het bestand niet beschadigd is.' }, { status: 422 });
    }

    const dossiertekst = pdfData.text.slice(0, MAX_TEKST_TEKENS);

    // Render photo pages to images
    const fotoAfbeeldingen = await renderFotoPaginasNaarImages(buffer, MAX_FOTO_PAGINAS);

    // Get price memory
    const prijzengeheugen = await getPrijzengeheugen();
    const prijzenTekst = Object.keys(prijzengeheugen).length > 0
      ? `\n\nBEKENDE EENHEIDSPRIJZEN UIT EERDER GEANALYSEERDE DOSSIERS:\n${Object.entries(prijzengeheugen).map(([k, v]) => `- ${k}: €${v} per eenheid (incl. BTW)`).join('\n')}`
      : '';

    const gebruikersprompt = `Analyseer het volgende adviesrapport aardbevingsschade:\n\n${dossiertekst}${prijzenTekst}`;

    // Build content blocks for Claude
    const contentBlocks: Anthropic.MessageParam['content'] = [
      { type: 'text', text: gebruikersprompt }
    ];

    for (const foto of fotoAfbeeldingen) {
      contentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: foto.mediaType as 'image/jpeg',
          data: foto.base64,
        },
      });
      contentBlocks.push({
        type: 'text',
        text: `[Afbeelding hierboven: pagina ${foto.pageIndex} van het dossier]`,
      });
    }

    // Call Claude API
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    let response;
    try {
      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8096,
        system: SYSTEEM_PROMPT,
        messages: [{ role: 'user', content: contentBlocks }],
      });
    } catch (err) {
      console.error('Claude API fout:', err);
      return Response.json({ error: 'De AI-analyse kon niet worden uitgevoerd. Probeer het later opnieuw.' }, { status: 503 });
    }

    const rawText = response.content.find(b => b.type === 'text')?.text ?? '';

    // Parse JSON from response
    let resultaat: AnalyseResultaat;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Geen JSON gevonden');
      resultaat = JSON.parse(jsonMatch[0]);
    } catch {
      console.error('JSON parse fout:', rawText.slice(0, 500));
      return Response.json({ error: 'Het analyseresultaat kon niet worden verwerkt. Probeer opnieuw.' }, { status: 500 });
    }

    // Save price memory
    if (resultaat.gevonden_eenheidsprijzen && Object.keys(resultaat.gevonden_eenheidsprijzen).length > 0) {
      const vandaag = new Date().toISOString().slice(0, 10);
      await slaEenheidsprijzenOp(resultaat.gevonden_eenheidsprijzen, vandaag);
    }

    // Save analysis
    const analyseId = uuidv4();
    await slaAnalyseOp(analyseId, file.name, JSON.stringify(resultaat));

    return Response.json({
      analyseId,
      totaal_fouten: resultaat.totaal_fouten,
      totale_gemiste_vergoeding: resultaat.totale_gemiste_vergoeding,
      categorieen: resultaat.categorieen,
      // In test mode, return full results without paywall
      ...(testMode ? { volledig: resultaat } : {}),
    });

  } catch (err) {
    console.error('Onverwachte fout:', err);
    return Response.json({ error: 'Er is een onverwachte fout opgetreden.' }, { status: 500 });
  }
}
