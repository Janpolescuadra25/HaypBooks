"use client"
import DateRangeSelect from './DateRangeSelect'
import usePersistedFilterParams from '../hooks/usePersistedFilterParams'
import FilterStatusIndicator from '@/components/FilterStatusIndicator'

export default function TransactionsFilters() {
  // Use shared hook with normalization for legacy mm/dd/yyyy
  const { values, setValues, apply, clear, status, updatedAt, error } = usePersistedFilterParams<{ start: string; end: string; type: string }>({
    reportKey: 'list:transactions',
    specs: [
  { key: 'start', normalize: (v: string) => { if(!v) return ''; if(/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; if(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(v)){ const [mo,d,y]=v.split('/'); return `${y}-${mo}-${d}`;} return v } },
  { key: 'end',   normalize: (v: string) => { if(!v) return ''; if(/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; if(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(v)){ const [mo,d,y]=v.split('/'); return `${y}-${mo}-${d}`;} return v } },
      { key: 'type' },
    ]
  })

  const canApply = (!values.start || !values.end || values.start <= values.end)

  return (
    <form className="flex items-end gap-2" aria-label="Transactions filters" onSubmit={(e) => { e.preventDefault(); apply() }}>
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
      <div className="flex items-center gap-1.5">
        <button type="submit" disabled={!canApply} className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white disabled:opacity-50">Apply</button>
        <button type="button" onClick={clear} className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white">Clear</button>
  <FilterStatusIndicator saving={status === 'saving'} error={error} />
      </div>
      <div aria-live="polite" className="sr-only">{(values.start || values.end || values.type) ? 'Filters applied.' : 'No filters applied.'}</div>
    </form>
  )
}
