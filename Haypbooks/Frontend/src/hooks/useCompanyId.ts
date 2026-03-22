'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Resolves the active company ID for the current session.
 * Tries URL query param `company` first, then /api/companies/recent, then /api/companies/current.
 */
export function useCompanyId() {
  const search = useSearchParams()
  const queryCompany = search?.get('company')

  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // Query param overrides other sources
        if (queryCompany) {
          const res = await fetch(`/api/companies/${encodeURIComponent(queryCompany)}`, { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            if (!cancelled && data?.id) {
              setCompanyId(data.id)
              setLoading(false)
              return
            }
          }
        }

        const res = await fetch('/api/companies/recent', { cache: 'no-store' })
        if (res.ok) {
          const list = await res.json()
          if (!cancelled && Array.isArray(list) && list.length > 0) {
            setCompanyId(list[0].id)
            setLoading(false)
            return
          }
        }

        // fallback
        const res2 = await fetch('/api/companies/current', { cache: 'no-store' })
        if (res2.ok) {
          const data = await res2.json()
          if (!cancelled && data?.id) {
            setCompanyId(data.id)
            setLoading(false)
            return
          }
        }

        if (!cancelled) {
          setError('No company found. Please create or select a company.')
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load company context.')
          setLoading(false)
        }
      }
    })()
    return () => { cancelled = true }
  }, [queryCompany])

  return { companyId, loading, error }
}
