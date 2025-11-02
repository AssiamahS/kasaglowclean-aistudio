# KasaGlow Cleaning Services - Deployment Guide

This guide will help you deploy the website with the admin panel to Cloudflare Pages with D1 database.

## Prerequisites

1. A Cloudflare account (free tier works)
2. Wrangler CLI installed: `npm install -g wrangler`
3. Git repository pushed to GitHub

## Step 1: Install Dependencies

```bash
cd /Users/djsly/Code/kasaglow-cleaning-services-website-v4/kasaglowclean-aistudio
npm install
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

## Step 3: Create D1 Database

```bash
wrangler d1 create kasaglow-submissions
```

This will output a database ID. Copy it and update `wrangler.toml`:
- Replace `YOUR_DATABASE_ID` with the actual database ID

## Step 4: Initialize Database Schema

```bash
wrangler d1 execute kasaglow-submissions --file=./schema.sql
```

## Step 5: Set Environment Variables (Optional - for email notifications)

If you want email notifications via Resend:

```bash
wrangler secret put RESEND_API_KEY
```

Then paste your Resend API key when prompted.

## Step 6: Build the Project

```bash
npm run build
```

## Step 7: Deploy to Cloudflare Pages

### Option A: Via Wrangler CLI

```bash
wrangler pages deploy dist
```

### Option B: Via Cloudflare Dashboard

1. Go to Cloudflare Dashboard > Pages
2. Click "Create a project"
3. Connect your GitHub repository
4. Set build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Add environment variable bindings:
   - Go to Settings > Functions
   - Add D1 database binding: `DB` -> `kasaglow-submissions`
6. Click "Save and Deploy"

## Step 8: Test the Deployment

1. Visit your deployed site
2. Submit a test form
3. Go to `/admin` and login with:
   - Username: `admin`
   - Password: `password123`
4. Verify the submission appears in the admin panel

## Updating the Site

When you make changes:

```bash
git add .
git commit -m "Your changes"
git push
```

Cloudflare Pages will automatically redeploy.

## Troubleshooting

### Submissions not appearing in admin

1. Check D1 database is bound correctly
2. Verify database has data:
   ```bash
   wrangler d1 execute kasaglow-submissions --command "SELECT * FROM submissions"
   ```

### Functions not working

1. Make sure `functions/` folder is in the root
2. Check Cloudflare Pages Functions logs in dashboard

### Large video files failing to push

If you get errors about file size when pushing to GitHub:

```bash
# Remove large video files
rm public/videos/garage-cleaning.mov
rm public/videos/hero-home-cleaning.mov

# Or use Git LFS
git lfs install
git lfs track "*.mov"
git add .gitattributes
```

## Production Checklist

- [ ] Database created and initialized
- [ ] wrangler.toml updated with correct database ID
- [ ] Email updated in `functions/submit-lead.ts` (line 39)
- [ ] Admin password changed (optional - update Login.tsx line 19)
- [ ] Site deployed and accessible
- [ ] Form submissions working
- [ ] Admin panel accessible and showing submissions
- [ ] (Optional) Resend API key configured for email notifications

## Support

For issues, check:
- Cloudflare Pages dashboard logs
- Browser console for frontend errors
- D1 database contents using wrangler CLI
