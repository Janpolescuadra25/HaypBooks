"use client"

import { useEffect, useMemo, useState } from 'react'
import usePersistedFilterParams from '@/hooks/usePersistedFilterParams'
import FilterStatusIndicator from '@/components/FilterStatusIndicator'

type Vendor = { id: string; name: string }

export default function APAgingDetailFilters() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)

  const { values, setValues, apply, clear, status, error } = usePersistedFilterParams<{ vendorId: string; vendor: string }>({
    reportKey: 'report:ap-aging-detail:filters',
    specs: [ { key: 'vendorId' }, { key: 'vendor' } ],
  })

  const vendorId = values.vendorId || ''
  const anyActive = !!vendorId

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch('/api/vendors?page=1&limit=200', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load vendors')))
      .then(d => { if (!alive) return; setVendors(Array.isArray(d?.vendors) ? d.vendors : []) })
      .catch(() => { if (!alive) return; setVendors([]) })
      .finally(() => { if (!alive) return; setLoading(false) })
    return () => { alive = false }
  }, [])

  const handleChange = (id: string) => {
    const v = vendors.find(x => x.id === id)
    setValues((prev: any) => ({ ...prev, vendorId: id, vendor: v?.name || '' }))
    // Immediate apply on selection
    setTimeout(() => apply(), 0)
  }

  const reset = () => {
    clear()
  }

  const vendorOptions = useMemo(() => vendors, [vendors])

  return (
    <div className="flex items-center gap-2">
      <label className="inline-flex items-center gap-1 text-sm">
        <span className="text-slate-600">Vendor</span>
        <select
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 min-w-[18ch]"
          value={vendorId}
          onChange={(e) => handleChange(e.target.value)}
          aria-label="Filter by vendor"
          disabled={loading}
        >
          <option value="">All</option>
          {vendorOptions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </label>
      {anyActive && (
        <button
          type="button"
          className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-white"
          onClick={reset}
        >Reset</button>
      )}
      <FilterStatusIndicator saving={status === 'saving'} error={error} />
      <span className="sr-only" aria-live="polite">{anyActive ? 'Vendor filter active' : 'No vendor filter active'}</span>
    </div>
  )
}
