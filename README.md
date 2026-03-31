# HaypBooks

HaypBooks is an open-source accounting and practice management suite with a modern Next.js frontend and NestJS backend. This repository includes a real JWT authentication flow, landing page, onboarding UI, and a foundation for business finance features.

## Tech Stack
- Frontend: Next.js 14 (React)
- Backend: NestJS (Node.js)
- ORM: Prisma (planned for PostgreSQL production)
- Database: PostgreSQL (recommended)
- Auth: JWT + bcrypt

## Quick Start
1. Clone repo and go to root:
   `powershell
   cd C:\Users\HomePC\Desktop\Haypbooksv9
   `
2. Run one-click start script:
   `powershell
   ./start-dev.ps1
   `
   - Frontend: http://localhost:3000
   - Backend:  http://127.0.0.1:4000

## Essential Scripts
- ./start-dev.ps1 - start frontend and backend simultaneously.
- 
pm run dev (in Haypbooks/Frontend) - run frontend only.
- 
pm run dev (in Haypbooks/Backend) - run backend only.

## Local environment
- Frontend env: Haypbooks/Frontend/.env.local
  - NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
- Backend env: Haypbooks/Backend/.env
  - JWT_SECRET=<your-secret>
  - JWT_EXPIRATION=7d
  - PORT=4000

## Quick verification
- Landing page: http://localhost:3000/landing
- Signup: http://localhost:3000/signup
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard

## Deeper docs
- [Quickstart](Haypbooks/QUICKSTART.md)
- [Setup guide](Haypbooks/SETUP_GUIDE.md)
- [Backend README](Haypbooks/Backend/README.md)

## Cleanup and release notes
- .gitignore now includes outcomes for logs and temporary files.
- 	mp_directory_tree.txt and old temp trace assets are not tracked after cleanup.

