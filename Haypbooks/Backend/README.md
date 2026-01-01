# Haypbooks Backend (NestJS)

A production-ready NestJS backend for Haypbooks accounting software.

## Architecture

- **Framework**: NestJS with TypeScript
- **Authentication**: JWT with Passport
- **Repository Pattern**: Mock repositories (ready for real DB migration)
- **Validation**: class-validator DTOs
- **Password Hashing**: bcrypt

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── auth/                   # Authentication module
│   ├── auth.controller.ts  # Login, signup, logout endpoints
│   ├── auth.service.ts     # Auth business logic
│   ├── auth.module.ts      # Auth module definition

Redis support
-------------

This backend supports a Redis-backed pending signup store for handling unverified signups in a durable, TTL-backed fashion. Set the environment variable `REDIS_URL` (e.g. `redis://localhost:6379`) and the server will use Redis automatically. If no Redis client is available, the service falls back to an in-memory store (useful for development and tests), but Redis is recommended for production deployments.
To fully enforce that no unverified users are persisted to the database, set `ENFORCE_PRE_SIGNUP=true`. When enabled, the `/signup` endpoint will behave like `/pre-signup` and return a `signupToken` instead of creating a DB user directly. This requires a reliable Redis instance (or another durable TTL store) to work safely in production.

Local testing
-------------

To test locally:

1. Start infrastructure (Postgres + Redis):
   - cd Haypbooks/Backend && docker compose up -d
2. Run the backend with pre-signup enforced:
   - npm run start:pre-signup --prefix Haypbooks/Backend
3. Start frontend: `npm run start --prefix Haypbooks/Frontend`
4. Run the Playwright pre-signup test (ensures pre-signup is honored):
   - npm run e2e --prefix Haypbooks/Frontend -- e2e/pre-signup-flow.spec.ts

If you prefer not to run Redis, the app falls back to an in-memory pending store (useful for dev/test). In that case the backend will not attempt to connect to Redis (no error spam) and pending signups are stored only in-memory (not durable across process restarts). For production use, set `REDIS_URL` to a durable Redis instance and enable `ENFORCE_PRE_SIGNUP=true` to guarantee unverified signups are never persisted to the database.

CI integration recommendation
---------------------------

To ensure the pre-signup flow is validated in CI, add a Redis service to the CI job that runs backend tests and set:

- `REDIS_URL=redis://127.0.0.1:6379`
- `ENFORCE_PRE_SIGNUP=true`
- `ALLOW_TEST_ENDPOINTS=true`

This makes the E2E `e2e/pre-signup-flow.spec.ts` run reliably in CI and validates that unverified signups are not persisted to the database until verification completes.
│   ├── dto/                # Data transfer objects
│   ├── strategies/         # Passport JWT strategy
│   └── guards/             # JWT auth guard
├── users/                  # User management module
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── onboarding/             # Onboarding flow module
│   ├── onboarding.controller.ts
│   ├── onboarding.service.ts
│   ├── onboarding.module.ts
│   └── dto/
└── repositories/           # Data access layer
    ├── interfaces/         # Repository contracts
    │   ├── user.repository.interface.ts
    │   └── onboarding.repository.interface.ts
    └── mock/               # Mock implementations
        ├── user.repository.mock.ts
        ├── onboarding.repository.mock.ts
        └── mock-repositories.module.ts
```

## Quick Start

### 1. Install Dependencies

```powershell
cd C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend
npm install
```

### 2. Start Development Server

```powershell
npm run dev
# or
npm run start:dev
```

Server runs on `http://localhost:4000`

### 3. Build for Production

```powershell
npm run build
npm start
```

## API Endpoints

### Authentication

**POST /api/auth/signup**
- Create new user account
- Body: `{ email, name, password }`
- Returns: `{ token, user }`
- Sets cookies: `token`, `email`, `userId`, `role`

**POST /api/auth/login**
- Authenticate user
- Body: `{ email, password }`
- Returns: `{ token, user }`
- Sets cookies: `token`, `email`, `userId`, `role`

