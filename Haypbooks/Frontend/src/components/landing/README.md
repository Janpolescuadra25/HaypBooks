# Landing Components — Design Port (Workstream 025-A)

Status: **DONE** (see Road_Map.md Phase 1)

## Overview
These components implement the new landing, intro, and login design, ported from the
read-only reference project (docs\HB_new* -> HB_clone) with a port-don't-upgrade
strategy. Production behavior — especially the login auth contract — is fully preserved.

## Component Inventory (the 15 PORTED files)
| Component | Purpose |
|---|---|
| ParticleField | Ambient animated canvas background |
| Navbar | Landing navigation bar |
| Hero | Landing hero section |
| Ticker | Scrolling ticker strip |
| StatsBar | Statistics bar |
| Classes | Class/feature section |
| BossFight | Gamified showcase section |
| QuestMap | Quest/journey map section |
| Achievements | Achievements showcase |
| Pricing | Pricing section |
| FinalCTA | Final call-to-action |
| Footer | Landing footer |
| AchievementToast | Achievement notification chrome |
| IntroSequence | Once-per-session intro (3 slides, skip, dots, progress) |
| Hud | Shared HUD primitives |
| LandingExperience | Shared landing orchestrator that renders the full experience on `/` and `/landing` |

Note: this directory also contains PRE-EXISTING tracked components (e.g.
LandingHeader.tsx, StoryHero.tsx) and the previous intro (CinematicIntro) elsewhere;
they are NOT part of this port — they remain on disk, unreferenced, as the rollback path.

(Correct any one-line purpose above that does not match the actual component code.)

Supporting files: `src\components\auth\AuthShell.tsx`, `BrandCanvas.tsx`, `fields.tsx`;
`src\lib\authEntrance.ts` (armAuthTransition).

## Architecture
- `/` and `/landing` both render the shared LandingExperience orchestrator
  (`src\app\page.tsx` and `src\app\(public)\landing\page.tsx`).
- IntroSequence plays once per browser session; key `hb-intro-seen` (sessionStorage);
  hydration-safe; skip button; prefers-reduced-motion respected.

## Key Decisions
- Port, don't upgrade: adapted the reference code to Next 14 / Tailwind v3.
- framer-motion imports -> `motion/react` (installed `motion` package; zero new deps).
- Tailwind v4 -> v3: design tokens merged into `tailwind.config.ts` theme.extend;
  hb-* keyframes/utilities ported as plain CSS in `src\styles\globals.css`;
  class fixes `bg-[size:]` -> `bg-[length:]` (2 occurrences) and
  `duration-400` -> `duration-[400ms]` (1 occurrence).
- Not ported: SignOutButton, AccountantsHub, LearnSupport, mock /api/auth/* routes,
  tw-animate-css, shadcn oklch variables.
- Login: visual skin only; the entire existing auth contract is preserved (service
  call, timeout, redirect matrix, error map, resend flow).

## Verification
- `npm run typecheck`: green (verified locally after restoring LandingExperience, Hero, and Footer).
- `npm run lint`: zero new issues in changed files (Hydra-verified).
- `npm run build`: fails on a PRE-EXISTING error/404 prerender defect identical at
  baseline 83cec1ed (Hydra worktree baseline test) — tracked as Road_Map Phase 9.
- jest e2e (login-ui, signup-ui): deferred — requires a live DB + dev server.
- Owner visual smoke: pending (Stage 5).

## Restoration Note
A regression had removed the shared landing orchestrator and reverted the landing hero/footer to the older production shell. The restoration reintroduced [Haypbooks/Frontend/src/components/landing/LandingExperience.tsx](Haypbooks/Frontend/src/components/landing/LandingExperience.tsx), restored the new hero/footer markup, and re-verified the frontend with `npm run typecheck`.
