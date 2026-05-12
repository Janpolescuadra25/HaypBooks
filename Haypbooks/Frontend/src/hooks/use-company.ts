'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import apiClient from '@/lib/api-client'

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
      try {
        let data: any = null
        if (queryCompany) {
          const res = await apiClient.get(`/companies/${encodeURIComponent(queryCompany)}`)
          data = res.data
        } else {
          const res = await apiClient.get('/companies/current')
          data = res.data
        }

        // If we got just a lightweight company object (e.g., from /api/companies/current),
        // fetch the full company details by ID to ensure we have fields like country.
        if (data?.id && !data?.country) {
          const res2 = await apiClient.get(`/companies/${encodeURIComponent(data.id)}`)
          if (!cancelled) data = res2.data
        }

        if (!cancelled) setCompany(data)
      } catch (err) {
        console.warn('Failed to load company:', err)
        if (!cancelled) setCompany(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [queryCompany])

  return { company, loading }
}
