### Best Practices for Testing Signup + Email Verification Locally (Without Deploying)

Since you're not deploying yet, the goal is to **safely and repeatedly test the full signup → verification flow** without relying on real email services or public URLs. Here's the recommended approach based on your current setup (NestJS backend, console-logged emails, dev OTP return).

#### **1. Keep Using the Dev Mode "Cheat" (Best for Quick Iteration)**
Your backend already logs the OTP and returns it in responses during development — this is **perfect** for local testing.

**How to test manually**:
1. Open your app (e.g., `http://localhost:3000` or `/signup`).
2. Sign up with a new email like `test-local-123@haypbooks.test`.
3. Open your terminal running the backend.
4. Look for the log:
   ```
   Verification OTP for test-local-123@haypbooks.test: 123456
   ```
5. Construct the verification URL manually:
   ```
   http://localhost:3000/api/auth/verify-email?email=test-local-123@haypbooks.test&otp=123456
   ```
6. Paste it into your browser → you should land on the success page ("Your email has been successfully verified").

**Pros**: Fastest feedback loop, no extra setup.  
**When to use**: Daily development, quick bug fixes.

#### **2. Automate It in E2E Tests (What You're Already Doing — Keep It!)**
Your Playwright test (`verify-email.spec.ts`) already does exactly this programmatically:
- Signs up via API
- Extracts the dev OTP from response
- Navigates to verify URL
- Asserts success page

**Best practice**:
- Run this frequently:
  ```bash
  npm run e2e -- e2e/verify-email.spec.ts
  ```
- Keep updating snapshots when UI changes.

This gives you **confidence** that the flow works end-to-end without manual steps.

#### **3. Optional: Use a Local Email Trap for More Realistic Testing**
If you want to test **actual email delivery** (template rendering, links, etc.) without sending real emails:

**Tool**: MailHog or Mailpit (free, Docker-based SMTP server with web UI)

**Quick setup** (one-time):
```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```
- Web UI: http://localhost:8025

**Configure in `.env.local`**:
```
MAILER_PROVIDER=smtp
MAILER_HOST=localhost
MAILER_PORT=1025
MAILER_USERNAME=
MAILER_PASSWORD=
MAILER_FROM=no-reply@haypbooks.local
```

**Test flow**:
1. Sign up → email appears in MailHog UI.
2. Click the "Verify My Email" button in the captured email.
3. You're redirected to your local app → success page.

**Pros**: See exact rendered email, test links naturally.  
**When to use**: Before launch, or when tweaking email templates.

#### **4. What NOT to Do Right Now**
- Don't use real SMTP (SendGrid, Gmail, etc.) for frequent testing — risk of rate limits or spam flags.
- Don't rely on manual email checking with real providers.

#### **Summary: Your Current Local Testing Strategy (Recommended)**

| Scenario                  | Method                              | Command / Steps                          |
|---------------------------|-------------------------------------|------------------------------------------|
| Quick manual test         | Use console-logged OTP              | Check terminal → build URL → paste in browser |
| Automated regression      | Playwright E2E test                 | `npm run e2e -- e2e/verify-email.spec.ts` |
| Visual email inspection   | (Optional) MailHog                  | Docker + env config → view at localhost:8025 |

You're already doing the **best possible thing** for pre-deployment: using dev OTP logging + automated E2E tests.

