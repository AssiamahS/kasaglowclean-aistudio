-- Migrate existing client submissions (non-job-applications) to clients table
-- This gives them the new tier field and full client structure

INSERT INTO clients (name, email, phone, services, frequency, tier, createdAt, updatedAt)
SELECT
  name,
  email,
  phone,
  json_array(service) as services,  -- Convert single service to JSON array
  'One-Time Cleaning' as frequency,  -- Default frequency
  'New' as tier,                     -- All existing clients start as 'New'
  timestamp as createdAt,
  timestamp as updatedAt
FROM submissions
WHERE service NOT IN ('Residential Cleaner', 'Move-In / Move-Out Specialist', 'Commercial Cleaner')
  AND resume_url IS NULL
  AND resume_data IS NULL;
