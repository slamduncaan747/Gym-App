# Overload

A real, installable implementation of the **Overload** prototype (`OVERLOAD.dc.html`, Prototype · v4) from the Claude Design handoff bundle. Strength training tracker: a first-run onboarding that sets up your real starting numbers, a "15-second start" home screen, a full-screen active-session logger with real progressive overload, a Numbers tab that turns logged sets into strength curves, and an AI Coach chat grounded in your actual training data.

It's a client-only Vite + React app — no backend, no accounts. Everything lives in `localStorage` on your phone.

## What's real

- **Onboarding** — first launch walks you through name, units, training days, your actual current lift numbers (or a conservative beginner default), anything Coach should know (injuries, goals, equipment — saved straight to memory), and an optional Coach API key. Nothing is fabricated: your plan's starting weights are scaled to *your* numbers, not a demo profile.
- **Progressive overload** — a real gap in most workout-tracker demos: this one doesn't reset to the same weights every session. Each exercise's ending weight carries forward as next time's starting point, so the app actually adapts as you get stronger (or need to back off).
- **Today / active session / logging** — starting a session, logging sets, the auto weight-adjustment logic (log reps, it adjusts remaining sets), rest timer, swaps, and session summaries all work and persist across app restarts.
- **Numbers** — empty until you log something, then genuinely built from it: estimated 1RM (Epley formula) on Bench and Squat updates from real top sets, the strength score recomputes from those, weekly volume and the consistency grid are computed from real logged dates. (No deadlift day exists in the seed plans yet, so the Deadlift number only updates once you add one.)
- **Coach** — calls the real Claude API (`claude-sonnet-5`) directly from the browser using your own Anthropic API key, with tool use so it can save memories and propose plan changes (shown as an "Apply" button, never applied without you tapping it). It's given your recent sessions, weekly volume, streak, and memory as context on every message.
- **Memory** — durable/expiring facts Coach saves (plus whatever you tell it during onboarding) are stored locally and re-injected into every future conversation; expired temporary ones drop automatically.

## About haptics

**iOS Safari's WebKit engine does not implement the Vibration API** — there is no way for any web content, including an installed home-screen PWA, to trigger a real haptic tap on iPhone. That's an Apple platform restriction, not something fixable here. The app calls `navigator.vibrate()` on every meaningful interaction anyway (feature-detected, so it's a silent no-op on iOS today, and would activate automatically on Android or if WebKit ever adds support). The tactile feel you *do* get on iOS comes from real press-state animations — every button scales and dims instantly on touch — which is the same technique virtually all polished iOS PWAs rely on.

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

Easiest options (all have free tiers, all work with zero config since this is a plain static SPA):

- **Vercel**: `npx vercel deploy --prod` from this folder, or connect the repo in the Vercel dashboard.
- **Netlify**: `npx netlify deploy --prod --dir dist`, or drag-and-drop the `dist/` folder at app.netlify.com/drop.
- **GitHub Pages**: push `dist/` to a `gh-pages` branch (or use `actions/deploy-pages`).

Then on your iPhone:
1. Open the deployed URL in **Safari** (must be Safari, not Chrome — Chrome on iOS can't install PWAs).
2. Tap the Share icon → **Add to Home Screen**.
3. Open it from the home screen icon. It launches full-screen, no browser chrome, and works offline after the first load (the service worker caches the app shell).
4. Walk through onboarding once — it only happens on first launch per device/browser.

## Set up Coach

During onboarding, or anytime after via **Coach → gear icon**, paste an Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com)). The key is stored only in this browser's `localStorage` and sent only to `api.anthropic.com` — nowhere else. Without a key, Coach's input prompts you to add one; everything else in the app works with no key and no network at all.

## Resetting

Settings → **Reset app data** wipes everything (`localStorage`) and takes you back through onboarding, as if freshly installed.

## Project structure

```
src/
  store/       state shape, reducer, localStorage persistence, seed data, derived Numbers math
  screens/     Onboarding, Home, Numbers, Coach, Session (the full-screen active logger), and overlay sheets
  components/  TabBar, the strength-curve Chart
  lib/         date/weight/1RM math, haptics, the keyboard-inset hook, the Claude API client
public/
  manifest.webmanifest, icons/, sw.js   — PWA installability + offline app shell
```
