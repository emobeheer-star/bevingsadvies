import { NextRequest } from 'next/server';
import { getAnalyse, markeerBetaald } from '@/lib/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const testMode = request.nextUrl.searchParams.get('test') === 'true';

  const analyse = await getAnalyse(id);

  if (!analyse) {
    return Response.json({ error: 'Rapport niet gevonden.' }, { status: 404 });
  }

  // In test mode, auto-mark as paid so the full report is visible
  if (testMode && !analyse.betaald) {
    await markeerBetaald(id);
  }

  if (!analyse.betaald && !testMode) {
    return Response.json({ error: 'Dit rapport is nog niet vrijgegeven. Betaling vereist.' }, { status: 402 });
  }

  return Response.json({
    resultaat: JSON.parse(analyse.resultaat_json),
    upsell_gekozen: analyse.upsell_gekozen,
  });
}
