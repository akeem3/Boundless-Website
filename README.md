# Boundless FC Website

An open futsal community website for Boundless FC in Bukit Jalil, Kuala Lumpur.

## What This Site Does

- Shows upcoming futsal sessions and tournaments
- Lets players join via WhatsApp or Google Forms
- Displays team/club merchandise for order
- Lists sponsors
- Provides contact information

The public site is read-only. All content updates happen through a secure admin panel.

---

## How to Update Content

### Tournament

1. Go to your admin panel (e.g. `your-site.vercel.app/admin`)
2. Log in with your admin credentials
3. Click **Tournament**
4. Fill in the form with tournament details (title, date, location, fee)
5. Upload a poster image (JPEG, PNG, or WebP — max 5MB)
6. Toggle **Registration Open** on when ready
7. Click **Save**

The landing page updates automatically.

### Sessions

1. Go to **Admin → Sessions**
2. Click **Create Session**
3. Enter the date, time, location, capacity, and any notes
4. Click **Save**

The next upcoming session appears on the landing page.

### Shop (Merchandise)

1. Go to **Admin → Shop**
2. To add a product: click **Add Product**, fill in name, description, price, and sizes
3. To add images: open the product, click **Upload Image**
4. To set the order form link: click the **Settings** gear icon and paste your Google Form or Notion URL

Products appear in the Shop section on the landing page.

### Sponsors

1. Go to **Admin → Sponsors**
2. Click **Add Sponsor**
3. Enter the sponsor name and upload their logo
4. Use the arrow buttons to reorder sponsors

Active sponsors appear in the scrolling marquee on the landing page.

### Contact Information

1. Go to **Admin → Contact**
2. Update any of these fields:
   - **WhatsApp Number** (digits only, e.g. `60123456789`)
   - **Email Address**
   - **Instagram URL**
   - **Session Join URL** (Google Form link for session sign-ups)
3. Click **Save**

---

## Where to Paste External URLs

| Field | Where to Find It | Where to Paste |
|---|---|---|
| Tournament registration form | Your Google Form URL | Admin → Tournament → Team Registration URL |
| Shop order form | Your Google Form or Notion URL | Admin → Shop → Settings (gear icon) → Shop Order URL |
| Session join form | Your Google Form URL | Admin → Contact → Session Join URL |

---

## Where to Update Contact Info

All contact details are in **Admin → Contact**:

- **WhatsApp Number** — your community WhatsApp number (digits only, e.g. `60123456789`)
- **Email Address** — your contact email
- **Instagram URL** — full Instagram profile URL (e.g. `https://instagram.com/boundlessfc`)

---

## Deploy Process

The site is hosted on Vercel and auto-deploys from GitHub.

1. Make your changes in the admin panel (no code changes needed for content updates)
2. If you need to update the code, push changes to the `main` branch on GitHub
3. Vercel automatically deploys within 1–2 minutes
4. No manual steps required

---

## Environment Variables

These are set in Vercel project settings (Settings → Environment Variables):

| Variable | What It Does | Example Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable (anon) key | `sb_publishable_xxx` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (secret) | `sb_secret_xxx` |
| `ADMIN_USERNAME` | Admin panel login email | `admin@boundlessfc.com` |
| `ADMIN_PASSWORD` | Admin panel login password | `your-secure-password` |

**Never share** `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USERNAME`, or `ADMIN_PASSWORD` with anyone.

---

## Tech Stack (For Reference)

- **Frontend:** Next.js (React)
- **Database & Auth:** Supabase (PostgreSQL)
- **Hosting:** Vercel (free tier)
- **No paid tools required** — everything runs on free-tier limits
