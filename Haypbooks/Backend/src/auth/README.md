# Auth Module

Handles all authentication and user-identity flows for HaypBooks.

---

## 1. Architecture

```
src/auth/
├── auth.controller.ts       — HTTP endpoints (/api/auth/*)
├── auth.module.ts           — NestJS module wiring
├── prisma-auth.service.ts   — Core sign-in / session / OTP logic (Prisma)
├── auth.service.ts          — Thin wrapper / legacy shim
├── pending-signup.service.ts— Temporary records during multi-step registration
├── verification.service.ts  — OTP generation + email / phone sending
├── decorators/
│   └── roles.decorator.ts   — @Roles(...roleNames) metadata decorator
├── dto/
│   ├── auth.dto.ts          — LoginDto, SignupDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto
│   └── …                    — send-code, setup-pin, verify-code, verify-pin DTOs
├── guards/
│   ├── jwt-auth.guard.ts    — Verifies JWT from cookie/header; applied globally on protected routes
│   └── roles.guard.ts       — Reads @Roles() metadata; checks user.role / user.isOwner
└── strategies/
    └── jwt.strategy.ts      — Passport JWT strategy that deserialises the token payload
```

---

## 2. Sign-up Flow (two-step with OTP verification)

```
POST /api/auth/pre-signup
  body: { email, password, name?, phone?, role, preferredHub?, companyName? }
  → validates credentials, creates PendingSignup record, sends email OTP (or phone OTP)
  → dev: returns { signupToken, otp } (OTP hidden in prod)

POST /api/auth/complete-signup
  body: { signupToken, code, method: 'email'|'phone' }
  → verifies OTP, creates User record, sets JWT + refreshToken cookies
  → returns { token, user }
```

---

## 3. Sign-in Flow

```
POST /api/auth/login
  body: { email, password }
  → bcrypt password check, creates session, sets cookies
  → returns { token, user }

POST /api/auth/refresh
  cookie: refreshToken
  → validates refresh token, rotates both JWT cookies
  → returns { token }

POST /api/auth/logout
  → clears all auth cookies

GET /api/auth/me
  guard: JwtAuthGuard
  → returns current user from DB
```

---

## 4. Password Reset Flow

```
POST /api/auth/forgot-password
  body: { email }
  → rate-limited (5 per 60 min per email)
  → creates 6-digit OTP (60-minute TTL), sends via MailService.buildPasswordResetHtml
  → dev: returns { success, otp }

POST /api/auth/verify-otp
  body: { email?, phone?, otpCode }
  → verifies OTP; marks email/phone as verified if the OTP purpose is VERIFY_EMAIL/MFA
  → returns { success }

POST /api/auth/reset-password
  body: { email, otpCode, newPassword }
  → verifies OTP + updates hashed password, clears OTP row
```

---

## 5. Email Verification

```
GET /api/auth/verify-email?email=…&otp=…
  → verifies link-in-email OTP, marks isEmailVerified=true
  → auto-login if ENABLE_AUTO_VERIFY_LOGIN=true
  → redirects to FRONTEND_URL/verify-email?status=success|error|invalid
```

---

## 6. OTP / Send-code Flows

```
POST /api/auth/send-verification   — send/resend email or phone OTP during signup
POST /api/auth/send-code           — (verification.controller) standalone OTP send
POST /api/auth/verify-code         — (verification.controller) OTP check
POST /api/auth/setup-pin           — set a PIN for the user
POST /api/auth/verify-pin          — verify a PIN
```

---

## 7. Guards Usage

### JwtAuthGuard
Validates the `token` HTTP-only cookie (or `Authorization: Bearer …` header).  
Apply to any protected route:
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Req() req) { return req.user }
```

### RolesGuard
Layered on top of `JwtAuthGuard` for fine-grained role checks.  
Supported roles: **Owner**, **Admin**, **Accountant**, **Bookkeeper**, **Viewer**.  
Workspace owners (`user.isOwner === true`) always pass.

```typescript
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Owner', 'Admin')
@Delete(':id')
remove(@Param('id') id: string) { … }
```

---

## 8. Database Entities

| Table | Purpose |
|-------|---------|
| `User` | Core user record; `isEmailVerified`, `isPhoneVerified`, `role` |
| `Session` | One row per active refresh token; rotated on each `/refresh` call |
| `Otp` | Short-lived codes for email/phone/MFA/password-reset; `purpose` discriminates flow |
| `PendingSignup` | Temporary state between pre-signup and complete-signup |
| `SecurityEvent` | Audit log for logins, failures, suspicious activity |
| `WorkspaceUser` | Links `User` → `Workspace`; `roleId` FK → `Role` table |

---

## 9. Security Features

- **Bcrypt** password hashing (via `src/utils/bcrypt-fallback.ts`)
- **HMAC** phone normalisation (HMAC_KEY env var)
- **HTTP-only cookies** for JWT + refresh token (no JS access)
- **Rate limiting** on forgot-password (5 req / 60 min / email)
- **OTP TTL**: 10 min (email verify), 60 min (password reset)
- **Audit trail**: all sign-in / sign-up / refresh events written to `SecurityEvent`
- **Email enumeration protection**: all unauthenticated endpoints return the same shape on user-not-found

---

## 10. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | JWT signing secret |
| `FRONTEND_URL` | ✅ | Base URL for redirect links in emails |
| `SENDGRID_API_KEY` | prod | SendGrid API key |
| `SENDGRID_FROM` | prod | Sender address for SendGrid |
| `SMTP_HOST` | dev | SMTP host (MailHog / Mailtrap) |
| `HMAC_KEY` | prod | HMAC key for phone hashing |
| `ENABLE_AUTO_VERIFY_LOGIN` | optional | Auto-login after email link click |
| `ALLOW_TEST_ENDPOINTS` | dev | Expose debug OTP endpoints |

See [../../.env.example](../../.env.example) for the full list.
