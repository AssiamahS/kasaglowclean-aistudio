import { depositCents, json } from './_lib';

// The PayPal client id is public (it ships in the SDK script URL), so the
// page reads it from here instead of needing a build-time VITE_ var — set
// the two PayPal secrets and the button appears, no rebuild config.
export async function onRequestGet({ env }: any) {
  const paypalReady = Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_SECRET);
  return json({
    depositCents: depositCents(env),
    paypalClientId: paypalReady ? env.PAYPAL_CLIENT_ID : null,
  });
}
