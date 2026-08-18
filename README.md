# Overload

A real, installable implementation of the **Overload** prototype (`OVERLOAD.dc.html`, Prototype · v4) from the Claude Design handoff bundle. Strength training tracker: a first-run onboarding that sets up your real starting numbers, a "15-second start" home screen, a full-screen active-session logger with real progressive overload, a Numbers tab that turns logged sets into strength curves, and an AI Coach chat grounded in your actual training data.

It's a client-only Vite + React app — no backend, no accounts. Everything lives in `localStorage` on your phone.

## What's real

- **Onboarding** — first launch walks you through name, units, training days, split style, equipment access, your actual current lift numbers (or a conservative beginner default), anything Coach should know (injuries, goals — saved straight to memory), and an optional Coach API key. Nothing is fabricated: your plan's starting weights are scaled to *your* numbers, not a demo profile.
- **Program generation** — there's no fixed list of workouts. `src/store/exercises.js` is a ~40-exercise library (muscle, equipment, tier, rep range) with weekly volume landmarks (MEV/MRV, the evidence-based minimum/maximum effective set ranges) across nine muscle groups; `src/store/program.js` builds each day from your chosen split style (full body / upper-lower / push-pull-legs / one muscle a day — or "Auto," picked from your training-day count), filtered to your equipment access, then picks exercises and set counts by checking what you've *actually* logged this week — a muscle that's under its weekly minimum gets prioritized, one near its weekly max gets capped, and the reasoning shows up as a note on the Today screen (the "AI Rebalancer" from the original brief, made real). Every session's title is derived from what it actually trains (e.g. "Chest & Back," not a generic "Upper A"), so a combined day is never a surprise. The pivot chips (no barbells, focus a muscle, sore) regenerate the day through the same engine instead of switching between canned plans, and split style / equipment are editable anytime in Settings.
- **Adjustable session length** — tap "Adjust" under the set/time line on Today for an iOS-style wheel picker (20–90 min, or Auto). The generator trims secondary muscles first, then primary accessory work, to fit — never just deletes exercises randomly.
- **Progressive overload** — each exercise's ending weight carries forward as next time's starting point (tracked per-exercise, independent of which day it's scheduled on), so the app actually adapts as you get stronger or need to back off, instead of resetting every session.
- **Today / active session / logging** — starting a session, logging sets, the auto weight-adjustment logic (log reps, it adjusts remaining sets), a rest timer with ±15s, swaps (pulled from the real exercise library, matched by muscle), and session summaries all work and persist across app restarts. Set/time counts on the Today screen are computed directly from the generated session, not a separate hand-authored estimate — the bug where they could disagree is fixed.
- **Numbers** — empty until you log something, then genuinely built from it: estimated 1RM (Epley formula) on Bench, Squat, and Deadlift updates from real top sets, the strength score recomputes from those, weekly volume (across nine muscle groups, with MEV/MRV tick marks on each bar) and the consistency grid are computed from real logged dates.
- **Coach** — calls the real Claude API (`claude-sonnet-5`) directly from the browser using your own Anthropic API key, with tool use so it can save memories and propose plan changes (shown as an "Apply" button, never applied without you tapping it). It's given your recent sessions, weekly volume, streak, and memory as context on every message.
- **Memory** — durable/expiring facts Coach saves (plus whatever you tell it during onboarding) are stored locally and re-injected into every future conversation; expired temporary ones drop automatically.

## What's actually possible on iOS — haptics, Wake Lock, notifications, badges

**Haptics: still not possible, and this hasn't changed.** iOS Safari's WebKit engine does not implement the Vibration API — there is no way for *any* web content, including an installed home-screen PWA, to trigger a real haptic tap on iPhone. That's a platform-level restriction Apple applies to all web content, not a gap in this app. The code calls `navigator.vibrate()` on every meaningful interaction anyway (feature-detected, silent no-op on iOS today), and the felt tactile response instead comes from real press-state animations on every button.

Three capabilities that *are* real and genuinely supported on iOS 16.4+ for an installed PWA, all added:

- **Screen Wake Lock** — the screen won't auto-lock during an active session, so a rest countdown or the reps screen doesn't go dark between sets.
- **Notifications** — when rest finishes naturally (not on manual skip) while your screen is locked or you've switched apps, a real notification fires via the service worker. Turn it on in Settings ("Rest timer alerts") — iOS requires an explicit permission grant.
- **App Badge** — unread Coach messages show as a number on the home-screen icon itself, the same API native apps use (`navigator.setAppBadge`).

None of these need a backend — they all run from code already active in the installed app, not a server push.

## The iOS layout bug

If the app still doesn't reach the bottom of the screen after this update, it's worth ruling out a **stale install**: the fix only takes effect once you redeploy this build and re-add it to your home screen (or force-reload once before re-adding) — an old cached version won't pick it up automatically. If it's still off after a clean redeploy, a screenshot showing exactly what's happening at the bottom would help pin down the remaining cause precisely.

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
  store/       state shape, reducer, localStorage persistence, the exercise library, the
               program generator, derived Numbers math
  screens/     Onboarding, Home, Numbers, Coach, Session (the full-screen active logger), and overlay sheets
  components/  TabBar, the strength-curve Chart, RingProgress
  lib/         date/weight/1RM math, haptics, the keyboard-inset hook, the Claude API client
public/
  manifest.webmanifest, icons/, sw.js   — PWA installability + offline app shell
```

## A note on the exercise science

The volume landmarks (MEV/MRV) and split templates follow commonly cited evidence-based ranges from the hypertrophy training literature (the kind of guidance you'd find in Renaissance Periodization-style resources) — reasonable defaults, not a substitute for individualized coaching, and not sourced from a specific clinical citation. The relative-strength coefficients that scale accessory exercises off your Bench/Squat/Deadlift numbers are similarly ballpark heuristics; the app leans on this being self-correcting (both the in-session and session-to-session auto-adjust) rather than needing those starting numbers to be exact.
