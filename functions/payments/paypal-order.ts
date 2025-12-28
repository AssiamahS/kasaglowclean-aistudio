import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequestPost: PagesFunction = async ({ env }) => {
  const auth = Buffer.from(env.PAYPAL_CLIENT_ID + ':' + env.PAYPAL_SECRET).toString('base64');

  const response = await fetch(`https://api-m.${env.PAYPAL_ENV}.paypal.com/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: 'USD', value: '35.00' } }]
    })
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};
