# KasaGlow Cleaning Services Website

Professional cleaning services website with admin panel for managing customer inquiries.

## Features

- **Full Website**: Hero section, services, about, locations, contact form
- **Admin Dashboard**: View and manage customer submissions
- **Persistent Storage**: Cloudflare D1 database for submissions
- **Email Notifications**: Optional Resend integration
- **Responsive Design**: Works on all devices
- **Secure Admin**: Login-protected admin panel

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Cloudflare Pages Functions
- **Database**: Cloudflare D1 (SQL)
- **Email**: Resend API (optional)
- **Hosting**: Cloudflare Pages

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Admin Access

- **URL**: `/admin`
- **Username**: `admin`
- **Password**: `password123`

**Note**: Change the password in `components/Login.tsx` (line 19) before deploying to production.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions to Cloudflare Pages.

## Video Files

The `public/videos/` folder contains compressed video files optimized for web delivery:
- `garage-cleaning.mp4` (140KB)
- `hero-home-cleaning.mp4` (8MB)
- `deep-cleaning.mp4` (1.9MB)
- `office-cleaning.mp4` (22MB)
- `vacuum-cleaning.mp4` (666KB)
- `garage-cleaning-compressed.mp4` (267KB)

All videos are in `.mp4` format and safe for GitHub push (under 100MB limit).

## Project Structure

```
├── components/           # React components
│   ├── AdminView.tsx    # Admin dashboard
│   ├── LeadCapture.tsx  # Contact form
│   └── ...
├── functions/           # Cloudflare Pages Functions (API)
│   ├── submit-lead.ts   # Handle form submissions
│   └── api/submissions.ts  # Admin API endpoints
├── public/             # Static assets
├── schema.sql          # Database schema
└── wrangler.toml       # Cloudflare configuration
```

## How It Works

### Form Submission Flow
1. Customer fills out contact form
2. Form POSTs to `/submit-lead`
3. Function saves to D1 database
4. (Optional) Sends email notification
5. Admin views submission in dashboard

### Admin Dashboard
1. Navigate to `/admin` and login
2. Dashboard fetches from `/api/submissions`
3. View, mark as read, or delete submissions

## API Endpoints

- `POST /submit-lead` - Submit customer inquiry
- `GET /api/submissions` - Fetch all submissions
- `PUT /api/submissions` - Mark as read
- `DELETE /api/submissions?id=X` - Delete submission

## Support

For issues:
1. Check Cloudflare Pages logs
2. Check browser console
3. Test database: `wrangler d1 execute kasaglow-submissions --command "SELECT * FROM submissions"`
