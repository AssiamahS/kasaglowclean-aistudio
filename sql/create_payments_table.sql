-- Reference only: functions/payments/_lib.ts creates this table lazily on
-- first payment. Run manually with `wrangler d1 execute kasaglow-submissions
-- --remote --file sql/create_payments_table.sql` if you want it up front.
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER,
  appointment_id INTEGER,
  provider TEXT NOT NULL,
  provider_ref TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  created_at TEXT DEFAULT (datetime('now'))
);
