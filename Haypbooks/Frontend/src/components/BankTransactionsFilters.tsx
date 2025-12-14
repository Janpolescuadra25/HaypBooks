"use client"
import DateRangeSelect from './DateRangeSelect'
import usePersistedFilterParams from '../hooks/usePersistedFilterParams'
import FilterStatusIndicator from '@/components/FilterStatusIndicator'
import { useEffect, useState } from 'react'
import { flags } from '@/lib/flags'

type Tag = { id: string; name: string; group?: string | null }

export default function BankTransactionsFilters() {
  const { values, setValues, apply, clear, status, updatedAt, error } = usePersistedFilterParams<{ start: string; end: string; type: string; bankStatus: string; tag?: string }>({
    reportKey: 'list:transactions',
    specs: [
      { key: 'start', normalize: (v: string) => { if(!v) return ''; if(/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; if(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(v)){ const [mo,d,y]=v.split('/'); return `${y}-${mo}-${d}`;} return v } },
      { key: 'end',   normalize: (v: string) => { if(!v) return ''; if(/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; if(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(v)){ const [mo,d,y]=v.split('/'); return `${y}-${mo}-${d}`;} return v } },
      { key: 'type' },
      { key: 'bankStatus' },
      { key: 'tag' },
    ]
  })
  const [tags, setTags] = useState<Tag[]>([])
  useEffect(() => {
    if (!flags.tags) return
    let alive = true
    fetch('/api/tags', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(d => { if (!alive) return; setTags(Array.isArray(d?.tags) ? d.tags : []) })
    return () => { alive = false }
  }, [])
  const canApply = (!values.start || !values.end || values.start <= values.end)
  return (
    <form className="flex items-end gap-2" aria-label="Bank transactions filters" onSubmit={(e) => { e.preventDefault(); apply() }}>
      <DateRangeSelect start={values.start} end={values.end} onChange={(v) => setValues((prev: any) => ({ ...prev, start: v.start, end: v.end }))} showPresets={false} />
      <div className="flex flex-col">
        <label htmlFor="txn-type" className="text-xs text-slate-600">Type</label>
        <select id="txn-type" value={values.type} onChange={(e) => setValues((p: any) => ({ ...p, type: e.target.value }))} className="w-[16ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm">
          <option value="">All</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
          <option value="Transfer">Transfer</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label htmlFor="txn-bankStatus" className="text-xs text-slate-600">Status</label>
        <select id="txn-bankStatus" value={values.bankStatus} onChange={(e) => setValues((p: any) => ({ ...p, bankStatus: e.target.value }))} className="w-[16ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm">
          <option value="">All</option>
          <option value="for_review">For Review</option>
          <option value="categorized">Categorized</option>
          <option value="excluded">Excluded</option>
        </select>
      </div>
      {flags.tags && (
        <div className="flex flex-col">
          <label htmlFor="txn-tag" className="text-xs text-slate-600">Tag</label>
          <select id="txn-tag" value={values.tag || ''} onChange={(e) => setValues((p: any) => ({ ...p, tag: e.target.value }))} className="w-[18ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm">
            <option value="">All tags</option>
            {tags.map(t => (
              <option key={t.id} value={t.id}>{t.group ? `${t.group}: ` : ''}{t.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <button type="submit" disabled={!canApply} className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white disabled:opacity-50">Apply</button>
        <button type="button" onClick={clear} className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white">Clear</button>
  <FilterStatusIndicator saving={status === 'saving'} error={error} />
      </div>
      <div aria-live="polite" className="sr-only">{(values.start || values.end || values.type || values.bankStatus || values.tag) ? 'Filters applied.' : 'No filters applied.'}</div>
    </form>
  )
}
