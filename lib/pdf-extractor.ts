export interface PdfData {
  text: string;
  nPages: number;
}

export async function extractPdfText(buffer: Buffer): Promise<PdfData> {
  // Use pdf-parse v1 (simple, no worker complications in Next.js)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(buffer);
  return {
    text: data.text as string,
    nPages: data.numpages as number,
  };
}

// Identify 1-based page indices in the text stream that contain photo markers
function identificeerFotoPaginaIndices(fullText: string): number[] {
  // pdf-parse v1 concatenates all text; we look for "Foto N" patterns
  // and estimate page numbers by counting form-feed characters or page breaks
  const pages = fullText.split(/\f/);
  const fotoPages: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (/Foto\s+\d+/i.test(pages[i])) {
      fotoPages.push(i + 1);
    }
  }
  return fotoPages;
}

export async function renderFotoPaginasNaarImages(
  buffer: Buffer,
  maxPages = 8
): Promise<Array<{ pageIndex: number; base64: string; mediaType: string }>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    const fotoIndices = identificeerFotoPaginaIndices(data.text as string).slice(0, maxPages);
    if (fotoIndices.length === 0) return [];

    // Try node-canvas rendering if available
    let createCanvas: ((w: number, h: number) => { getContext: (t: string) => unknown; toBuffer: (t: string) => Buffer }) | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      createCanvas = require('canvas').createCanvas;
    } catch {
      return [];
    }
    if (!createCanvas) return [];

    // Load pdfjs without worker for rendering
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = false;

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdfDoc = await loadingTask.promise;
    const results: Array<{ pageIndex: number; base64: string; mediaType: string }> = [];

    for (const pageIdx of fotoIndices) {
      try {
        const page = await pdfDoc.getPage(pageIdx);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (page.render as any)({ canvasContext: context, viewport }).promise;
        results.push({ pageIndex: pageIdx, base64: canvas.toBuffer('image/jpeg').toString('base64'), mediaType: 'image/jpeg' });
      } catch {
        // skip
      }
    }
    await pdfDoc.destroy();
    return results;
  } catch (err) {
    console.warn('PDF image rendering failed (foto-rendering overgeslagen):', err);
    return [];
  }
}
