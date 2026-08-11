# DropTask

Forward an email, get a task. Every email you forward to your own generated address lands
on your board with the sender, deadline, priority, and attachments already pulled out of it.

**[Live →](https://droptask.vercel.app)**

## How it works

Sign up and you get a unique inbound address — something like `a1b2c3@mail.yourdomain.com`.
Forward anything to it from any client on any device. Postmark receives the mail and posts
it to `/api/email`, which:

- resolves the address token back to your account
- strips quoted replies and signature footers (`Sent from my…`, `Get Outlook`,
  unsubscribe blocks) so the task body is the actual message
- parses a deadline out of natural language with [chrono-node](https://github.com/wanasit/chrono),
  ignoring anything that already resolves to the past
- infers priority from the wording — "asap" and "critical" read as urgent, "no rush" and
  "fyi" as low
- stores attachments in private Supabase storage

The task shows up on your dashboard within a few seconds.

## Stack

Next.js (App Router) with TypeScript and Tailwind. Supabase for auth, Postgres, and
private file storage. Postmark for inbound email. Deployed on Vercel.

Three tables: `email_tokens` maps a forwarding address to a user, `tasks` holds the
parsed result, `attachments` points at stored files. Schema is in
[`supabase-schema.sql`](supabase-schema.sql).

## Layout

```
src/app/api/email/       the inbound webhook — parse and store
src/app/api/tasks/       task CRUD
src/app/api/settings/    forwarding address management
src/app/dashboard/       the board
src/lib/email-parser.ts  deadline, priority, and body extraction
src/lib/supabase*.ts     browser and server clients
```

## Running it locally

Requires Node 20+, plus a Supabase project and a Postmark server.

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-side only — never commit this
NEXT_PUBLIC_EMAIL_DOMAIN=       # e.g. mail.yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev
```

Inbound email won't reach localhost on its own — point the Postmark webhook at an ngrok
tunnel to test the full path.

Full deployment walkthrough, including the MX record and Postmark wiring:
**[SETUP.md](SETUP.md)**.

## Checks

```bash
npm run build
npm run lint
```
