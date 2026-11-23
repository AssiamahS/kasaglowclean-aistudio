import Stripe from 'stripe';
import type { PagesFunction } from '@cloudflare/workers-types';
import { depositCents, json, stripeKey, toId } from './_lib';

export const onRequestPost: PagesFunction = async ({ request, env }: any) => {
  const { key, problem } = stripeKey(env);
  if (!key) {
    console.error('stripe-checkout: key problem:', problem);
    return json({ error: 'Card payments are not enabled yet. Please use PayPal or contact us.', reason: problem }, 503);
  }

  const body = await request.json().catch(() => ({}));
  const clientId = toId(body.clientId);
  const appointmentId = toId(body.appointmentId);
  const site = env.SITE_URL || 'https://kasaglowclean.com';

  const stripe = new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  // A revoked/wrong-mode key throws here; without the catch the client gets
  // an opaque 500 and the button just dies.
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'USD',
            product_data: { name: 'KasaGlow Cleaning — Booking Deposit' },
            unit_amount: depositCents(env)
          },
          quantity: 1
        }
      ],
      client_reference_id: clientId ? String(clientId) : undefined,
      metadata: {
        client_id: clientId ? String(clientId) : '',
        appointment_id: appointmentId ? String(appointmentId) : ''
      },
      success_url: `${site}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/payment-cancel`
    });

    return json({ url: session.url });
  } catch (err: any) {
    console.error('stripe-checkout failed:', err?.type, err?.code, err?.message);
    return json({ error: 'Card payments are temporarily unavailable. Please use PayPal or contact us.', reason: err?.code || err?.type || 'stripe_error' }, 502);
  }
};
