import { depositCents, json } from './_lib';

export async function onRequestGet({ env }: any) {
  return json({ depositCents: depositCents(env) });
}
