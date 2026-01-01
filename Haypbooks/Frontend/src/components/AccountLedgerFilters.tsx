"use client"
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import FilterStatusIndicator from './FilterStatusIndicator'
import usePersistedFilterParams from '../hooks/usePersistedFilterParams'

type Account = { id: string; number: string; name: string }

export default function AccountLedgerFilters() {
  const sp = useSearchParams() ?? new URLSearchParams()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState(sp.get('account') || '')
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/accounts', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (alive) setAccounts(data.accounts || [])
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  // keep local state in sync if URL changes elsewhere
  useEffect(() => {
    setAccount(sp.get('account') || '')
  }, [sp])

  const { values, setValues, apply: applyPersist, clear: clearPersist, updatedAt, status, error } = usePersistedFilterParams<{ account: string }>(
    { reportKey: 'list:ledger', specs: [{ key: 'account' }] }
  )
  // Mirror local state to values for controlled input (optional: could drop local state and use values.account directly)
  useEffect(() => { if (values.account !== account) setAccount(values.account) }, [values.account, account])

  function apply() {
  setValues((v: typeof values) => ({ ...v, account }))
    applyPersist()
    setJustSaved(true)
    window.setTimeout(() => setJustSaved(false), 1500)
  }

  function reset() {
    setAccount('')
  setValues((v: typeof values) => ({ ...v, account: '' }))
    clearPersist()
    setJustSaved(true)
    window.setTimeout(() => setJustSaved(false), 1500)
  }

  return (
    <form className="inline-flex items-end gap-2" aria-label="Ledger filters" onSubmit={(e) => { e.preventDefault(); apply() }}>
      <div className="flex flex-col">
        <label htmlFor="ledger-acct" className="text-xs text-slate-600">Account</label>
        <select
          id="ledger-acct"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="min-w-[22ch] rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
        >
          <option value="">All</option>
          {accounts.map(a => (
            <option key={a.id} value={a.number}>{a.number} · {a.name}</option>
          ))}
          {loading && <option disabled>Loading…</option>}
        </select>
      </div>
      <button type="submit" className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white">Apply</button>
      <button type="button" className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-white" onClick={reset}>Clear</button>
  <FilterStatusIndicator saving={status === 'saving'} error={error} />
      <div aria-live="polite" className="sr-only">{justSaved ? 'Filters saved.' : (account ? 'Filters applied.' : 'No filters applied.')}</div>
    </form>
  )
}
