# White-Label Guide — ship this site for a new client in under an hour

This repo is a sellable template: booking + deposit payments + admin panel +
email confirmations on Cloudflare Pages (free tier). Everything brand-specific
lives in **four places**. Nothing else needs editing.

## The four files

| What | Where | Notes |
|---|---|---|
| Name, phone, email, logo path, tagline, service area | `src/brand.ts` | The single source of truth. Components, emails, and legal pages all read from it. |
| Colors + font | `tailwind.config.js` → `theme.extend.colors` | `primary` / `secondary` / `accent` drive the whole palette. Swap 3 hex codes → new look. |
| Services, pricing, testimonials, process steps, locations | `src/constants.ts` | Service list = the vertical. Cleaning vs barbershop is mostly this file. |
| Images & logo files | `public/images/`, `public/videos/` | Drop in the client's logo + photos, keep the same filenames or update `brand.ts`. |

## Clone checklist (per client)

1. `git clone` this repo → new private repo named after the client.
2. Edit `src/brand.ts` (5 min) — name, phone, email, domain, logo, area.
3. Swap `tailwind.config.js` colors to the client's palette (2 min).
4. Replace `src/constants.ts` services/testimonials for their business (10 min).
   For a barbershop, start from `src/brands/barbershop.example.ts`.
5. Drop their logo/photos into `public/images/` (5 min).
6. `npm install && npm run build` — verify it builds.
7. Cloudflare: create a new Pages project from the repo, create a new D1
   database (`wrangler d1 create <client>-submissions`), put its id in
   `wrangler.toml`, and set secrets (see wrangler.toml comments):
   `ADMIN_SECRET`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY` (client's Stripe!),
   `PAYPAL_CLIENT_ID`/`PAYPAL_SECRET`, build var `VITE_PAYPAL_CLIENT_ID`.
8. Point the client's domain at Pages. Done.

**Payments go to the client's own Stripe/PayPal** — you never touch their
money. You charge for the build + monthly care, they collect their deposits.

## Vertical notes

- **Cleaning** (this repo's default): deposit secures the appointment.
- **Barbershop**: shorter appointment durations (30–60 min in
  `constants.ts` `duration`), `brand.ts` `bookingNoun: 'appointment'`,
  `workerNoun: 'barber'`, services = cuts/fades/beard/kids. Recurring
  frequency options still work (weekly cut = recurring revenue).
- Any appointment business fits: detailers, lash techs, mobile groomers,
  pressure washing, landscaping.

## What's deliberately NOT multi-tenant

One repo = one client = one Pages project = one D1 database. Isolation is the
feature: a client can never see another client's data, and you can hand the
repo over if they ever want to leave. Selling point, not a limitation.
