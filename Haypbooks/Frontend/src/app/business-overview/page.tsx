import { redirect } from 'next/navigation'

export default function LegacyBusinessOverviewRedirect() {
  redirect('/dashboard')
}
