-- Migration for Google Calendar integration
-- Run this against your production D1 database

-- Add googleEventId column to appointments table
ALTER TABLE appointments ADD COLUMN googleEventId TEXT;

-- Create admin_settings table for storing Google refresh tokens
CREATE TABLE IF NOT EXISTS admin_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
