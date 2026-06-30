import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { getAnalyse } from '@/lib/database';

// TODO: Replace with production key before going live
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_VERVANG_MET_JOUW_STRIPE_TEST_KEY', {
  apiVersion: '2026-06-24.dahlia',
});

export async function POST(request: NextRequest) {
  const { analyseId } = await request.json();

  const analyse = getAnalyse(analyseId);
  if (!analyse) {
    return Response.json({ error: 'Analyse niet gevonden.' }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${request.headers.get('host')}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['ideal', 'card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'BevingsAdvies Groningen — Volledig foutrapport',
              description: 'Inclusief alle bevindingen, financiële impact en onderbouwing per schade.',
            },
            unit_amount: 25000, // €250,00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/rapport/${analyseId}?betaald=true`,
      cancel_url: `${baseUrl}/resultaat/${analyseId}`,
      metadata: { analyseId, type: 'rapport' },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Stripe fout:', err);
    return Response.json({ error: 'Betaalsessie kon niet worden aangemaakt.' }, { status: 500 });
  }
}
