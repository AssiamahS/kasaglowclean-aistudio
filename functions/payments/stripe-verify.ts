import Stripe from 'stripe';
import type { PagesFunction } from '@cloudflare/workers-types';
import { json, recordPayment, toId } from './_lib';

// Called by the /payment-success page. Verifies the checkout session with
// Stripe server-side (no webhook needed) and records the payment in D1.
export const onRequestGet: PagesFunction = async ({ request, env }: any) => {
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Stripe not configured' }, 503);

  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId) return json({ error: 'Missing session_id' }, 400);

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== 'paid') {
    return json({ paid: false, status: session.payment_status });
  }

  await recordPayment(env.DB, {
    clientId: toId(session.metadata?.client_id),
    appointmentId: toId(session.metadata?.appointment_id),
    provider: 'stripe',
    providerRef: session.id,
    amountCents: session.amount_total ?? 0,
  });

  return json({ paid: true, amountCents: session.amount_total });
};
