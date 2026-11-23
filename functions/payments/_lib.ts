// Shared helpers for the payments endpoints.

export const DEFAULT_DEPOSIT_CENTS = 3500;

export function depositCents(env: any): number {
  const n = parseInt(env.DEPOSIT_CENTS, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DEPOSIT_CENTS;
}

// D1 has no migration runner in this project, so the payments table is
// created on first use instead of requiring a manual wrangler d1 execute.
export async function ensurePaymentsTable(db: any): Promise<void> {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      appointment_id INTEGER,
      provider TEXT NOT NULL,
      provider_ref TEXT NOT NULL UNIQUE,
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'paid',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();
}

export async function recordPayment(db: any, p: {
  clientId?: number | null;
  appointmentId?: number | null;
  provider: 'stripe' | 'paypal';
  providerRef: string;
  amountCents: number;
}): Promise<void> {
  await ensurePaymentsTable(db);
  // UNIQUE(provider_ref) + OR IGNORE makes recording idempotent, so a
  // refreshed success page can't double-log a payment.
  await db.prepare(`
    INSERT OR IGNORE INTO payments (client_id, appointment_id, provider, provider_ref, amount_cents)
    VALUES (?, ?, ?, ?, ?)
  `).bind(p.clientId ?? null, p.appointmentId ?? null, p.provider, p.providerRef, p.amountCents).run();

  if (p.appointmentId) {
    await db.prepare(`UPDATE appointments SET status = 'deposit_paid' WHERE id = ? AND status = 'scheduled'`)
      .bind(p.appointmentId).run();
  }
}

// The key was saved in the Pages dashboard under the name "Stripe", not
// STRIPE_SECRET_KEY, so checkout 503'd with a key sitting right there.
// Accept both names. Only a secret/restricted key can create sessions —
// a pk_ pasted by mistake is reported as such instead of a vague 401.
export function stripeKey(env: any): { key?: string; problem?: string } {
  const raw = String(env.STRIPE_SECRET_KEY || env.Stripe || env.STRIPE || '').trim();
  if (!raw) return { problem: 'missing' };
  if (!/^(sk|rk)_(live|test)_/.test(raw)) {
    return { problem: raw.startsWith('pk_') ? 'publishable key set, secret key needed' : 'not a stripe secret key' };
  }
  return { key: raw };
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function toId(v: unknown): number | null {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
