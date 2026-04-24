'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, MoreVertical, Download, Filter, SlidersHorizontal, CheckSquare, Square, X, ArrowUpDown, RefreshCw, Eye } from 'lucide-react'
import { apService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import ResizableTable, { type Column as ResizableColumn } from '@/components/shared/ResizableTable'
import { csvDownload, MenuBtn } from './_helpers'

interface ApAgingRow {
  id: string
  vendorName?: string
  current: number
  days1To30: number
  days31To60: number
  days61To90: number
  over90: number
  total: number
}
type SortKey = 'vendorName' | 'current' | 'days1To30' | 'days31To60' | 'days61To90' | 'over90' | 'total'
type ColDef = { key: string; label: string; visible: boolean; width: number; align?: ResizableColumn<ApAgingRow>['align'] }

const DEFAULT_COLS: ColDef[] = [
  { key: 'vendorName',  label: 'Vendor',    visible: true, width: 220 },
  { key: 'current',     label: 'Current',   visible: true, width: 110, align: 'right' },
  { key: 'days1To30',   label: '1–30 Days', visible: true, width: 100, align: 'right' },
  { key: 'days31To60',  label: '31–60 Days',visible: true, width: 100, align: 'right' },
  { key: 'days61To90',  label: '61–90 Days',visible: true, width: 100, align: 'right' },
  { key: 'over90',      label: '90+ Days',  visible: true, width: 100, align: 'right' },
  { key: 'total',       label: 'Total',     visible: true, width: 130, align: 'right' },
]
const STORAGE_KEY = 'ap-aging-cols-v4'

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) { const saved = JSON.parse(s) as ColDef[]; return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width, visible: sc.visible } : d }) }
  } catch {}
  return DEFAULT_COLS
}

function compare(a: ApAgingRow, b: ApAgingRow, key: SortKey, dir: 'asc' | 'desc'): number {
  if (key !== 'vendorName') { const d = (a[key] ?? 0) - (b[key] ?? 0); return dir === 'asc' ? d : -d }
  const al = (a.vendorName ?? '').toLowerCase(); const bl = (b.vendorName ?? '').toLowerCase()
  return dir === 'asc' ? al.localeCompare(bl) : bl.localeCompare(al)
}

