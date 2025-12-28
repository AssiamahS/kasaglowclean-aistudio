export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const orderID = url.searchParams.get('orderID');

  const auth = Buffer.from(env.PAYPAL_CLIENT_ID + ':' + env.PAYPAL_SECRET).toString('base64');

  const response = await fetch(
    `https://api-m.${env.PAYPAL_ENV}.paypal.com/v2/checkout/orders/${orderID}/capture`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    }
  );

  const data = await response.json();
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}
