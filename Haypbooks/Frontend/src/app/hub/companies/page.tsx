import { redirect } from 'next/navigation'

export default function Page() {
  // Owner Workspace has been removed — redirect to unified Dashboard
  redirect('/dashboard')
}
