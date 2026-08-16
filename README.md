# Overload

A real, installable implementation of the **Overload** prototype (`OVERLOAD.dc.html`, Prototype · v4) from the Claude Design handoff bundle. Strength training tracker: a "15-second start" home screen, a full-screen active-session logger, a Numbers tab that turns real logged sets into strength curves, and an AI Coach chat grounded in your actual training data.

It's a client-only Vite + React app — no backend, no accounts. Everything lives in `localStorage` on your phone.

## What's real vs. what's seeded

- **Today / active session / logging** — fully real. Starting a session, logging sets, the auto weight-adjustment logic, rest timer, swaps, and session summaries all work and persist.
- **Numbers** — seeded with sample "last 12 months" history so the app isn't empty on first run, then every session you actually complete appends real data points: estimated 1RM (Epley formula) on Bench and Squat updates from real top sets, the strength score recomputes from those, weekly volume and the consistency grid are computed from real logged dates. (No deadlift day exists in the seed plans yet, so the Deadlift number only updates once you add one.)
- **Coach** — calls the real Claude API (`claude-sonnet-5`) directly from the browser using your own Anthropic API key, with tool use so it can save memories and propose plan changes (shown as an "Apply" button, never applied without you tapping it). It's given your recent sessions, weekly volume, streak, and memory as context on every message.
- **Memory** — durable/expiring facts Coach saves are stored locally and re-injected into every future conversation; expired temporary ones are dropped automatically.

## Run it locally

```bash
npm install
npm run dev
```

## Get it onto your iPhone

This needs a **public HTTPS URL** — iOS Safari's "Add to Home Screen" won't install a PWA served from `localhost`. Deploy the static build anywhere that serves static files over HTTPS:

```bash
npm run build      # outputs to dist/
```

Easiest options (all have free tiers, both work with zero config since this is a plain static SPA):

- **Vercel**: `npx vercel deploy --prod` from this `app/` folder, or connect the repo in the Vercel dashboard.
- **Netlify**: `npx netlify deploy --prod --dir dist`, or drag-and-drop the `dist/` folder at app.netlify.com/drop.
- **GitHub Pages**: push `dist/` to a `gh-pages` branch (or use `actions/deploy-pages`).

Then on your iPhone:
1. Open the deployed URL in **Safari** (must be Safari, not Chrome — Chrome on iOS can't install PWAs).
2. Tap the Share icon → **Add to Home Screen**.
3. Open it from the home screen icon. It launches full-screen, no browser chrome, and works offline after the first load (the service worker caches the app shell).

## Set up Coach

Open the **Coach** tab → tap the gear icon → paste an Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com)). The key is stored only in this browser's `localStorage` and sent only to `api.anthropic.com` — nowhere else. Without a key, Coach's input prompts you to add one; everything else in the app works with no key and no network at all.

## Project structure

```
src/
  store/       state shape, reducer, localStorage persistence, seed data, derived Numbers math
  screens/     Home, Numbers, Coach, Session (the full-screen active logger), and overlay sheets
  components/  TabBar, the strength-curve Chart
  lib/         date/weight/1RM math, the Claude API client
public/
  manifest.webmanifest, icons/, sw.js   — PWA installability + offline app shell
```
