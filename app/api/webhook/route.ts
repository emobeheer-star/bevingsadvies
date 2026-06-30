import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { markeerBetaald, slaUpsellOp } from '@/lib/database';

// TODO: Replace with production key before going live
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_VERVANG_MET_JOUW_STRIPE_TEST_KEY', {
  apiVersion: '2026-06-24.dahlia',
});

// TODO: Set STRIPE_WEBHOOK_SECRET in .env.local
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook verificatie mislukt:', err);
    return new Response('Webhook fout', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { analyseId, type, upsellType } = session.metadata ?? {};

    if (!analyseId) return new Response('OK');

    if (type === 'rapport') {
      await markeerBetaald(analyseId);
    } else if (type === 'upsell' && upsellType) {
      await slaUpsellOp(analyseId, upsellType);
    }
  }

  return new Response('OK');
}
