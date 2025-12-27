# Phone verification — testing guide

This short guide shows how to test phone verification flows locally and in Playwright using the dev-only test endpoints.

## Quick manual test
1. Sign up via the UI using a valid phone (include country code), e.g. `+1 555 123 4567`.
2. After signup, go to the verification page and choose **Send Code to Phone**.
3. In development, the server will either return the OTP in the response (dev convenience) or you can fetch the latest OTP row via the test endpoint:

```bash
curl "http://127.0.0.1:4000/api/test/otp/latest?phone=%2B15551234567"
```

4. Enter the 6-digit code in the verification form and confirm you are redirected to `/hub/selection`.

## Deterministic Playwright demo
Use the included e2e demo `e2e/demo-phone-verification.spec.ts` which:
1. Signs up with a fake phone.
2. Calls `POST /api/test/create-otp` with `{ phone, otp: '654321', purpose: 'VERIFY_PHONE' }`.
3. Navigates to `/verification`, clicks **Send Code to Phone**, enters `654321` and asserts redirect to `/hub/selection`.

## Automated persistence test
A focused Playwright spec `e2e/verify-phone-persist.spec.ts` validates that a successful phone verification causes the backend to set `isPhoneVerified=true` and populate `phoneVerifiedAt` for the user record.

Prerequisite: apply the DB migration which added `isphoneverified` and `phoneverifiedat` to the `users` table (run `npx prisma migrate dev` locally or ensure `npx prisma migrate deploy` ran in CI), and run `npx prisma generate` so the Prisma client includes the new fields.

## Notes
- Test endpoints are restricted to dev/test/CI and require ALLOW_TEST_ENDPOINTS or NODE_ENV=test.
- Use E.164 formatted phone numbers where possible; the frontend will normalize common formats before sending to the backend.
