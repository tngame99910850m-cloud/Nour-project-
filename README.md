# Nour Boutique — E-commerce & Business Management Platform

A production-ready, mobile-first e-commerce platform and business management system for a small business selling **wedding products** and **home products/accessories**.

It includes a premium customer storefront, a full business admin dashboard, a separate developer/system dashboard with role-based access, delivery management, inventory, marketing tools, a shareable digital business card, SEO, analytics preparation, and everything needed to deploy to Vercel.

---

## ✨ Features

### Storefront (customers)
- Premium, elegant, mobile-first design (re-themable from the dashboard)
- Home page with configurable sections (hero, collections, featured, best sellers, new arrivals, offers, delivery, testimonials, about, location)
- Product catalog with **search**, **filters** (group, category, new, sale, best sellers), and **sorting**
- Product detail pages with image gallery, variants, quantity selector, stock status, related products, and **SEO-friendly URLs** (`/products/product-name`)
- Persistent shopping cart (survives refresh via `localStorage`) with slide-out drawer
- Professional checkout: contact, delivery address, delivery zone/fee, date & time, order notes, discount codes
- Order confirmation with WhatsApp confirmation button
- Contact & Location pages with Google Maps
- **Digital business card** at `/card` with QR code, save-contact (vCard), call, WhatsApp, directions
- WhatsApp integration throughout (contact, per-product inquiry, order)

### Business Dashboard (`/admin` — Owner / Admin / Staff)
- Overview with KPIs and charts (sales over time, orders, revenue by category, best sellers) + date filtering
- Orders: search, filter, detail view, status pipeline, delivery-partner assignment, payment status, internal notes, print invoice, CSV export
- Products: full CRUD with images, variants, pricing, sale price, SEO, visibility flags
- Categories: editable parent/subcategories per group
- Inventory: stock levels, adjustments, and movement history (received, sale, adjustment, return, damaged, correction)
- Customers: profiles, spend, order history, notes
- Delivery: zones (fees, free thresholds) and **flexible delivery partners** (not hard-coded)
- Marketing: homepage banners, testimonials, promotional highlights
- Discounts: percentage/fixed codes with min order, usage limits, expiry
- Business Settings: name, logo, contact, socials, hours, maps, **brand colors**, hero & content
- Reports and Audit Logs

### Developer Portal (`/developer` — Owner / Developer)
- System overview with environment health checks (values never displayed)
- Website configuration hub, Homepage Builder (enable/disable/reorder sections)
- SEO, Analytics IDs, Integrations (email/payment), Feature Flags (incl. maintenance mode)
- Delivery configuration, Users & Roles management, System Logs, Deployment status

### Platform
- Secure auth: bcrypt password hashing, signed JWT sessions (httpOnly cookies), role-based access control via middleware + server-side guards
- Server-side price/discount/delivery validation at checkout (never trusts the client)
- Security headers, input validation (Zod), audit logging
- Analytics event tracking to the database + Google Analytics / Meta Pixel hooks

---

## 🧱 Tech Stack

- **Next.js 15** (App Router, Server Actions) + **React 19** + **TypeScript**
- **Tailwind CSS** (theme driven by CSS variables from DB settings)
- **PostgreSQL** + **Prisma ORM** (migrations & seed)
- **jose** (JWT) + **bcryptjs** (hashing)
- **Recharts** (dashboard charts), **lucide-react** (icons), **sonner** (toasts), **qrcode**

---

## 🚀 Run locally

### 1. Prerequisites
- Node.js 20+
- A PostgreSQL database (local or hosted)

### 2. Install
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set at minimum:
- `DATABASE_URL` (and `DIRECT_URL`) — your PostgreSQL connection string(s)
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXT_PUBLIC_SITE_URL` — e.g. `http://localhost:3000`

### 4. Set up the database
```bash
npm run db:migrate:dev   # create tables
npm run db:seed          # load demo data + first accounts
```

### 5. Start
```bash
npm run dev
```
Open http://localhost:3000

### Demo accounts (created by the seed)
| Role | Email | Password |
|------|-------|----------|
| Owner | `owner@nourboutique.com` | `ChangeMe123!` |
| Developer | `developer@nourboutique.com` | `ChangeMe123!` |
| Admin | `admin@nourboutique.com` | `ChangeMe123!` |
| Staff | `staff@nourboutique.com` | `ChangeMe123!` |

> Change these immediately in production (Developer Portal → Users & Roles), and set strong `SEED_*` values before seeding a real deployment.

---

## ⚙️ Configuration guide

