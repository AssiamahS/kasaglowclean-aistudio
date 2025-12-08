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
