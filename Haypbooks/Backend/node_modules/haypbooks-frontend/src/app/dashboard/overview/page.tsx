import { redirect } from 'next/navigation'

// Keep /dashboard as canonical path — redirect /dashboard/overview to /dashboard
export const metadata = { title: 'Overview' }

export default function DashboardOverviewPage() {
  redirect('/dashboard')
}
