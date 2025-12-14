import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect root to Dashboard
  redirect('/dashboard')
}
