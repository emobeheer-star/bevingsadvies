import { NextRequest } from 'next/server';
import { getAnalyse } from '@/lib/database';
import type { AnalyseResultaat, Schade } from '@/lib/types';

const DONKERBLAUW = '#0D2137';
const ROOD = '#B91C1C';
const GOUD = '#B8860B';
const PAARS = '#581C87';
const GRIJS = '#6B7280';
const LICHTGRIJS = '#F3F4F6';
const GROEN = '#15803D';

const PAGE_W = 595.28;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

function euro(bedrag: number | null): string {
  if (bedrag === null) return '—';
  return `€${bedrag.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function textHeight(doc: any, text: string, opts: object): number {
  return doc.heightOfString(text, opts);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkPageBreak(doc: any, y: number, needed = 80): number {
  if (y + needed > doc.page.height - 80) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const testMode = request.nextUrl.searchParams.get('test') === 'true';

  const analyse = await getAnalyse(id);
  if (!analyse) return new Response('Rapport niet gevonden.', { status: 404 });
  if (!analyse.betaald && !testMode) return new Response('Betaling vereist.', { status: 402 });

  const resultaat: AnalyseResultaat = JSON.parse(analyse.resultaat_json);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: MARGIN, size: 'A4', autoFirstPage: true, compress: false });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  await new Promise<void>((resolve) => {
    doc.on('end', resolve);

    let y = 0;

    // ── Header balk ─────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, 72).fill(DONKERBLAUW);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(18)
      .text('BevingsAdvies Groningen', MARGIN, 18, { width: CONTENT_W });
    doc.fillColor('white').font('Helvetica').fontSize(10)
      .text('Volledig Foutrapport — Vertrouwelijk', MARGIN, 42, { width: CONTENT_W });
    y = 90;

    // ── Samenvatting blok ────────────────────────────────────
    doc.rect(MARGIN, y, CONTENT_W, 56).fill(LICHTGRIJS);
    doc.fillColor(ROOD).font('Helvetica-Bold').fontSize(32)
      .text(String(resultaat.totaal_fouten), MARGIN + 12, y + 8, { width: 40 });
    doc.fillColor('#374151').font('Helvetica').fontSize(11)
      .text(`fout${resultaat.totaal_fouten !== 1 ? 'en' : ''} gevonden in uw dossier`, MARGIN + 56, y + 16, { width: CONTENT_W - 60 });
    if (resultaat.totale_gemiste_vergoeding) {
      doc.fillColor(GOUD).font('Helvetica-Bold').fontSize(12)
        .text(`Geschatte totale gemiste vergoeding: ${euro(resultaat.totale_gemiste_vergoeding)}`, MARGIN + 12, y + 34, { width: CONTENT_W - 20 });
    }
    y += 68;

    // ── Kritieke bevindingen ─────────────────────────────────
    if (resultaat.kritieke_bevindingen.length > 0) {
      y += 14;
      doc.rect(MARGIN, y, CONTENT_W, 24).fill(PAARS);
      doc.fillColor('white').font('Helvetica-Bold').fontSize(12)
        .text('⚡ Kritieke bevindingen', MARGIN + 8, y + 6, { width: CONTENT_W - 16 });
      y += 28;

      for (const bev of resultaat.kritieke_bevindingen) {
        y = checkPageBreak(doc, y, 60);
        doc.fillColor(PAARS).font('Helvetica-Bold').fontSize(10)
          .text(bev.titel, MARGIN + 4, y, { width: CONTENT_W - 8 });
        y += textHeight(doc, bev.titel, { width: CONTENT_W - 8 }) + 2;
        doc.fillColor('#374151').font('Helvetica').fontSize(9)
          .text(bev.uitleg, MARGIN + 4, y, { width: CONTENT_W - 8 });
        y += textHeight(doc, bev.uitleg, { width: CONTENT_W - 8 }) + 2;
        doc.fillColor(GRIJS).font('Helvetica').fontSize(8)
          .text(bev.regel, MARGIN + 4, y, { width: CONTENT_W - 8 });
        y += 18;
      }
      y += 4;
    }

    // ── Sectietitel fouten ───────────────────────────────────
    y += 10;
    doc.fillColor(DONKERBLAUW).font('Helvetica-Bold').fontSize(14)
      .text('Fouten per schade', MARGIN, y, { width: CONTENT_W });
    y += 24;

    // ── Per schade ───────────────────────────────────────────
    for (const schade of resultaat.schades) {
      y = checkPageBreak(doc, y, 60);

      // Schade header balk
      doc.rect(MARGIN, y, CONTENT_W, 26).fill(DONKERBLAUW);
      doc.fillColor('white').font('Helvetica-Bold').fontSize(11)
        .text(schade.schadenummer, MARGIN + 8, y + 4, { width: CONTENT_W / 2 });
      doc.fillColor('white').font('Helvetica').fontSize(8)
        .text(schade.ruimte_omschrijving, MARGIN + 8, y + 16, { width: CONTENT_W / 2 });
      if (schade.schade_totaal_euro !== null) {
        doc.fillColor('#FCA5A5').font('Helvetica-Bold').fontSize(10)
          .text(`Gemist: ${euro(schade.schade_totaal_euro)}`, MARGIN, y + 8, { width: CONTENT_W - 8, align: 'right' });
      }
      y += 30;

      // Fouten in deze schade
      for (const fout of (schade as Schade).fouten) {
        y = checkPageBreak(doc, y, 80);

        // Accent-lijn links
        const foutStartY = y;
        const kleur = fout.type === 'fout' ? ROOD : GOUD;

        // Titel + bedrag
        doc.fillColor(DONKERBLAUW).font('Helvetica-Bold').fontSize(10)
          .text(fout.titel, MARGIN + 10, y, { width: CONTENT_W - 100 });
        if (fout.impact_euro !== null) {
          doc.fillColor(ROOD).font('Helvetica-Bold').fontSize(10)
            .text(euro(fout.impact_euro), MARGIN, y, { width: CONTENT_W, align: 'right' });
        }
        y += textHeight(doc, fout.titel, { width: CONTENT_W - 100 }) + 4;

        // Uitleg
        doc.fillColor('#374151').font('Helvetica').fontSize(9)
          .text(fout.uitleg, MARGIN + 10, y, { width: CONTENT_W - 10 });
        y += textHeight(doc, fout.uitleg, { width: CONTENT_W - 10 }) + 4;

        // Onderbouwing (cursief)
        if (fout.impact_onderbouwing) {
          doc.fillColor(GRIJS).font('Helvetica-Oblique').fontSize(8)
            .text(fout.impact_onderbouwing, MARGIN + 10, y, { width: CONTENT_W - 10 });
          y += textHeight(doc, fout.impact_onderbouwing, { width: CONTENT_W - 10 }) + 3;
        }

        // Regel + zienswijze tag
        doc.fillColor(GRIJS).font('Helvetica').fontSize(8)
          .text(fout.regel, MARGIN + 10, y, { width: CONTENT_W - 10 });
        y += 12;
        if (fout.zienswijze_kansrijk) {
          doc.fillColor(GROEN).font('Helvetica-Bold').fontSize(8)
            .text('✓ Kansrijk voor zienswijze', MARGIN + 10, y, { width: CONTENT_W - 10 });
          y += 12;
        }

        // Teken accent-lijn nu we de hoogte weten
        doc.rect(MARGIN, foutStartY, 3, y - foutStartY).fill(kleur);
        y += 10;
      }

      y += 8;
    }

    // ── Totaalblok ───────────────────────────────────────────
    if (resultaat.totale_gemiste_vergoeding) {
      y = checkPageBreak(doc, y, 60);
      y += 10;
      doc.rect(MARGIN, y, CONTENT_W, 50).fill(DONKERBLAUW);
      doc.fillColor('white').font('Helvetica').fontSize(10)
        .text('Totaal geschatte gemiste vergoeding (incl. BTW)', MARGIN + 12, y + 10, { width: CONTENT_W - 20 });
      doc.fillColor(GOUD).font('Helvetica-Bold').fontSize(22)
        .text(euro(resultaat.totale_gemiste_vergoeding), MARGIN, y + 20, { width: CONTENT_W - 12, align: 'right' });
      y += 62;
    }

    // ── Zienswijze CTA ───────────────────────────────────────
    y = checkPageBreak(doc, y, 110);
    y += 14;

    // Kader met lichte achtergrond
    const ctaH = 90;
    doc.rect(MARGIN, y, CONTENT_W, ctaH).fill('#EFF6FF');
    doc.rect(MARGIN, y, 4, ctaH).fill('#1D4ED8');

    doc.fillColor('#1E3A5F').font('Helvetica-Bold').fontSize(10)
      .text('Wilt u dat wij het zienswijzeproces voor u in gang zetten?', MARGIN + 14, y + 10, { width: CONTENT_W - 24 });

    doc.fillColor('#374151').font('Helvetica').fontSize(8.5)
      .text(
        'BevingsAdvies Groningen werkt samen met gespecialiseerde juridische partners die ervaring hebben met aardbevingsschadedossiers in Groningen. Wij kunnen namens u — zonder extra kosten — het zienswijzeproces opstarten op basis van de fouten die in dit rapport zijn gevonden.',
        MARGIN + 14, y + 26, { width: CONTENT_W - 24 }
      );

    doc.fillColor('#1D4ED8').font('Helvetica-Bold').fontSize(8.5)
      .text(
        'Reageer op dit rapport via info@bevingsadvies.nl of bel ons op 050 – 000 0000 om vrijblijvend te bespreken wat wij voor u kunnen betekenen.',
        MARGIN + 14, y + 68, { width: CONTENT_W - 24 }
      );

    y += ctaH + 20;

    // ── Footer ───────────────────────────────────────────────
    y += 20;
    // Alleen tekenen als de footer op de huidige pagina past (geen overflow → geen nieuwe paginabreak)
    if (y + 25 <= doc.page.height - 10) {
      doc.rect(0, y, PAGE_W, 1).fill('#E5E7EB');
      y += 6;
      doc.fillColor(GRIJS).font('Helvetica').fontSize(7.5)
        .text(
          'Onafhankelijk adviesbureau. Niet gelieerd aan enige beoordelende of uitvoerende partij in het schadeherstelproces.',
          MARGIN, y, { width: CONTENT_W, align: 'center', lineBreak: false }
        );
      y += 11;
      doc.fillColor(GRIJS).font('Helvetica').fontSize(7.5)
        .text(
          `Gegenereerd op ${new Date().toLocaleDateString('nl-NL')} | BevingsAdvies Groningen`,
          MARGIN, y, { width: CONTENT_W, align: 'center', lineBreak: false }
        );
    }

    doc.end();
  });

  const pdfBuffer = Buffer.concat(chunks);
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="BevingsAdvies-Rapport-${id.slice(0, 8)}.pdf"`,
      'Content-Length': String(pdfBuffer.length),
    },
  });
}
