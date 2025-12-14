// Legacy route: redirect to canonical Transactions → Chart of Accounts
import { redirect } from 'next/navigation'

export default function AccountsPage() {
  redirect('/transactions/chart-of-accounts')
}
