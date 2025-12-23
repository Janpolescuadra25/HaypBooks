import { redirect } from 'next/navigation'

export default function Page() {
  // Redirect legacy route into the standalone accountant hub
  redirect('/hub/accountant')
}
