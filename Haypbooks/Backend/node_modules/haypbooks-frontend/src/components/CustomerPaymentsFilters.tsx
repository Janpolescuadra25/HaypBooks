"use client"
import { useEffect, useMemo, useState } from 'react'
import DateRangeSelect from '@/components/DateRangeSelect'
import usePersistedFilterParams from '@/hooks/usePersistedFilterParams'
import FilterStatusIndicator from '@/components/FilterStatusIndicator'

type Customer = { id: string; name: string }

export default function CustomerPaymentsFilters() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  const normalizeToISO = (v: string | null) => {
    if (!v) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    if (/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(v)) {
      const [mo, d, y] = v.split('/')
      return `${y}-${mo}-${d}`
    }
    return ''
  }

  const { values, setValues, apply, clear, status, error } = usePersistedFilterParams<{ start: string; end: string; q: string; customerId: string }>(
    { reportKey: 'list:customer-payments', specs: [
      { key: 'start', normalize: normalizeToISO },
      { key: 'end', normalize: normalizeToISO },
      { key: 'q' },
      { key: 'customerId' },
    ] }
  )

  const start = values.start
  const end = values.end
  const q = values.q || ''
  const customerId = values.customerId || ''

  const canApply = useMemo(() => {
    if (start && end) return start <= end
    return true
  }, [start, end])

  useEffect(() => {
    let alive = true
    setLoadingCustomers(true)
    fetch('/api/customers?page=1&limit=200', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load customers')))
      .then(d => { if (!alive) return; setCustomers(Array.isArray(d?.customers) ? d.customers : []) })
      .finally(() => { if (!alive) return; setLoadingCustomers(false) })
    return () => { alive = false }
  }, [])

  return (
    <form className="flex flex-wrap items-end gap-2" aria-label="Customer payments filters" onSubmit={(e) => { e.preventDefault(); apply() }}>
      <DateRangeSelect start={start} end={end} onChange={(v) => setValues((prev: any) => ({ ...prev, start: v.start, end: v.end }))} showPresets={false} />

      <div className="flex flex-col">
        <label htmlFor="cp-q" className="text-xs text-slate-600">Search</label>
        <input id="cp-q" type="text" placeholder="ID, customer, allocation…" value={q}
          onChange={(e) => setValues((p: any) => ({ ...p, q: e.target.value }))}
          className="w-[24ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" />
      </div>

      <div className="flex flex-col">
        <label htmlFor="cp-customer" className="text-xs text-slate-600">Customer</label>
        <select id="cp-customer" value={customerId} onChange={(e) => setValues((p: any) => ({ ...p, customerId: e.target.value }))}
          className="w-[22ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm">
          <option value="">All customers</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <button type="submit" disabled={!canApply} className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white disabled:opacity-50">Apply</button>
        <button type="button" onClick={clear} className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white">Clear</button>
        <FilterStatusIndicator saving={status === 'saving'} error={error} />
      </div>

      <div aria-live="polite" className="sr-only">{(start || end || q || customerId) ? 'Filters applied.' : 'No filters applied.'}</div>
    </form>
  )
}
