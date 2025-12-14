"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'

export type Status = 'not-enrolled' | 'pending' | 'approved'
export type Methods = { cards: boolean; ach: boolean; applePay: boolean; paypal: boolean; venmo: boolean }
export type Application = { business?: any; owner?: any; deposit?: any; submittedAt?: string }
export type PaymentsState = {
  status: Status
  methods: Methods
  depositAccount: 'bank' | 'qb-checking'
  instantDeposit: boolean
  disputeProtection: boolean
  application?: Application
  merchantId?: string
  disputeEligible?: boolean
  sameDayEnabled?: boolean
  mapping?: { standardDeposit: string; instantDeposit: string; processingFees: string }
  selectedStatement?: string
}

export const DEFAULT_STATE: PaymentsState = {
  status: 'not-enrolled',
  methods: { cards: true, ach: true, applePay: false, paypal: false, venmo: false },
  depositAccount: 'bank',
  instantDeposit: false,
  disputeProtection: false,
  disputeEligible: true,
  mapping: { standardDeposit: 'Checking', instantDeposit: 'Checking', processingFees: 'Payments Fees' },
}

const KEY = 'hb.payments'

export function usePaymentsState() {
  const [state, setState] = useState<PaymentsState>(DEFAULT_STATE)

  // load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setState(prev => ({ ...prev, ...JSON.parse(raw) }))
    } catch {}
  }, [])

  // persist on change
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, [state])

  const save = useCallback((partial: Partial<PaymentsState>) => {
    setState(s => ({ ...s, ...partial }))
  }, [])

  const refresh = useCallback(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setState(prev => ({ ...prev, ...JSON.parse(raw) }))
    } catch {}
  }, [])

  const reset = useCallback(() => {
    try { localStorage.removeItem(KEY) } catch {}
    setState(DEFAULT_STATE)
  }, [])

  const seedApproved = useCallback(() => {
    const id = `HBP-${Math.random().toString().slice(2,6)}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`
    const approved: PaymentsState = {
      ...DEFAULT_STATE,
      status: 'approved',
      methods: { cards: true, ach: true, applePay: true, paypal: true, venmo: true },
      application: {
        business: { legalName: 'Acme Company LLC', entityType: 'LLC', taxId: '12-3456789' },
        owner: { firstName: 'Alex', lastName: 'Doe', email: 'alex@example.com', phone: '(555) 123-4567' },
        deposit: { choice: 'existing', existingAccountLabel: 'Checking •••• 1234' },
        submittedAt: new Date().toISOString(),
      },
      merchantId: id,
      disputeEligible: true,
      sameDayEnabled: true,
    }
    try { localStorage.setItem(KEY, JSON.stringify(approved)) } catch {}
    setState(approved)
    return approved
  }, [])

  return { state, setState, save, refresh, reset, seedApproved }
}
