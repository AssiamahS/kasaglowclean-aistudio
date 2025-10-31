# Deployment Guide - KasaGlowClean

## Quick Setup for Fully Working Demo

### Step 1: Deploy Backend to Railway (FREE - 5 minutes)

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select **`AssiamahS/kasaglowclean`**
5. Railway will auto-detect Node.js
6. Click **"Add Variables"** and add:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://kasaglowclean.pages.dev
   DATABASE_URL=file:./prod.db
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   EMAIL_FROM=noreply@kasaglowclean.com
   BUSINESS_NAME=KasaGlowClean
   BUSINESS_EMAIL=info@kasaglowclean.com
   BUSINESS_PHONE=+1-555-0100
   BUFFER_TIME_MINUTES=30
   ```

7. Under **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && node seed.js`
   - **Start Command**: `node src/server.js`

8. Click **"Deploy"**
9. **Copy your Railway URL** (looks like: `https://kasaglowclean-backend-production-xxxx.up.railway.app`)

### Step 2: Deploy Frontend to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Select **`AssiamahS/kasaglowclean`** (NOT kasaglowclean-aistudio!)
4. Configure build:
   - **Project name**: `kasaglowclean`
   - **Production branch**: `main`
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`

5. Add **Environment variable**:
   - Variable name: `VITE_API_URL`
   - Value: `https://YOUR-RAILWAY-URL.up.railway.app/api` (replace with your Railway URL from Step 1)

6. Click **"Save and Deploy"**

### Step 3: Test Your Demo!

Once deployed:
- **Frontend**: `https://kasaglowclean.pages.dev`
- **Backend**: Your Railway URL

The demo will have:
- ✅ 6 cleaning services ready to book
- ✅ Business hours configured (Mon-Fri 8AM-6PM, Sat 9AM-5PM)
- ✅ Admin login: username `admin`, password `admin123`
- ✅ Full booking system working
- ✅ Email confirmations (if you configure SMTP)

## Alternative: Deploy Backend to Render (Also FREE)

1. Go to [Render.com](https://render.com)
2. **New** → **Web Service**
3. Connect GitHub repo: `AssiamahS/kasaglowclean`
4. Configure:
   - **Name**: `kasaglowclean-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && node seed.js`
   - **Start Command**: `node src/server.js`
5. Add environment variables (same as Railway above)
6. Click **"Create Web Service"**

## Troubleshooting

### Backend not starting?
- Check Railway/Render logs
- Make sure `DATABASE_URL` is set
- Ensure seed script ran successfully

### Frontend can't reach backend?
- Check `VITE_API_URL` environment variable in Cloudflare Pages
- Make sure it includes `/api` at the end
- Check CORS settings - backend should allow your Cloudflare Pages URL

### No services showing?
- Check if seed script ran (look at Railway logs)
- Manually run: `node seed.js` in Railway CLI

## Custom Domain (Optional)

### Cloudflare Pages:
1. Go to your Pages project → **Custom domains**
2. Add your domain (e.g., `www.kasaglowclean.com`)
3. Follow DNS instructions

### Railway:
1. Go to your service → **Settings** → **Domains**
2. Add custom domain
3. Update DNS with CNAME

## Support

Need help? Check the main README.md or open an issue on GitHub.
