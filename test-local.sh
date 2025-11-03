#!/bin/bash

# Local Testing Script for KasaGlow Employee Tab
# This script sets up and runs the local development environment

echo "🧹 KasaGlow Local Testing Setup"
echo "================================"

# Step 1: Build the project
echo ""
echo "📦 Building project..."
npm run build

# Step 2: Initialize local D1 database
echo ""
echo "🗄️  Setting up local database..."
npx wrangler d1 execute kasaglow-submissions --local --file=schema.sql

# Step 3: Seed with job data
echo ""
echo "🌱 Seeding job listings..."
npx wrangler d1 execute kasaglow-submissions --local --file=sql/seed_jobs.sql

# Step 4: Start dev server
echo ""
echo "🚀 Starting local dev server on http://localhost:8788"
echo ""
echo "✅ Test URLs:"
echo "   - Employee Tab: http://localhost:8788/#/careers"
echo "   - Jobs API: http://localhost:8788/api/jobs"
echo "   - Admin Panel: http://localhost:8788/#/admin"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npx wrangler pages dev dist --port 8788
