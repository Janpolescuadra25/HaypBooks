'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, MoreVertical, Download, Filter, SlidersHorizontal, CheckSquare, Square, X, RefreshCw, Eye, Send } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import ResizableTable, { type Column as ResizableColumn } from '@/components/shared/ResizableTable'
import CenteredModal from '@/components/shared/CenteredModal'
import PerDiemForm, { type PerDiemFormHandle } from './PerDiemForm'
import { useRef } from 'react'
import { fmtDate, csvDownload, MenuBtn, StatusPill } from './_helpers'
import ExpenseActivityWidget from './ExpenseActivityWidget'

interface PerDiem { id: string; perDiemNumber?: string; employee?: string; destination?: string; startDate: string; endDate: string; days?: number; dailyRate?: number; total: number; status?: string }
type SortKey = 'perDiemNumber' | 'employee' | 'destination' | 'startDate' | 'endDate' | 'days' | 'dailyRate' | 'total' | 'status'
type ColDef = { key: string; label: string; visible: boolean; width: number; align?: ResizableColumn<PerDiem>['align'] }

const DEFAULT_COLS: ColDef[] = [
  { key: 'perDiemNumber', label: 'Per Diem #',  visible: true, width: 130 },
  { key: 'employee',      label: 'Employee',    visible: true, width: 170 },
  { key: 'destination',   label: 'Destination', visible: true, width: 160 },
  { key: 'startDate',     label: 'Start',       visible: true, width: 110 },
  { key: 'endDate',       label: 'End',         visible: true, width: 110 },
  { key: 'days',          label: 'Days',        visible: true, width: 80,  align: 'right' },
  { key: 'dailyRate',     label: 'Daily Rate',  visible: true, width: 110, align: 'right' },
  { key: 'total',         label: 'Total',       visible: true, width: 120, align: 'right' },
  { key: 'status',        label: 'Status',      visible: true, width: 130 },
]
const STORAGE_KEY = 'per-diem-cols-v4'
function loadCols(): ColDef[] { try { const s = localStorage.getItem(STORAGE_KEY); if (s) { const saved = JSON.parse(s) as ColDef[]; return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width, visible: sc.visible } : d }) } } catch {} return DEFAULT_COLS }

function compare(a: PerDiem, b: PerDiem, key: SortKey, dir: 'asc' | 'desc'): number {
  if (key === 'days')      { const d = (a.days ?? 0) - (b.days ?? 0); return dir === 'asc' ? d : -d }
  if (key === 'dailyRate') { const d = (a.dailyRate ?? 0) - (b.dailyRate ?? 0); return dir === 'asc' ? d : -d }
  if (key === 'total')     { const d = a.total - b.total; return dir === 'asc' ? d : -d }
  const al = String(a[key] ?? '').toLowerCase(); const bl = String(b[key] ?? '').toLowerCase()
  return dir === 'asc' ? al.localeCompare(bl) : bl.localeCompare(al)
}
const STATUSES = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']

