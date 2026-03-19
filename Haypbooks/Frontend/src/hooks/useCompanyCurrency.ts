'use client'

'use client'

import { useEffect } from 'react'
import { useCompany } from './use-company'
import { setDefaultCurrency } from '@/lib/format'

/**
 * Returns the active company currency code for formatting amounts.
 * Falls back to a default currency (USD) while loading or if missing.
 */
export function useCompanyCurrency(defaultCurrency = 'USD') {
  const { company, loading } = useCompany()
  const currency = company?.currency ?? defaultCurrency

  useEffect(() => {
    setDefaultCurrency(currency)
  }, [currency])

  return { currency, loading }
}
