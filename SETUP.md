# DropTask — Setup Guide

## Step 1: Supabase (10 min)

1. Create account at https://supabase.com → New Project
2. Once created, go to **SQL Editor → New Query**, paste the contents of `supabase-schema.sql`, and run it
3. Go to **Storage → New bucket**, name it `task-attachments`, set to **Private**
4. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep secret — never commit)

## Step 2: Postmark (10 min)

1. Create account at https://postmarkapp.com
2. Create a **Server** (any name, e.g. "droptask")
3. Click the server → **Inbound** tab
4. Copy the inbound email address shown there (you'll use it as your MX target)
5. Under **Inbound** → Webhook URL: set it to `https://yourdomain.vercel.app/api/email`
   (You'll come back and update this after Vercel deploy)

## Step 3: DNS

Add this MX record to your domain (in Cloudflare / Namecheap / etc.):

| Type | Name | Value                        | Priority |
|------|------|------------------------------|----------|
| MX   | mail | inbound.postmarkapp.com      | 10       |

This routes `anything@mail.yourdomain.com` to Postmark.
DNS changes take up to 24h but often propagate in minutes.

## Step 4: Environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_EMAIL_DOMAIN=mail.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
```

## Step 5: Vercel deploy (5 min)

1. Push to GitHub: `git add -A && git commit -m "initial" && git push`
2. Go to https://vercel.com → Import the repo
3. Add all env vars from `.env.local` in the Vercel dashboard
4. Deploy

Then go back to Postmark and update the webhook URL to your live Vercel URL.

## Step 6: Test it

1. Sign up at `https://yourapp.vercel.app`
2. Go to Settings → copy your forwarding address
3. From any email client, forward an email to that address
4. Refresh the dashboard — your task should appear within a few seconds

---

## Local development

```bash
npm run dev
```

Open http://localhost:3000. Set webhook URL in Postmark to use a tunnel like ngrok for local testing.
