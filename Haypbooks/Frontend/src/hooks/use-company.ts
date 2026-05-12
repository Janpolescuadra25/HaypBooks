'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Company {
  id: string
  name?: string
  currency?: string
  fiscalYearStart?: string
  plan?: string
  country?: string
  taxId?: string
  vatNumber?: string
}

/**
 * Returns the active company context for the current user session.
 *
 * The hook will re-fetch whenever the `company` query parameter changes.
 * If a query param is present it will fetch the specific company by ID
 * rather than relying solely on `/api/companies/current`.
 */
export function useCompany() {
  const search = useSearchParams()
  const queryCompany = search?.get('company')

  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      try {
        let data: any = null
        if (queryCompany) {
          const res = await fetch(`/api/companies/${encodeURIComponent(queryCompany)}`, { signal: controller.signal })
          if (res.ok) data = await res.json()
        } else {
          const res = await fetch('/api/companies/current', { signal: controller.signal })
          if (res.ok) data = await res.json()
        }

        // If we got just a lightweight company object (e.g., from /api/companies/current),
        // fetch the full company details by ID to ensure we have fields like country.
        if (data?.id && !data?.country) {
          const res2 = await fetch(`/api/companies/${encodeURIComponent(data.id)}`, { signal: controller.signal })
          if (res2.ok) {
            const full = await res2.json()
            if (!cancelled) data = full
          }
        }

        if (!cancelled) setCompany(data)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          console.warn('Company fetch timed out')
        }
        if (!cancelled) setCompany(null)
      } finally {
        clearTimeout(timeoutId)
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [queryCompany])

  return { company, loading }
}
