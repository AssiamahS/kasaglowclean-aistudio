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

-- Clients table (Admin + Intake Form)
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city_state_zip TEXT,
  tier TEXT DEFAULT 'New',
  services TEXT,
  frequency TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Appointments table (Calendar + Booking)
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  date_time TEXT NOT NULL,
  service TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date_time);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
