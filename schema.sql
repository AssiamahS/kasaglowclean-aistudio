-- Cloudflare D1 Database Schema for KasaGlow Submissions

DROP TABLE IF EXISTS submissions;

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  message TEXT,
  resume_name TEXT,
  resume_data TEXT,
  resume_url TEXT,
  timestamp TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_timestamp ON submissions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_read ON submissions(read);

-- Jobs table for site job listings
DROP TABLE IF EXISTS jobs;
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  location TEXT,
  description TEXT,
  type TEXT,
  posted_at TEXT DEFAULT (datetime('now')),
  active INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(active);

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

-- Appointments Table
-- Stores scheduled cleaning appointments for clients
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clientId TEXT NOT NULL,
  dateTime TEXT NOT NULL,
  service TEXT,
  status TEXT DEFAULT 'upcoming',
  notes TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_appointments_dateTime ON appointments(dateTime);
CREATE INDEX IF NOT EXISTS idx_appointments_clientId ON appointments(clientId);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
