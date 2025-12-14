HaypBooks Backend — Suggested API Endpoints (phased)

Phase 1 – Authentication + OTP
--------------------------------
POST /api/auth/signup
  - body: { email, password, name? }
  - returns: { token, user }

POST /api/auth/login
  - body: { email, password }
  - returns: { token, user }

POST /api/auth/logout
  - invalidates session / clears cookies

POST /api/auth/refresh
  - body: { refreshToken }
  - returns: { token }

Sessions
--------
GET /api/auth/sessions
  - returns: list of refresh sessions for the authenticated user

POST /api/auth/sessions/revoke
  - body: { sessionId? | refreshToken? }
  - revokes specified session (must belong to authenticated user)

POST /api/auth/otp/request
  - body: { email }
  - behavior: create an OTP entry, send email/SMS if production

POST /api/auth/otp/verify
  - body: { email, otp }
  - returns: { success }

POST /api/auth/forgot-password
  - body: { email }
  - returns: { success }

POST /api/auth/reset-password
  - body: { token, password }
  - returns: { success }

Phase 2 – Company Onboarding / Multi-user
--------------------------------
POST /api/companies
  - create company

GET /api/companies/:id
  - get company details

POST /api/companies/:companyId/users
  - invite/assign a user to a company with role (ADMIN / ACCOUNTANT / VIEWER)

GET /api/companies/:companyId/users
  - list users and roles

Phase 3 – Accounting Core
--------------------------------
Chart of accounts
POST /api/companies/:companyId/accounts
GET /api/companies/:companyId/accounts

Journal entries
POST /api/companies/:companyId/journal-entries
GET /api/companies/:companyId/journal-entries/:id

Invoices
POST /api/companies/:companyId/invoices
GET /api/companies/:companyId/invoices/:invoiceId

Validation & constraints
- All CRUD endpoints require auth & company-scoped permissions
- Journal entry endpoint must validate debit == credit
- Invoice creation must validate invoice lines sum to totalAmount
