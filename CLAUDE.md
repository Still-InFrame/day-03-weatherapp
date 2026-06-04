# CLAUDE.md

Session-continuity doc. Auto-loaded as project instructions at session start. Re-read at session start; propose appends to Project status / Changelog / Gotchas / Open threads when triggers fire (see Maintenance triggers). No secrets in this file.

## Project

Day 03 of Savion's 100 Day AI Build Challenge (one new app per day for 100 days). Single user (Savion).

- **weatherapp (CrewCast)** — weather-aware job scheduler for trade crews: enter jobs (location + date + trade) and each gets a Go/Caution/Reschedule verdict tuned to that trade's tolerances. The per-trade rules are the differentiator vs a vanilla weather app.
- Stack: Next.js + TypeScript + Tailwind (App Router). Fully client-side; no DB/backend. Data in `localStorage`, forecasts from Open-Meteo (no API key).
- Dev / build / test commands: `npm run dev` (port 3000), `npm run build`, `npm run lint`. No test suite.
- Scaffolded: 2026-06-03

## Challenge context (constant across all 100 days)

- Each app is self-contained: its own folder (`day-NN-slug`), its own git repo, its own optional deploy. Apps do NOT share a codebase.
- The tracker at **https://100dayaichallenge.com** is a separate hub — log each finished app there with its repo + demo link. This project does not touch the tracker's code.
- **Ship it (per-app, after the app works) — two helper scripts the scaffolder dropped in:**
  - **`./backup.sh`** → creates this app's GitHub repo + pushes (gh CLI + SSH key). Public by default (build-in-public); `./backup.sh --private` for private; `./backup.sh "message"` sets the commit message. Re-run anytime to push new commits.
  - **`./deploy.sh`** (web apps only) → deploys to Vercel + attaches `<slug>.100dayaichallenge.com` (auto DNS + SSL, since Vercel runs the domain's DNS).
  - Not every app needs deploying; a GitHub repo link is a fine demo.
- Not every app needs deploying. The challenge is to BUILD one a day; a repo link is a valid demo. Don't let "must deploy" threaten the streak.

## Working agreements

Behavior overrides — constant for Savion across every project. Adjust per-project only if he says so.

- Communication: verbose. Walk through reasoning before/after meaningful actions; show options considered. One or two sentences of explanation by default, more when novel or risky.
- Decisions with real tradeoffs: present 2–3 options, mark one Recommended, wait for Savion (use AskUserQuestion). Don't pick silently.
- Engineering honesty: push back when something is off — scope creep, over-engineering, premature abstraction, choices that hurt later. Don't sugarcoat.
- Diagnose root cause before patching. Don't paper over symptoms.
- Comments explain WHY, not WHAT. No emoji in code or docs (product/UI emoji is fine — it's not author voice).
- Match scope of action to scope of request. Don't add features beyond what was asked.
- Git: initialize early and push to GitHub for backup (the only Day-1 regret would have been losing un-backed-up work). Don't proactively commit without being asked; commit at meaningful checkpoints when Savion asks. Never amend, never force-push.
- Default later challenge days to LIGHTER scope than a full MVP unless Savion explicitly asks for max — Day 1 was special.

## Maintenance triggers

Read every session. Propose updates to this file when ANY fire — don't wait to be asked.

- **SESSION-START RULE:** re-read Project status before the first user message. If anything is In flight, surface it in one sentence and ask whether to continue or pivot. Don't assume continuation.
- **PROJECT STATUS:** work starts → "Add to In flight?"; work completes → "Move to Recently shipped + Changelog?"; "park it" → Parked; external blocker → Blocked (with reason + what unblocks).
- **CHANGELOG:** a feature shipped, a >15-min bug fix, an A-over-B architecture decision, a schema/contract change, or a change spanning multiple files. Record WHY, not just what.
- **GOTCHA:** a non-obvious framework/API quirk, an undocumented constraint that bit us, a race/timing bug, a TS/build edge case. Test: "would future-cold-me re-introduce this bug without a note?"
- **OPEN THREAD:** a temporary workaround replacing a real fix, a known limitation, an unresolved investigation (chronic caveats on existing code — distinct from in-motion Project status).
- **WORKING AGREEMENT:** Savion corrects the same thing twice, says "from now on do X," or "remember this."
- **CONVERSATIONAL CUES:** "this was tricky"/"I always forget this" → Gotcha; "park it" → Parked; "I'm stuck on/blocked by" → Blocked; re-asking something you should know → a missing entry; "we tried X, it didn't work" → Gotcha (what AND why).
- **PROACTIVITY:** after each meaningful unit of work, scan back; if a trigger fired, surface the proposal in one sentence (Savion can decline — ask anyway).
- **NEGATIVE RULE — don't pad:** typos, obvious one-liners, whitespace, reverts of just-tried things do NOT belong here. Bar = "would future-cold-me benefit?"

## Project status

### In flight
(none yet)

### Blocked
(none)

### Parked
(none)

### Recently shipped
- **CrewCast v1 (2026-06-03)** — full app built, verified end-to-end in browser, committed, and **deployed**. Repo: https://github.com/Still-InFrame/day-03-weatherapp · Live: https://weatherapp.100dayaichallenge.com (also day-03-weatherapp.vercel.app). Per-trade verdicts, localStorage persistence, same-day scheduling, edge cases handled. Remaining: log it on the tracker at https://100dayaichallenge.com.

## Changelog

Format — date, title, root cause/motivation, plumbing (files), tradeoffs. Reading cold, future-me must understand WHY.

- **2026-06-03**: Project scaffolded from the 100-day starter template.
- **2026-06-03**: Built CrewCast — field-service weather scheduler. WHY this shape: the business value isn't the forecast (a commodity) but the per-trade *decision*, so the core is a rules table in `lib/trades.ts` where the same forecast yields different verdicts (roofing reschedules at 60% rain, landscaping only cautions). Chose pure client-side + Open-Meteo (keyless, CORS-friendly) + localStorage over any backend — keeps it a near-static Vercel deploy with zero auth/DB plumbing, which was the explicit ask. Forecast horizon capped at Open-Meteo's 16 days; jobs beyond show "too far out" rather than fake data. Forecasts deduped/cached per rounded coordinate so N jobs in one city = 1 fetch.

## Open threads

- **Geocoder can't disambiguate same-named cities by state.** `lib/weather.ts` `geocode()` falls back to the city token before the comma (e.g. "Austin, TX" → searches "Austin"), then takes Open-Meteo's top (most-populous) hit. "Springfield, IL" would resolve to whichever Springfield is largest, not necessarily IL. Acceptable for v1 (famous-city cases all resolve right); a real fix needs a US-state-abbreviation map to match `admin1`. The resolved label shown on each row reveals which place was actually picked.
- _(resolved 2026-06-03)_ ~~Seed/form dates use `toISOString()` (UTC)~~ — fixed: all calendar dates now go through `lib/dates.ts` (`isoFromToday`/`toLocalIso`) which formats from the local calendar. This had a real symptom, not just cosmetic: the date picker's `min` landed on tomorrow and rejected the actual today, blocking same-day jobs.

## Gotchas

Pre-seeded machine/environment lessons (true on this Mac regardless of app). Add project-specific ones as they come up.

- **npm global installs fail on this machine.** `npm i -g <pkg>` hits EACCES in `~/.npm/_cacache` (root-owned files) AND needs root for the global prefix. Don't use `sudo` (needs a password). Workaround: run CLIs via `npx --yes --cache /tmp/npm-vercel-cache <pkg>@latest <cmd>` — the `--cache` flag dodges the corrupted cache, npx dodges the global prefix.
- **The login shell is zsh; `$VAR` holding a multi-word command does NOT word-split.** `P='npx ... cli'; $P run` fails ("no such file or directory: npx ... cli"). Write the full command inline, or use `${=P}`.
- **`create-next-app` (and similar) reject folder names with spaces/capitals** — they derive the npm package name from the folder. Day folders are already named URL-safe (`day-NN-slug`) by the starter script, so this is avoided as long as you scaffold INTO this folder (e.g. `create-next-app .`).
- **If a `package-lock.json` exists at `/Users/savionsmith/` (outside the project),** Next/Turbopack may pick the wrong workspace root. Fix with `turbopack.root: __dirname` in `next.config.ts` (only relevant for Next apps). _(Applied in this app — the stray lockfile is real and present.)_
- **Open-Meteo geocoding matches on city name only and returns ZERO results for "City, ST" strings** (e.g. `name=Austin, TX` → empty; `name=Austin` → works). Since "City, ST" is exactly how users type locations, `geocode()` in `lib/weather.ts` tries the full string then falls back to the pre-comma token. Bit us during verification: seed jobs worked (pre-filled coords) but a user-added "Austin, TX" came back "Location not found".

## Architecture

_(document routing/state/data-flow/module boundaries once they exist)_

## Key files

| Purpose | File |
|---|---|
| Per-trade rule table (the differentiator) | `lib/trades.ts` |
| Forecast → verdict scoring | `lib/verdict.ts` |
| Open-Meteo client (geocode + forecast + WMO codes) | `lib/weather.ts` |
| localStorage-backed job list hook | `lib/useJobs.ts` |
| Sample jobs for first load | `lib/seed.ts` |
| Local-time date helpers | `lib/dates.ts` |
| Domain types | `lib/types.ts` |
| Dashboard + per-job async resolution | `app/page.tsx` |
| Add-job form / job row / verdict pill | `components/` |
