# Local Testing Guide

## Option 1: Use the Preview Deployment (Easiest)

Your current deployment is live at: **https://aff041b7.kasaglowclean-aistudio.pages.dev**

This is a perfect testing environment before pushing to GitHub because:
- ✅ Connected to your real D1 database
- ✅ All API endpoints working
- ✅ Exactly matches production

**Test the employee tab:**
1. Visit: https://aff041b7.kasaglowclean-aistudio.pages.dev/#/careers
2. You should see 3 job listings
3. Click "Apply" on any job
4. Fill out the form and submit
5. Check the admin panel to see the submission

## Option 2: Local Development with Wrangler (Best for iterating)

### Step 1: Build the project
```bash
npm run build
```

### Step 2: Seed LOCAL D1 database
```bash
# Create local schema
npx wrangler d1 execute kasaglow-submissions --local --file=schema.sql

# Seed local jobs
npx wrangler d1 execute kasaglow-submissions --local --file=sql/seed_jobs.sql
```

### Step 3: Start local dev server
```bash
npx wrangler pages dev dist --port 8788
```

### Step 4: Test locally
- Visit: http://localhost:8788/#/careers
- Test the jobs API: http://localhost:8788/api/jobs

**Note:** The local D1 database is separate from production, so you need to seed it locally.

## Option 3: Run a Quick Deploy Test

Before pushing to GitHub, deploy to preview:

```bash
npm run build
npx wrangler pages deploy dist --project-name=kasaglowclean-aistudio --commit-dirty=true
```

This creates a new preview URL you can test without affecting production.

## Testing Checklist

- [ ] Jobs page loads at `/#/careers`
- [ ] At least 3 job listings appear
- [ ] "Apply" button opens the application form
- [ ] Form submission works (with and without resume)
- [ ] Success message appears after submission
- [ ] Submission appears in admin panel (`/#/admin`)
- [ ] API endpoints return JSON:
  - `/api/jobs` - Returns job listings
  - `/api/submissions` - Accepts POST requests

## Quick API Tests

```bash
# Test jobs endpoint
curl http://localhost:8788/api/jobs

# Test submission endpoint
curl -X POST http://localhost:8788/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","service":"Cleaner","message":"Test"}'
```
