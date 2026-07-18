import type { PagesFunction } from '@cloudflare/workers-types';
import { depositCents, json, toId } from './_lib';

export const onRequestPost: PagesFunction = async ({ request, env }: any) => {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_SECRET) {
    return json({ error: 'PayPal is not enabled yet. Please use card payment or contact us.' }, 503);
  }

  const body = await request.json().catch(() => ({}));
  const clientId = toId(body.clientId);
  const appointmentId = toId(body.appointmentId);
  const amount = (depositCents(env) / 100).toFixed(2);

  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`);
  const response = await fetch(`https://api-m.${env.PAYPAL_ENV}.paypal.com/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'USD', value: amount },
        // custom_id travels through to the capture response so the payment
        // can be attributed to the booking without extra state.
        custom_id: `${clientId ?? ''}:${appointmentId ?? ''}`,
        description: 'KasaGlow Cleaning — Booking Deposit'
      }]
    })
  });

  const data = await response.json();
  return json(data, response.ok ? 200 : 502);
};