export default function ApAgingPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows]       = useState<ApAgingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey]   = useState<SortKey>('total')
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 25
  const [selected, setSelected]         = useState<Set<string>>(new Set())
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [menuPos, setMenuPos]           = useState<{ x: number; y: number } | null>(null)
  const [showExport, setShowExport]     = useState(false)
  const [showColToggle, setShowColToggle]   = useState(false)
  const [cols, setCols] = useState<ColDef[]>(() => loadCols())
  const colsRef = useRef(cols)
  const [toast, setToast] = useState('')

  useEffect(() => { colsRef.current = cols }, [cols])
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const saveCols  = (next: ColDef[]) => { setCols(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {} }
  const toggleCol = (key: string)   => saveCols(cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c))

  const visibleCols = cols.filter(c => c.visible)

  const handleColumnsChange = (next: ResizableColumn<ApAgingRow>[]) => {
    saveCols(cols.map(col => {
      const updated = next.find(c => c.key === col.key)
      return updated ? { ...col, width: updated.width } : col
    }))
  }
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fetchAging = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await apService.listApAging(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.rows ?? [])
    } catch {
      setError('Failed to load AP aging')
      showToast('Failed to load AP aging')
    } finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchAging() }, [fetchAging])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r => (r.vendorName ?? '').toLowerCase().includes(q))
  }, [rows, search])

  const sorted = useMemo(() => [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir)), [filtered, sortKey, sortDir])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages) }, [currentPage, totalPages])
  const paged = useMemo(() => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sorted, currentPage])

  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }
  const toggleSelect = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => setSelected(p => p.size === paged.length ? new Set() : new Set(paged.map(r => r.id)))

  const handleExportCSV = () => {
    setShowExport(false)
    csvDownload(`ap-aging-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Vendor', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days', 'Total'],
      sorted.map(r => [r.vendorName ?? '', String(r.current), String(r.days1To30), String(r.days31To60), String(r.days61To90), String(r.over90), String(r.total)]))
    showToast('CSV exported')
  }

  
  const renderCell = (row: ApAgingRow, key: string) => {
    switch (key) {
      case 'vendorName': return <span className="font-semibold text-gray-800">{row.vendorName ?? '—'}</span>
      case 'current':    return <span className="text-emerald-700 tabular-nums font-medium">{fmt(row.current)}</span>
      case 'days1To30':  return <span className={`tabular-nums font-medium ${row.days1To30 > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{fmt(row.days1To30)}</span>
      case 'days31To60': return <span className={`tabular-nums font-medium ${row.days31To60 > 0 ? 'text-orange-600' : 'text-gray-400'}`}>{fmt(row.days31To60)}</span>
      case 'days61To90': return <span className={`tabular-nums font-medium ${row.days61To90 > 0 ? 'text-red-500' : 'text-gray-400'}`}>{fmt(row.days61To90)}</span>
      case 'over90':     return <span className={`tabular-nums font-bold ${row.over90 > 0 ? 'text-red-700' : 'text-gray-400'}`}>{fmt(row.over90)}</span>
      case 'total':      return <span className="font-bold text-gray-900 tabular-nums">{fmt(row.total)}</span>
      default: return null
    }
  }

  const columns: ResizableColumn<ApAgingRow>[] = [
    {
      key: '__select__',
      header: (
        <button type="button" onClick={toggleAll} className="text-gray-300 hover:text-emerald-600">
          {selected.size === paged.length && paged.length > 0 ? <CheckSquare size={15} className="text-emerald-500" /> : <Square size={15} />}
        </button>
      ),
      width: 44,
      render: (_value, row) => (
        <button type="button" onClick={() => toggleSelect(row.id)} className="text-gray-300 hover:text-emerald-600">
          {selected.has(row.id) ? <CheckSquare size={15} className="text-emerald-500" /> : <Square size={15} />}
        </button>
      ),
    },
    ...visibleCols.map(c => ({
      key: c.key,
      header: c.label,
      width: c.width,
      sortable: true,
      align: c.align ?? 'left',
      render: (_value, row) => renderCell(row, c.key),
    })),
    {
      key: '__actions__',
      header: '',
      width: 52,
      align: 'right',
      render: (_value, row) => (
        <button type="button" onClick={(event) => {
          const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect()
          if (actionMenuId === row.id) {
            setActionMenuId(null)
            setMenuPos(null)
          } else {
            setActionMenuId(row.id)
            setMenuPos({ x: rect.right, y: rect.bottom })
          }
        }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
          <MoreVertical size={14} />
        </button>
      ),
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">AP Aging</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{loading ? 'Loading...' : `${sorted.length} vendors`}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchAging} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><RefreshCw size={14} /></button>
          <div className="relative">
            <button onClick={() => setShowColToggle(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><SlidersHorizontal size={14} /> Columns</button>
            {showColToggle && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-20">
                {cols.map(c => (
                  <label key={c.key} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer select-none">
                    <input type="checkbox" checked={c.visible} onChange={() => toggleCol(c.key)} className="rounded" />{c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setShowExport(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><Download size={14} /> Export</button>
            {showExport && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20">
                <button onClick={handleExportCSV} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Export CSV</button>
          </div>
        )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        {error && <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input type="text" placeholder="Search vendors..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="bg-emerald-600 text-white rounded-xl px-4 py-2.5 flex items-center gap-3">
          <CheckSquare size={16} /><span className="text-sm font-semibold">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => { csvDownload(`ap-aging-sel.csv`, ['Vendor','Current','1-30','31-60','61-90','90+','Total'], sorted.filter(r => selected.has(r.id)).map(r => [r.vendorName ?? '', String(r.current), String(r.days1To30), String(r.days31To60), String(r.days61To90), String(r.over90), String(r.total)])); showToast('CSV exported') }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"><Download size={12} /> Export</button>
            <button onClick={() => setSelected(new Set())} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg"><X size={14} /></button>
          </div>
        </div>
      )}

      <ResizableTable
        columns={columns}
        data={paged}
        onSort={toggleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        emptyMessage="No aging data found"
        rowClassName={(row) => (selected.has(row.id) ? 'bg-blue-50/20' : '')}
        onColumnsChange={handleColumnsChange}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-400">{sorted.length} total</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="text-xs font-semibold text-gray-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}

      {actionMenuId && menuPos && (() => {
        const row = rows.find(r => r.id === actionMenuId)
        if (!row) return null
        const ml = Math.min(Math.max(4, menuPos.x - 208), (typeof window !== 'undefined' ? window.innerWidth : 800) - 212)
        const mt = Math.min(menuPos.y + 4, (typeof window !== 'undefined' ? window.innerHeight : 600) - 160)
        return (
          <div style={{ position: 'fixed', top: mt, left: ml, zIndex: 9999 }} className="bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-52">
            <div className="px-3 py-1.5 border-b border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{row.vendorName ?? 'Vendor'}</p></div>
          </div>
        )
      })()}
      {actionMenuId && <div className="fixed inset-0 z-[9998]" onClick={() => { setActionMenuId(null); setMenuPos(null) }} />}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none">{toast}</div>}
    </div>
  )
}
