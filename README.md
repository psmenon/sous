# Sous MVP1

Recipes that fit the kitchen you actually have.

A single-feature MVP built for a Software Product Management course. Cooks describe their kitchen once and get a recipe rewritten for it, with a reason for each change. They cook one step at a time, can ask for help at the current step (text or photo), and answer one price question at the end.

- Cook's app: `/`
- Team admin: `/admin` (password protected and not linked from the cook's pages)
- Deployment check: `/api/health`

## Stack and why

- **Next.js 15 (App Router, TypeScript)**: one project serves the pages and the API route handlers (`/api/adapt`, `/api/ask`, `/api/log`, `/api/health`). It deploys to Vercel with no configuration.
- **Anthropic TypeScript SDK**: called only from the server (`src/lib/ai.ts`, marked `server-only`). The browser never sees the key.
- **Neon Postgres via `DATABASE_URL`**: Neon has a free tier, you can add it from inside Vercel, and it sets `DATABASE_URL` for you. The app creates its one `sessions` table on first use, so there are no migrations to run.
  With no `DATABASE_URL`, sessions are written to `.data/sessions.json` for local runs. This does **not** work on Vercel, so production needs the database.

## Environment variables

| Variable | Needed | What it is |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Your Anthropic API key. Server only |
| `ADMIN_PASSWORD` | yes | Password for `/admin`. If empty, `/admin` is off |
| `DATABASE_URL` | yes in production | Postgres connection string. Vercel sets it when you connect Neon |
| `MODEL_ADAPT` | no | Default `claude-sonnet-5-5` |
| `MODEL_ASK` | no | Default `claude-haiku-4-5-20251001` |
| `ADMIN_COOKIE_SECRET` | no | Signs the admin cookie. Defaults to a hash of `ADMIN_PASSWORD` |
| `SOUS_FAKE_AI` | local testing only | `1` gives canned answers without a key, `invalid` gives a broken answer. It is read at build time. **Never set it on Vercel.** |

## Run locally (Node 20 or later)

```bash
npm install
```

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your key after `ANTHROPIC_API_KEY=`. Set an `ADMIN_PASSWORD` too. Then run:

```bash
npm run dev
```

Open http://localhost:3000. To click through without a key, set `SOUS_FAKE_AI=1` in `.env.local` and restart.

## Deploy to Vercel, step by step

1. **Put the code on GitHub.** Create a new repository and push the contents of this `sous` folder to it, so that `package.json` sits at the repository root.
2. **Import it into Vercel.** Sign in at vercel.com, choose **Add New → Project**, pick the repository and click **Import**. Leave the framework (Next.js) and the build settings as detected. Don't deploy yet. If it deploys anyway, carry on, because step 5 redeploys it.
3. **Create the database.** In the new project, open the **Storage** tab, choose **Create Database → Neon (Serverless Postgres)**, accept the free plan, and connect it to all environments. Vercel adds `DATABASE_URL` to the project for you. There is nothing to paste and no tables to create.
4. **Add the remaining variables.** Go to **Settings → Environment Variables** and add these, one per row, for Production, Preview and Development:
   - `ANTHROPIC_API_KEY`: your key from console.anthropic.com → API Keys
   - `ADMIN_PASSWORD`: a password your team will use for `/admin`
   - optional: `MODEL_ADAPT`, `MODEL_ASK`, `ADMIN_COOKIE_SECRET`
   - do **not** add `SOUS_FAKE_AI`
5. **Deploy.** Open **Deployments** and click **Redeploy** on the latest one, or push a commit, so the new variables are used.
6. **Confirm it works.** Open `https://<your-project>.vercel.app/api/health`. You should see `{"ok":true,"api_key_set":true,"database_set":true,"admin_set":true}`. It reports whether each setting is present, never its value.
7. **Make sure the link is public.** In **Settings → Deployment Protection**, check that Vercel Authentication does not apply to the production domain, so testers need no login.
8. **Smoke test.** Do one cook on the live link, then open `/admin`, sign in, and check that the session row and **Download CSV** work.

`/api/adapt` allows up to 120 seconds. On the Hobby plan this works with Fluid compute, which new projects have switched on by default.

## Previews and screenshots

- `npm run preview:build` writes `preview-dist/sous-preview.html`: a single static file with the real screens and sample answers from `src/preview/mock.ts`, used for the shareable design preview. The Next.js app never imports `src/preview/`. The production build gets an empty stub instead of the test answers (see `next.config.mjs`), so no mock code ships.
- `npm run screenshots` uses your installed Google Chrome to save the six screenshots in `screenshots/` at 390px. The app must be running at `BASE_URL` (default `http://localhost:3000`).

## Privacy and logging

- Each cook gets a random `session_id` (UUID) in `localStorage`. Names, emails, IP addresses and photos are never stored.
- IPs are held in memory only, for rate limiting (20 adapts and 60 asks per IP per hour, per server instance).
- Photos are resized on the device (max side 1024px, JPEG 0.85), sent to the API, and then discarded. Only `had_photo: true/false` is logged.
- Request bodies are capped at 2 MB. If the model returns invalid output, the request is retried once, and the cook only ever sees friendly messages.
- Logging failures never block the cook. There are no third-party analytics. The only outside requests are to Google Fonts.

## Project map

```
src/components/SousApp.tsx    all four cook screens (client)
src/components/icons.tsx      inline SVG icon set
src/app/api/*                 adapt, ask, log, health, admin login and CSV
src/app/admin/page.tsx        admin table
src/prompts/adapt.ts, ask.ts  prompt templates (copied into prompts.md)
src/lib/ai.ts                 Anthropic calls, JSON parsing, validation, retry and fallback
src/lib/store.ts              Postgres or JSON-file session store
src/lib/fake-ai*.ts           local test answers and the production stub
src/preview/mock.ts           design preview only, never in the app build
```
