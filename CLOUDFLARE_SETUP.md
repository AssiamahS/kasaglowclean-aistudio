# 🚀 Cloudflare Pages Setup - 2 Minutes

## Step 1: Create Pages Project (1 minute)

1. **Open this link**: https://dash.cloudflare.com/
2. Click **Workers & Pages** (left sidebar)
3. Click **"Create application"** button (top right)
4. Click **"Pages"** tab
5. Click **"Connect to Git"**
6. Select **`AssiamahS/kasaglowclean`** repository
7. Click **"Begin setup"**

## Step 2: Configure Build Settings

Copy and paste these EXACT settings:

```
Project name: kasaglowclean
Production branch: main
Framework preset: Vite

Build settings:
Build command: npm run build
Build output directory: dist
Root directory (path): frontend
```

**IMPORTANT:** Make sure "Root directory" says `frontend` - this tells Cloudflare to look in the frontend folder!

8. Click **"Save and Deploy"**

⏱️ Wait 2-3 minutes for the build to complete...

## Step 3: Your Site is Live! 🎉

Once deployed, you'll see:
- ✅ URL: `https://kasaglowclean.pages.dev`
- ✅ Landing page with beautiful design
- ✅ Services page

**BUT** - Bookings won't work yet because there's no backend!

## Step 4: Deploy Backend (Optional - 5 minutes)

To make bookings actually work:

### Option A: Railway (Recommended - FREE)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select **`AssiamahS/kasaglowclean`**
5. Railway auto-detects Node.js
6. Under **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
7. Click **"Deploy"**
8. **Copy your Railway URL** (e.g., `https://kasaglowclean-production-xxxx.up.railway.app`)

### Option B: Render (Also FREE)

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect **`AssiamahS/kasaglowclean`**
4. Settings:
   - **Name**: `kasaglowclean-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Click **"Create Web Service"**

## Step 5: Connect Backend to Frontend

Once backend is deployed:

1. Go back to Cloudflare Pages
2. Click your **kasaglowclean** project
3. Go to **Settings** → **Environment variables**
4. Click **"Add variable"**
5. Add:
   - Variable name: `VITE_API_URL`
   - Value: `https://YOUR-RAILWAY-URL/api` (paste your Railway/Render URL + `/api`)
6. Click **"Save"**
7. Go to **Deployments** tab
8. Click **"Retry deployment"** on the latest one

🎉 **Done!** Your full booking system is now live!

---

## 📋 What You Get

- ✅ Professional landing page
- ✅ 6 cleaning services ready to book
- ✅ Calendar with available time slots
- ✅ Booking form with validation
- ✅ Admin dashboard (login: admin / admin123)
- ✅ Email confirmations
- ✅ Customer management

## 🆘 Need Help?

Check the main `DEPLOYMENT.md` file or `README.md` for detailed troubleshooting!

Your local site is still running at http://localhost:5173 if you want to test it first.
