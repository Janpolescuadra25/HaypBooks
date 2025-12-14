"use client"
import { useEffect, useMemo, useState } from 'react'
import DateRangeSelect from './DateRangeSelect'
import FilterStatusIndicator from './FilterStatusIndicator'
import usePersistedFilterParams from '../hooks/usePersistedFilterParams'
import { flags } from '@/lib/flags'

type Tag = { id: string; name: string; group?: string | null }

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'pending_approval', label: 'Pending approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
]

export function BillsFilters() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)

  // helpers: normalize to ISO (YYYY-MM-DD). Accept old mm/dd/yyyy from prior UI.
  const normalizeToISO = (v: string | null) => {
    if (!v) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    if (/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(v)) {
      const [mo, d, y] = v.split('/')
      return `${y}-${mo}-${d}`
    }
    return ''
  }

  const { values, setValues, apply, clear, updatedAt, status, error } = usePersistedFilterParams<{ start: string; end: string; status: string; tag?: string }>(
    { reportKey: 'list:bills', specs: [
      { key: 'start', normalize: normalizeToISO },
      { key: 'end', normalize: normalizeToISO },
      { key: 'status' },
      { key: 'tag' },
    ] }
  )
  const start = values.start
  const end = values.end
  const billStatus = values.status
  const tag = values.tag || ''
  const setStart = (v: string) => setValues((prev: typeof values) => ({ ...prev, start: v }))
  const setEnd = (v: string) => setValues((prev: typeof values) => ({ ...prev, end: v }))
  const setBillStatus = (v: string) => setValues((prev: typeof values) => ({ ...prev, status: v }))
  const setTag = (v: string) => setValues((prev: typeof values) => ({ ...prev, tag: v }))

  const canApply = useMemo(() => {
    if (start && end) return start <= end
    return true
  }, [start, end])

  useEffect(() => {
    if (!flags.tags) return
    let alive = true
    setLoadingTags(true)
    fetch('/api/tags', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load tags')))
      .then((d) => { if (!alive) return; setTags(Array.isArray(d?.tags) ? d.tags : []) })
      .finally(() => { if (!alive) return; setLoadingTags(false) })
    return () => { alive = false }
  }, [])

  // apply and clear now provided by hook (persist + URL sync)

  return (
    <form className="flex items-end gap-2" aria-label="Bills filters" onSubmit={(e) => { e.preventDefault(); apply() }}>
  <DateRangeSelect start={start} end={end} onChange={(v) => { setStart(v.start); setEnd(v.end) }} showPresets={false} />
      <div className="flex flex-col">
        <label htmlFor="bill-filter-status" className="text-xs text-slate-600">Status</label>
  <select id="bill-filter-status" value={billStatus} onChange={(e) => setBillStatus(e.target.value)} className="w-[14ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm">
          {statusOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {flags.tags && (
        <div className="flex flex-col">
          <label htmlFor="bill-filter-tag" className="text-xs text-slate-600">Tag</label>
          <select id="bill-filter-tag" value={tag} onChange={(e) => setTag(e.target.value)} className="w-[18ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm">
            <option value="">All tags</option>
            {tags.map(t => (
              <option key={t.id} value={t.id}>
                {t.group ? `${t.group}: ` : ''}{t.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex items-center gap-1.5">
  <button type="submit" disabled={!canApply} className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white disabled:opacity-50">Apply</button>
  <button type="button" onClick={clear} className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white">Clear</button>
  <FilterStatusIndicator saving={status === 'saving'} error={error} />
      </div>
      <div aria-live="polite" className="sr-only">
  {billStatus ? `Status filter ${billStatus} applied.` : 'No status filter applied.'}
  {tag ? ` Tag filter applied.` : ''}
      </div>
    </form>
  )
}
