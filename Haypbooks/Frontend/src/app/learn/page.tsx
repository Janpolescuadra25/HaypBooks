import { redirect } from 'next/navigation'

export default function LearnRedirect() {
  // Redirect legacy /learn to the canonical public page
  redirect('/learn-and-support')
}