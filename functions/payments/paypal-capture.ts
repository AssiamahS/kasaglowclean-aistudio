import { json, recordPayment, toId } from './_lib';

export async function onRequestPost({ request, env }: any) {
  const url = new URL(request.url);
  const orderID = url.searchParams.get('orderID');
  if (!orderID) return json({ error: 'Missing orderID' }, 400);
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_SECRET) {
    return json({ error: 'PayPal is not configured' }, 503);
  }

  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`);
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

  const data: any = await response.json();

  if (response.ok && data.status === 'COMPLETED') {
    const unit = data.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    const [clientId, appointmentId] = String(capture?.custom_id || unit?.custom_id || ':').split(':');
    const amountCents = Math.round(parseFloat(capture?.amount?.value || '0') * 100);
    await recordPayment(env.DB, {
      clientId: toId(clientId),
      appointmentId: toId(appointmentId),
      provider: 'paypal',
      providerRef: capture?.id || data.id,
      amountCents,
    });
  }

  return json(data, response.ok ? 200 : 502);
}
