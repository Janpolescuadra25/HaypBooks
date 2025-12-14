// Dedicated print view removed. Use standard Print action on the interactive report.
import { redirect } from 'next/navigation'

export default function PrintRedirect() {
  redirect('/reports/ap-aging-detail')
}
