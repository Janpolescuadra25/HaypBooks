// Redis-backed integration tests have been removed: the project now uses DB-backed EmailVerificationToken for pending signups.
// To run DB-backed integration tests, use `pending-signup.db.integration.spec.ts` which runs when DATABASE_URL is set.

describe.skip('PendingSignupService (redis integration)', () => {
  test('skipped — Redis has been removed from this flow', () => {})
})