export default function PerDiemPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows]                 = useState<PerDiem[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey]           = useState<SortKey>('startDate')
  const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage]   = useState(1); const pageSize = 25
  const [selected, setSelected]         = useState<Set<string>>(new Set())
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [menuPos, setMenuPos]           = useState<{ x: number; y: number } | null>(null)
  const [showExport, setShowExport]     = useState(false)
  const [showAdvFilters, setShowAdvFilters] = useState(false)
  const [showColToggle, setShowColToggle]   = useState(false)
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [cols, setCols]                 = useState<ColDef[]>(() => loadCols())
  const [toast, setToast]               = useState('')
  const [panelOpen, setPanelOpen]       = useState(false)
  const [openId, setOpenId]             = useState<string | null>(null)
  const [openMode, setOpenMode]         = useState<'new' | 'edit'>('new')
  const formRef                         = useRef<PerDiemFormHandle | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const saveCols  = (next: ColDef[]) => { setCols(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {} }
  const toggleCol = (key: string)   => saveCols(cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c))
  const visibleCols = cols.filter(c => c.visible)

  const handleColumnsChange = (next: ResizableColumn<PerDiem>[]) => {
    saveCols(cols.map(col => {
      const updated = next.find(c => c.key === col.key)
      return updated ? { ...col, width: updated.width } : col
    }))
  }
  const fmt = (n: number) => formatCurrency(n, currency)

  const fetchRows = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listPerDiem(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.perDiem ?? [])
    } catch {
      setError('Failed to load per diem claims')
      showToast('Failed to load per diem claims')
    } finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchRows() }, [fetchRows])

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') list = list.filter(r => r.status === statusFilter)
    if (search) { const q = search.toLowerCase(); list = list.filter(r => (r.perDiemNumber ?? '').toLowerCase().includes(q) || (r.employee ?? '').toLowerCase().includes(q) || (r.destination ?? '').toLowerCase().includes(q)) }
    if (dateFrom) list = list.filter(r => r.startDate >= dateFrom)
    if (dateTo)   list = list.filter(r => r.startDate <= dateTo)
    return list
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const sorted = useMemo(() => [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir)), [filtered, sortKey, sortDir])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages) }, [currentPage, totalPages])
  const paged  = useMemo(() => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sorted, currentPage])
  const toggleSort   = (key: SortKey) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }
  const toggleSelect = (id: string)   => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll    = ()             => setSelected(p => p.size === paged.length ? new Set() : new Set(paged.map(r => r.id)))

  const columns: ResizableColumn<PerDiem>[] = [
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
      key: c.key, header: c.label, width: c.width, sortable: true, align: c.align ?? 'left',
      render: (_value, row) => renderCell(row, c.key),
    })),
    {
      key: '__actions__',
      header: '',
      width: 52,
      align: 'right',
      render: (_value, row) => (
        <button type="button" onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          actionMenuId === row.id ? (setActionMenuId(null), setMenuPos(null)) : (setActionMenuId(row.id), setMenuPos({ x: r.right, y: r.bottom }))
        }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
          <MoreVertical size={14} />
        </button>
      ),
    },
  ]

  const activeFilterCount = [statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length
  const handleExportCSV = () => { setShowExport(false); csvDownload(`per-diem-${new Date().toISOString().slice(0,10)}.csv`,['Per Diem #','Employee','Destination','Start','End','Days','Daily Rate','Total','Status'],sorted.map(r=>[r.perDiemNumber??'',r.employee??'',r.destination??'',r.startDate,r.endDate,String(r.days??0),String(r.dailyRate??0),String(r.total),r.status??'']));showToast('CSV exported') }

  const renderCell = (row: PerDiem, key: string) => {
    switch (key) {
      case 'perDiemNumber': return <span className="font-semibold text-gray-800">{row.perDiemNumber ?? '—'}</span>
      case 'employee':      return <span className="font-medium text-gray-800">{row.employee ?? '—'}</span>
      case 'destination':   return <span className="text-gray-700 truncate">{row.destination ?? '—'}</span>
      case 'startDate':     return <span className="text-gray-500">{fmtDate(row.startDate)}</span>
      case 'endDate':       return <span className="text-gray-500">{fmtDate(row.endDate)}</span>
      case 'days':          return <span className="font-medium text-gray-700 tabular-nums">{row.days ?? 0}</span>
      case 'dailyRate':     return <span className="text-gray-600 tabular-nums">{fmt(row.dailyRate ?? 0)}</span>
      case 'total':         return <span className="font-semibold text-emerald-800 tabular-nums">{fmt(row.total)}</span>
      case 'status':        return <StatusPill status={row.status ?? 'DRAFT'} />
      default: return null
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Per Diem</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{loading ? 'Loading...' : `${sorted.length} claims`}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchRows} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><RefreshCw size={14} /></button>
          <div className="relative"><button onClick={() => setShowColToggle(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><SlidersHorizontal size={14} /> Columns</button>{showColToggle && (<div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-20">{cols.map(c => (<label key={c.key} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer select-none"><input type="checkbox" checked={c.visible} onChange={() => toggleCol(c.key)} className="rounded" />{c.label}</label>))}</div>)}</div>
          <div className="relative"><button onClick={() => setShowExport(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><Download size={14} /> Export</button>{showExport && (<div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20"><button onClick={handleExportCSV} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Export CSV</button><button onClick={() => { setShowExport(false); showToast('PDF coming soon') }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Export PDF</button></div>)}</div>
          <button onClick={() => { setPanelOpen(true); setOpenMode('new'); setOpenId(null) }} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"><Plus size={15} /> New Claim</button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" /><input type="text" placeholder="Search per diem..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
        <div className="flex items-center gap-1.5 flex-wrap">{STATUSES.map(s => (<button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1) }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{s === 'ALL' ? 'All' : s}</button>))}</div>
        <button onClick={() => setShowAdvFilters(p => !p)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${showAdvFilters || activeFilterCount > 0 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Filter size={13} /> Filters {activeFilterCount > 0 && <span className="bg-emerald-600 text-white rounded-full px-1.5 py-px text-[10px] font-bold">{activeFilterCount}</span>}</button>
      </div>
      {showAdvFilters && (<div className="bg-white rounded-xl border border-emerald-100 p-4 flex flex-wrap gap-4 items-end"><div><label className="block text-xs font-medium text-gray-500 mb-1">Start From</label><input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div><div><label className="block text-xs font-medium text-gray-500 mb-1">Start To</label><input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div><button onClick={() => { setStatusFilter('ALL'); setDateFrom(''); setDateTo('') }} className="text-xs text-emerald-600 hover:underline">Clear all</button></div>)}
      {selected.size > 0 && (<div className="bg-emerald-600 text-white rounded-xl px-4 py-2.5 flex items-center gap-3"><CheckSquare size={16} /><span className="text-sm font-semibold">{selected.size} selected</span><div className="flex items-center gap-2 ml-auto"><button onClick={() => { csvDownload(`pd-sel.csv`,['Per Diem #','Employee','Destination','Start','End','Days','Daily Rate','Total','Status'],sorted.filter(r=>selected.has(r.id)).map(r=>[r.perDiemNumber??'',r.employee??'',r.destination??'',r.startDate,r.endDate,String(r.days??0),String(r.dailyRate??0),String(r.total),r.status??'']));showToast('CSV exported')}} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"><Download size={12}/> Export</button><button onClick={()=>setSelected(new Set())} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg"><X size={14}/></button></div></div>)}

      <ResizableTable columns={columns} data={paged} onSort={toggleSort} sortKey={sortKey} sortDir={sortDir} emptyMessage={loading ? 'Loading...' : 'No per diem claims found'} rowClassName={(row) => (selected.has(row.id) ? 'bg-blue-50/20' : '')} onColumnsChange={handleColumnsChange} />
      {totalPages>1&&(<div className="flex items-center justify-between px-1"><span className="text-xs text-gray-400">{sorted.length} total</span><div className="flex items-center gap-2"><button onClick={()=>setCurrentPage(p=>p-1)} disabled={currentPage===1} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Previous</button><span className="text-xs font-semibold text-gray-600">Page {currentPage} of {totalPages}</span><button onClick={()=>setCurrentPage(p=>p+1)} disabled={currentPage===totalPages} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button></div></div>)}

      <div className="mt-6">
        <ExpenseActivityWidget tableName="PerDiem" entityLabel="Per Diem" pageSize={8} />
      </div>
      {actionMenuId&&menuPos&&(()=>{const row=rows.find(r=>r.id===actionMenuId);if(!row)return null;const ml=Math.min(Math.max(4,menuPos.x-208),(typeof window!=='undefined'?window.innerWidth:800)-212);const mt=Math.min(menuPos.y+4,(typeof window!=='undefined'?window.innerHeight:600)-160);return(<div style={{position:'fixed',top:mt,left:ml,zIndex:9999}} className="bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-52"><div className="px-3 py-1.5 border-b border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{row.perDiemNumber??'Per Diem'}</p></div><MenuBtn icon={<Eye size={13}/>} label="Edit Claim" onClick={()=>{setPanelOpen(true);setOpenMode('edit');setOpenId(row.id);setActionMenuId(null)}}/>{row.status==='DRAFT'&&<MenuBtn icon={<Send size={13}/>} label="Submit" onClick={()=>{showToast('Coming soon');setActionMenuId(null)}}/>}</div>)})()}
      {actionMenuId&&<div className="fixed inset-0 z-[9998]" onClick={()=>{setActionMenuId(null);setMenuPos(null)}}/>}
      {toast&&<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none">{toast}</div>}
      <CenteredModal open={panelOpen} onClose={() => { setPanelOpen(false); setOpenId(null); setOpenMode('new') }} title={openMode === 'new' ? 'New Per Diem Claim' : 'Edit Per Diem Claim'} footer={<div className="flex gap-3 justify-end"><button type="button" onClick={() => { setPanelOpen(false); setOpenId(null) }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="button" onClick={() => formRef.current?.save()} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Save</button></div>}><PerDiemForm ref={formRef} mode={openMode} perDiemId={openId ?? undefined} onClose={() => { setPanelOpen(false); setOpenId(null) }} onSaved={() => { setPanelOpen(false); setOpenId(null); fetchRows() }} /></CenteredModal>
    </div>
  )
}
