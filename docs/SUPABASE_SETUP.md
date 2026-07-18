# Supabase Setup Guide

**Date:** 2026-07-15
**Purpose:** Manual steps to complete Story 1.3 — Supabase Infrastructure

---

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in (or create an account)
2. Click **"New project"**
3. Fill in:
   - **Organization:** Select or create one
   - **Project name:** `boundless-fc`
   - **Database password:** Choose a strong password (save it somewhere safe)
   - **Region:** Select **Southeast Asia (Singapore)** — closest to KL
4. Click **"Create new project"**
5. Wait for project to be provisioned (1-2 minutes)

---

## Step 2: Get API Credentials

1. In your new project, go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxx.supabase.co`)
   - **Publishable key** (starts with `sb_publishable_...` — safe for client-side)
   - **Secret key** (starts with `sb_secret_...` — **KEEP SECRET**, server-side only)

> **Note:** Legacy `anon`/`service_role` JWT keys still work but the new format is preferred. If you only see legacy keys, click **"Create new API keys"** to generate the new format. The env var names (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) stay the same — just paste the new key values.

---

## Step 3: Update .env.local

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key-here
SUPABASE_SERVICE_ROLE_KEY=your-secret-key-here
```

3. Save the file

---

## Step 4: Apply Database Migration

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `src/supabase/migrations/001_initial_schema.sql`
4. Copy the ENTIRE contents of that file
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

---

## Step 5: Create Storage Buckets

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **"New bucket"** for each of these:

| Bucket Name | Public | File Size Limit | Allowed MIME Types |
|---|---|---|---|
| `tournament-posters` | OFF (private) | 5 MB | image/* |
| `product-images` | OFF (private) | 5 MB | image/* |
| `sponsor-logos` | OFF (private) | 5 MB | image/* |

For each bucket:
- Click **"New bucket"**
- Enter bucket name
- Toggle **Public** to OFF
- Set file size limit to 5 MB
- Enter allowed MIME types (see table above)
- Click **"Create bucket"**

---


## Step 6: Apply Storage Policies

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open the file `src/supabase/migrations/002_storage_policies.sql`
4. Copy the ENTIRE contents
5. Paste into SQL Editor
6. Click **"Run"**
7. You should see "Success. No rows returned"

---

## Step 7: Create Admin User

1. In Supabase Dashboard, go to **Authentication** (left sidebar)
2. Click **"Users"** tab
3. Click **"Add user"**
4. Choose **"Create a new user"**
5. Enter:
   - **Email:** Your admin email (e.g., `admin@boundlessfc.com`)
   - **Password:** A strong password
   - **Auto Confirm User:** Toggle ON
6. Click **"Create user"**

---

## Step 8: Verify Build

1. In your terminal, run:
```bash
npm run build
```
2. Should complete with zero errors

---

## Troubleshooting

### "relation already exists" error
- You may have run the migration twice. This is OK — the error means tables are already created.

### "policy already exists" error
- You may have run the policies twice. This is OK — the error means policies are already created.

### Build fails after updating .env.local
- Make sure there are no extra spaces or quotes around the values
- Make sure the file is saved
- Try running `npm run build` again

### " unauthorized" error when querying tables
- Check that RLS policies were applied (Step 4)
- Check that the publishable key is correct in .env.local
