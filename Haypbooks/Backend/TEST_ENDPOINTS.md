Test-only API endpoints (dev/test only)

These endpoints are intended for local development and automated tests. They are guarded and require explicit enabling so they are not accidentally exposed in production.

Allowed scenarios (any one of the following):

- NODE_ENV=test (explicit test environment), or
- ALLOW_TEST_ENDPOINTS=true AND (running in development, OR running in CI, OR ALLOW_TEST_ENDPOINTS_TOKEN is set). 

This means simply setting ALLOW_TEST_ENDPOINTS=true on a production server will not enable the endpoints unless one of the above conditions holds. CI runs (e.g., GitHub Actions) typically set CI=true which will permit ALLOW_TEST_ENDPOINTS=true to enable test endpoints.

Available endpoints (all under /api/test):

- GET /api/test/users
  - Returns a list of users (safe fields) for quick inspection. Example: http://localhost:4000/api/test/users

- GET /api/test/user?email={email}
  - Returns a single user row (including password hash in dev) for that email. Use only in dev. Example: http://localhost:4000/api/test/user?email=demo@haypbooks.test

- GET /api/test/otp/latest?email={email}&purpose={RESET|VERIFY}
  - Returns the latest OTP record for the email and purpose.

- POST /api/test/create-user
  - Create a new user (dev-only) with JSON { email, password, name, isEmailVerified }.

- GET /api/test/sessions?email={email}
  - Lists session rows for the given email (useful to confirm refresh sessions created on login).

Usage tips
- For local development, set NODE_ENV=development and ALLOW_TEST_ENDPOINTS=true. Example:

  # powershell
  $env:NODE_ENV = 'development'
  $env:ALLOW_TEST_ENDPOINTS = 'true'
  npm run dev

- For CI runs (GitHub Actions), set ALLOW_TEST_ENDPOINTS=true (CI environment variables are present in Actions so test endpoints will be enabled). Example snippet in GitHub Actions env:

  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/haypbooks_ui_test
  ALLOW_TEST_ENDPOINTS: 'true'
  # optionally set NODE_ENV=test for clarity
  NODE_ENV: 'test'

- For extra safety, you can use ALLOW_TEST_ENDPOINTS_TOKEN on the server instead of enabling ALLOW_TEST_ENDPOINTS alone. When set (non-empty), it also permits the endpoints.

Security
- DO NOT expose these endpoints in production. They are intentionally permissive and return sensitive dev-only details (password hashes, sessions, etc.) solely for testing.