### Create the first admin
The seed creates the accounts above. Owner/Developer emails and passwords come from `SEED_OWNER_*` and `SEED_DEVELOPER_*` in `.env`. After first login, create/edit users in **Developer Portal → Users & Roles**.

### Configure the business
**Admin → Business Settings**: name, logo/favicon, phone, WhatsApp, email, address, opening hours, social links, hero text, about text, currency, and **brand colors** (with a color picker). Changes apply to the storefront instantly.

### Add products & categories
- **Admin → Categories**: manage groups (Wedding / Home), parent and subcategories.
- **Admin → Products → Add Product**: name, SKU, price/sale price, images (paste URLs), stock, category, tags, SEO, and visibility flags (featured / best seller / new).

### Configure delivery
**Admin → Delivery**:
- **Zones**: name, fee, optional free-delivery threshold, estimated time (shown at checkout).
- **Partners**: add any delivery company (name, contact, phone, WhatsApp, pricing, service areas, notes). Assign a partner to an order from the order page. Nothing is hard-coded.

### Configure WhatsApp
Set the **WhatsApp number** (digits only, e.g. `971500000000`) in **Admin → Business Settings**. WhatsApp buttons across the store, product pages, contact page, and the digital card use it automatically with pre-filled messages.

### Configure Google Maps
In **Admin → Business Settings** set:
- **Google Maps link** (used for “Get Directions”)
- **Google Maps embed URL** — in Google Maps: *Share → Embed a map → copy the `src` URL*

### Configure analytics
**Developer → Analytics**: add your **Google Analytics Measurement ID** (`G-XXXX`) and **Meta Pixel ID**. You can also set `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_META_PIXEL_ID` as env vars. Built-in events (`page_view`, `product_view`, `add_to_cart`, `checkout_started`, `order_placed`) are also recorded to the database.

### Feature flags & maintenance mode
**Developer → Feature Flags**: toggle storefront, online ordering, WhatsApp ordering, testimonials, discount codes, and **maintenance mode**.

---

## 🌐 Deploy to Vercel

1. **Push this repo to GitHub** and import it into Vercel.
2. **Provision PostgreSQL** — Vercel Postgres, Neon, or Supabase. Use the **pooled** URL for `DATABASE_URL` and the **direct** URL for `DIRECT_URL`.
3. **Add environment variables** (Project Settings → Environment Variables) from `.env.example`:
   - Required: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`
   - Optional: analytics, SMTP, Stripe
4. **Build command** — `vercel.json` sets it to `prisma generate && prisma migrate deploy && next build`, so migrations run automatically on deploy.
5. **Seed the first admin** (once) — either run `npm run db:seed` locally against the production `DATABASE_URL`, or create users through the Developer Portal after the first account exists.
6. **Deploy.** Image optimization, security headers, and API/server actions are pre-configured.

> `NEXT_PUBLIC_SITE_URL` should be your production domain so canonical URLs, the sitemap, and the digital-card QR code point to the right place.

---

## 🔄 Updating the application
```bash
git pull
npm install
npm run db:migrate       # apply any new migrations (prisma migrate deploy)
npm run build
```
On Vercel, pushing to the connected branch redeploys and runs migrations automatically.

---

## 📜 Useful scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm start` | Start the production server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run db:migrate:dev` | Create/apply migrations (dev) |
| `npm run db:migrate` | Apply migrations (prod) |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset DB and reseed (⚠️ destroys data) |

---

## 🔐 Security notes
- Secrets (DB credentials, `AUTH_SECRET`, payment keys) live only in environment variables and are **never** exposed to the client or shown in the UI.
- Passwords are hashed with bcrypt; sessions are signed JWTs in httpOnly cookies.
- All dashboards are protected by middleware **and** server-side role guards.
- Checkout recomputes prices, delivery fees, and discounts on the server.
- Security headers (HSTS, X-Frame-Options, nosniff, referrer policy, permissions policy) are set in `next.config.mjs`.

---

## 🗂️ Project structure
```
prisma/
  schema.prisma        # database schema (all models)
  seed.ts              # demo data + first accounts
src/
  app/
    (store)/           # customer storefront (home, products, cart, checkout, …)
    admin/             # business dashboard
    developer/         # developer / system portal
    card/              # digital business card
    api/               # route handlers (track, orders export)
    print/             # printable invoices
  components/          # UI components (store, dashboard, cart)
  lib/                 # prisma, auth, settings, catalog, reports, utils
  middleware.ts        # route protection
```

Built with Next.js, Prisma, and Tailwind CSS.
