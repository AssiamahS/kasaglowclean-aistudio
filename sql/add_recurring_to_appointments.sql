-- Adds recurring support to existing appointments table.
-- Safe to run on an already-initialised D1 database.
-- Usage:
--   wrangler d1 execute kasaglow-submissions --file=sql/add_recurring_to_appointments.sql

ALTER TABLE appointments ADD COLUMN frequency TEXT DEFAULT '';
ALTER TABLE appointments ADD COLUMN recurring_parent_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_parent ON appointments(recurring_parent_id);
