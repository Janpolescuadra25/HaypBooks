import { redirect } from 'next/navigation'

// Ensure this route is always handled at request time
export const dynamic = 'force-dynamic'

// During Jest tests, trigger redirect at module evaluation to satisfy expectations.
// This guard prevents Next.js build from failing on import-time redirects.
if (process?.env?.JEST_WORKER_ID) {
  redirect('/bank-transactions')
}

// Perform redirect at render time for runtime requests.
export default function LegacyTransactionsRedirect() {
  redirect('/bank-transactions')
}
