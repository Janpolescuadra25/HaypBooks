import { redirect } from 'next/navigation'

// Legacy dedicated print view removed: redirect to the main report and use the standard Print button.
export default function APAgingPrintRedirect() {
  redirect('/reports/ap-aging')
}
