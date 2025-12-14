"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'

export type Address = { street?: string; city?: string; state?: string; postal?: string; country?: string }
export type TaxIdType = 'EIN' | 'SSN'

export type CompanySettings = {
  // Visual identity
  logoUrl?: string
  // Names
  companyName: string
  legalName?: string
  legalSameAsCompany: boolean
  // Tax ID
  taxIdType?: TaxIdType
  taxId?: string
  // Company type
  taxForm?: string
  industry?: string
  // Contact
  companyEmail?: string
  customerEmail?: string
  customerEmailSameAsCompany: boolean
  phone?: string
  website?: string
  // Addresses
  companyAddress: Address
  publicAddress: Address
  publicAddressSameAsCompany: boolean
  legalAddress: Address
  legalAddressSameAsCompany: boolean
}

const KEY_SETTINGS = 'hb.company.settings'
const KEY_COMPANY_LEGACY = 'hb.company'
const KEY_LAYOUT = 'hb.invoice.layout'

const DEFAULTS: CompanySettings = {
  companyName: '',
  legalSameAsCompany: true,
  taxIdType: 'EIN',
  customerEmailSameAsCompany: true,
  companyAddress: {},
  publicAddress: {},
  publicAddressSameAsCompany: true,
  legalAddress: {},
  legalAddressSameAsCompany: true,
}

export function useCompanySettings() {
  const [state, setState] = useState<CompanySettings>(DEFAULTS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return
    try {
      const raw = localStorage.getItem(KEY_SETTINGS)
      if (raw) {
        setState({ ...DEFAULTS, ...JSON.parse(raw) })
        setLoaded(true)
        return
      }
      // Prefill from legacy company and layout if available
      const rawCompany = localStorage.getItem(KEY_COMPANY_LEGACY)
      const rawLayout = localStorage.getItem(KEY_LAYOUT)
      const legacy = rawCompany ? JSON.parse(rawCompany) : {}
      const layout = rawLayout ? JSON.parse(rawLayout) : {}
      const prefill: CompanySettings = {
        ...DEFAULTS,
        companyName: legacy.name || '',
        companyEmail: legacy.email,
        phone: legacy.phone,
        website: legacy.website,
        logoUrl: layout.logoUrl,
        companyAddress: legacy.address || {},
        publicAddressSameAsCompany: !!legacy.publicAddressSame,
        publicAddress: legacy.publicAddressSame ? (legacy.address || {}) : (legacy.publicAddress || {}),
      }
      setState(prefill)
    } catch {
      setState(DEFAULTS)
    } finally {
      setLoaded(true)
    }
  }, [loaded])

  const save = useCallback((patch: Partial<CompanySettings>) => {
    setState(prev => {
      const next = { ...prev, ...patch }
      // Mirror "same as" toggles
      if (next.legalSameAsCompany) next.legalName = next.companyName
      if (next.customerEmailSameAsCompany) next.customerEmail = next.companyEmail
      if (next.publicAddressSameAsCompany) next.publicAddress = next.companyAddress
      if (next.legalAddressSameAsCompany) next.legalAddress = next.companyAddress
      try {
        localStorage.setItem(KEY_SETTINGS, JSON.stringify(next))
        // Persist to legacy structures used by invoice layout panel
        const legacy = {
          name: next.companyName,
          email: next.companyEmail,
          phone: next.phone,
          website: next.website,
          address: next.companyAddress || {},
          publicAddressSame: next.publicAddressSameAsCompany,
        }
        localStorage.setItem(KEY_COMPANY_LEGACY, JSON.stringify(legacy))
        // Also mirror the logo to invoice layout if present
        if (next.logoUrl) {
          try {
            const rawLayout = localStorage.getItem(KEY_LAYOUT)
            const layout = rawLayout ? JSON.parse(rawLayout) : {}
            localStorage.setItem(KEY_LAYOUT, JSON.stringify({ ...layout, logoUrl: next.logoUrl }))
          } catch {}
        }
      } catch {}
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setState(DEFAULTS)
    try { localStorage.removeItem(KEY_SETTINGS) } catch {}
  }, [])

  return { state, save, reset, loaded }
}
