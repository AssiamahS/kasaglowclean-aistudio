-- Seed jobs for kasaglow D1

DELETE FROM jobs;

INSERT INTO jobs (title, location, description, type, posted_at, active) VALUES
('Residential Cleaner', 'New Jersey', 'Provide recurring residential cleaning services. Reliable transportation required and attention to detail.', 'Part Time', '2025-10-31', 1),
('Commercial Cleaner', 'New Jersey', 'Office and commercial space cleaning. Evenings and flexible hours available.', 'Full Time', '2025-10-27', 1),
('Move-In / Move-Out Specialist', 'New Jersey', 'Deep clean homes for move-ins and move-outs. Experience with heavy duty cleaning preferred.', 'Full Time', '2025-10-31', 1);
