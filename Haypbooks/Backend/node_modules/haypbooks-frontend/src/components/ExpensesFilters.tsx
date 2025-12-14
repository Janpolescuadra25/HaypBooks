"use client"
import { useMemo } from 'react'
import DateRangeSelect from './DateRangeSelect'
import FilterStatusIndicator from './FilterStatusIndicator'
import usePersistedFilterParams from '../hooks/usePersistedFilterParams'

export default function ExpensesFilters() {
  // normalization reused from other filters (mm/dd/yyyy -> ISO)
  const normalizeToISO = (v: string | null) => {
    if (!v) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    if (/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(v)) {
      const [mo, d, y] = v.split('/')
      return `${y}-${mo}-${d}`
    }
    return ''
  }

  const { values, setValues, apply, clear, updatedAt, status, error } = usePersistedFilterParams<{ start: string; end: string; category: string }>(
    { reportKey: 'list:expenses', specs: [
      { key: 'start', normalize: normalizeToISO },
      { key: 'end', normalize: normalizeToISO },
      { key: 'category' },
    ] }
  )

  const start = values.start
  const end = values.end
  const category = values.category
  const setStart = (v: string) => setValues(prev => ({ ...prev, start: v }))
  const setEnd = (v: string) => setValues(prev => ({ ...prev, end: v }))
  const setCategory = (v: string) => setValues(prev => ({ ...prev, category: v }))

  const canApply = useMemo(() => {
    if (start && end) return start <= end
    return true
  }, [start, end])

  return (
    <form className="flex items-end gap-2" aria-label="Expenses filters" onSubmit={(e) => { e.preventDefault(); apply() }}>
      <DateRangeSelect start={start} end={end} onChange={(v) => { setStart(v.start); setEnd(v.end) }} showPresets={false} />
      <div className="flex flex-col">
        <label htmlFor="exp-category" className="text-xs text-slate-600">Category</label>
        <select id="exp-category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-[16ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm">
          <option value="">All</option>
          <option value="Meals">Meals</option>
          <option value="Travel">Travel</option>
          <option value="Supplies">Supplies</option>
          <option value="Utilities">Utilities</option>
          <option value="Rent">Rent</option>
        </select>
      </div>
      <div className="flex items-center gap-1.5">
        <button type="submit" disabled={!canApply} className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white disabled:opacity-50">Apply</button>
        <button type="button" onClick={clear} className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white">Clear</button>
  <FilterStatusIndicator saving={status === 'saving'} error={error} />
      </div>
      <div aria-live="polite" className="sr-only">{category || start || end ? 'Filters applied.' : 'No filters applied.'}</div>
    </form>
  )
}
