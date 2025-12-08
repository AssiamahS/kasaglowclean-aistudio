-- Drop existing appointments table if it exists
DROP TABLE IF EXISTS appointments;

-- Recreate appointments table with TEXT clientId (no foreign key constraint)
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clientId TEXT NOT NULL,
  dateTime TEXT NOT NULL,
  service TEXT,
  status TEXT DEFAULT 'upcoming',
  notes TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_appointments_dateTime ON appointments(dateTime);
CREATE INDEX idx_appointments_clientId ON appointments(clientId);
CREATE INDEX idx_appointments_status ON appointments(status);
