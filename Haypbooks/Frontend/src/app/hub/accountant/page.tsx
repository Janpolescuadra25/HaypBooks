import { redirect } from 'next/navigation'

export default function Page() {
  // Accountant Hub page removed — redirect to unified Dashboard
  redirect('/dashboard')
}
