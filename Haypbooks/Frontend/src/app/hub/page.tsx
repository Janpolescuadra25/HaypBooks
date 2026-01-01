import { redirect } from 'next/navigation'

export default function Page() {
  // Ensure visiting /hub lands on Companies by default
  redirect('/hub/companies')
}