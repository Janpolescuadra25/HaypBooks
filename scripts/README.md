# scripts/

This folder contains repository-level utility scripts used by the project.

- `wait-for-backend.js` — wait for the Backend health endpoint to become healthy before running E2E tests.
- `tmp_check_table.js` — temporary helper used for local DB checks (moved here).

Usage examples:

- Run E2E: (from Frontend package)
  npm run e2e -- (this will call the root `wait-for-backend.js` first)

- Run manual signup e2e (from frontend):
  npm run e2e:signup:manual

Notes:
- Scripts that are strictly frontend-only may live in `Haypbooks/Frontend/e2e/scripts`.
- Scripts that are strictly backend-only can live in `Haypbooks/Backend/scripts`.
