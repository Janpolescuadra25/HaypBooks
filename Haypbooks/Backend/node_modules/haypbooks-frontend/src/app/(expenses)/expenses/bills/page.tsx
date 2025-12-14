import { redirect } from 'next/navigation'

// Lightweight alias: preserve deep links to "/expenses/bills" by redirecting to canonical "/bills"
// Preserve all query parameters to avoid breaking filters/pagination.
export default function BillsAlias({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams || {})) {
    if (Array.isArray(v)) {
      for (const val of v) sp.append(k, String(val))
    } else if (v != null) {
      sp.set(k, String(v))
    }
  }
  const qs = sp.toString()
  redirect(`/bills${qs ? `?${qs}` : ''}`)
}
