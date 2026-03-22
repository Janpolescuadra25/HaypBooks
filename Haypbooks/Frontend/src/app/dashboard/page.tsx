import { redirect } from 'next/navigation'

export const metadata = { title: 'Dashboard — Haypbooks' }

export default function DashboardPage() {
  redirect('/home/dashboard')
  return null
}
