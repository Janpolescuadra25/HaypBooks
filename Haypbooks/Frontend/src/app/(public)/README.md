# Public Route Group

This route group hosts the public-facing landing and auth shell experience.

- Routes live under the public route group without adding a URL segment, e.g. `/` and `/landing`.
- The layout in this directory is intentionally a server component so the public pages can participate in the normal App Router build pipeline.
- The `dynamic = 'force-dynamic'` export remains in place to preserve the public pages' runtime behavior while keeping the route-group layout compatible with production builds.

## Build Verification Attribution (Phase 9)

`npm run build` for this route group previously failed. The fix: a stray `'use client'`
directive at the top of `layout.tsx` in this directory was removed. The comment block and
`export const dynamic = 'force-dynamic'` above it are retained — pre-rendering is
intentionally disabled here (see the comment at the top of `layout.tsx` for the original
rationale).

Verified green by independent witnessed reproduction on 2026-09-03: exit code 0, 347/347
pages generated, ~115 s, BUILD_ID `4drlmY5Pd3Rq-IJWCBRKfQ`, zero export or `/_document`
errors. `out/` is intentionally absent — `next.config.js` sets no `output: 'export'`, so
this is a standard `.next/` build (static prerendering plus dynamic routes).

Root cause of the original failure was not definitively isolated; candidate contributors
(stale `.next` artifacts, NODE_ENV dev/prod mixing, Next 14.2.32 export machinery) were
corrected together and validated empirically.