**POST /api/auth/logout**
- Clear session cookies
- Returns: `{ success: true }`

### Users

**GET /api/users/me** 🔒
- Get current user profile
- Requires: JWT token
- Returns: User object (without password)

### Onboarding

**POST /api/onboarding/save** 🔒
- Save onboarding step progress
- Body: `{ step, data }`
- Requires: JWT token
- Returns: `{ success: true }`

**GET /api/onboarding/save** 🔒
- Load saved onboarding progress
- Requires: JWT token
- Returns: `{ steps: {...} }`

**POST /api/onboarding/complete** 🔒
- Mark onboarding as complete
- Requires: JWT token
- Sets cookie: `onboardingComplete=true`
- Returns: `{ success: true }`

🔒 = Requires JWT authentication (Bearer token or cookie)

## Authentication Flow

### Signup Flow
1. POST `/api/auth/signup` with email, name, password
2. Backend hashes password with bcrypt
3. Creates user in repository
4. Generates JWT token
5. Sets cookies and returns token + user

### Login Flow
1. POST `/api/auth/login` with email, password
2. Backend validates password with bcrypt
3. Generates JWT token
4. Sets cookies and returns token + user

### Protected Routes
- Include JWT in `Authorization: Bearer <token>` header
- Or rely on httpOnly cookies (set automatically)

## Repository Pattern

The backend uses the repository pattern for data access:

**Current**: Mock repositories (in-memory)
**Future**: Real repositories (PostgreSQL + Prisma)

### Switching to Real DB

When ready to migrate to a real database:

1. Install Prisma: `npm install prisma @prisma/client`
2. Create `src/repositories/real/` directory
3. Implement real repositories using Prisma
4. Update `app.module.ts` to use RealRepositoriesModule
5. Environment variable: `DB_TYPE=real`

No code changes needed in controllers or services!

## Environment Variables

Create `.env` file:

```bash
# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Database (for Phase 5)
DB_TYPE=mock
DATABASE_URL=postgresql://user:password@localhost:5432/haypbooks
```

## Development Notes

- **Password Storage**: Currently uses bcrypt hashing (production-ready)
- **Mock DB**: In-memory storage, resets on restart
- **CORS**: Enabled for frontend development
- **Validation**: Automatic via class-validator DTOs
- **Error Handling**: Global exception filters (built into NestJS)

## Testing

```powershell
# Unit tests (coming soon)
npm test

# E2E tests (coming soon)
npm run test:e2e
```

## Database CI

- Workflow: `.github/workflows/db-validation.yml` runs DB validation and integration tests on `pull_request` to `main`.
- **Drift detection**: A scheduled workflow `.github/workflows/db-drift.yml` runs daily and checks expected schema and RLS policies.
- Enable branch protection and require the "DB Validation & Integration Tests" workflow for PRs that touch database or migrations.
- To add a badge to this README, use the Actions badge URL for the `db-validation.yml` workflow in your GitHub repo.
- Added a targeted `DB smoke` workflow (`.github/workflows/db-smoke-on-pr.yml`) which runs migrations, seeds, and a focused smoke e2e subset for PRs that touch `prisma/**` and `scripts/**`. This helps surface transient DB or migration issues earlier.
- Test harness improvements: `scripts/test/setup-test-db.js` and `scripts/migrate/run-sql.js` now include retry/backoff and a post-seed PG health-check to reduce intermittent connection termination failures in CI.

## Migration from Express

The old `server.js` has been replaced with a full NestJS application:

✅ Express → NestJS with TypeScript
✅ Basic auth → JWT with Passport
✅ No validation → class-validator DTOs
✅ Direct DB access → Repository pattern
✅ No password hashing → bcrypt
✅ Basic error handling → NestJS exception filters

## Next Steps

1. Add real database with Prisma (Phase 5)
2. Implement refresh token rotation
3. Add rate limiting
4. Add API documentation (Swagger)
5. Add comprehensive tests
6. Add logging (Winston/Pino)
7. Add health check endpoint
