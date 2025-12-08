-- Client Management Table
-- Stores full client intake information including tier/scale

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  address TEXT,
  cityStateZip TEXT,
  phone TEXT,
  email TEXT,
  propertyType TEXT,
  services TEXT,           -- JSON string array of services selected
  otherService TEXT,
  frequency TEXT,
  customFrequency TEXT,
  preferredDates TEXT,
  specialInstructions TEXT,
  rateQuoted TEXT,
  depositAmount TEXT,
  paymentMethod TEXT,
  balanceDue TEXT,
  tier TEXT DEFAULT 'New', -- Client scale: New / Returning / VIP / Paused
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_createdAt ON clients(createdAt);
CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(tier);
