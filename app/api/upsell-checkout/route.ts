import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { getAnalyse } from '@/lib/database';

// TODO: Replace with production key before going live
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_VERVANG_MET_JOUW_STRIPE_TEST_KEY', {
  apiVersion: '2026-06-24.dahlia',
});

const UPSELL_OPTIES = {
  zienswijze: {
    naam: 'BevingsAdvies Groningen — Zienswijze indienen',
    beschrijving: 'Wij stellen de zienswijze op en dienen deze namens u in bij het schadeherstelproces.',
    bedrag: 49500, // €495,00
  },
  zienswijze_bezwaar: {
    naam: 'BevingsAdvies Groningen — Zienswijze + Bezwaar',
    beschrijving: 'Volledige juridische bijstand: zienswijze én bezwaarschrift, inclusief begeleiding.',
    bedrag: 89500, // €895,00
  },
};

export async function POST(request: NextRequest) {
  const { analyseId, upsellType } = await request.json();

  if (!UPSELL_OPTIES[upsellType as keyof typeof UPSELL_OPTIES]) {
    return Response.json({ error: 'Ongeldig upsell type.' }, { status: 400 });
  }

  const analyse = await getAnalyse(analyseId);
  if (!analyse || !analyse.betaald) {
    return Response.json({ error: 'Rapport niet gevonden of nog niet vrijgegeven.' }, { status: 404 });
  }

  const optie = UPSELL_OPTIES[upsellType as keyof typeof UPSELL_OPTIES];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${request.headers.get('host')}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['ideal', 'card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: optie.naam,
              description: optie.beschrijving,
            },
            unit_amount: optie.bedrag,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/rapport/${analyseId}?upsell=${upsellType}&betaald=true`,
      cancel_url: `${baseUrl}/rapport/${analyseId}`,
      metadata: { analyseId, type: 'upsell', upsellType },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Stripe upsell fout:', err);
    return Response.json({ error: 'Betaalsessie kon niet worden aangemaakt.' }, { status: 500 });
  }
}
