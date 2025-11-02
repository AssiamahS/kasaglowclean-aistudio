-- Cloudflare D1 Database Schema for KasaGlow Submissions

DROP TABLE IF EXISTS submissions;

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  message TEXT,
  timestamp TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_timestamp ON submissions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_read ON submissions(read);
