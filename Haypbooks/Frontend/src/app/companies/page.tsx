import { redirect } from 'next/navigation'

export default function Page() {
  // Keep legacy route but redirect into the standalone hub to keep separation
  redirect('/hub/companies')
}
