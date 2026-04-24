'use client'

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Download, Filter, SlidersHorizontal, CheckSquare, Square, X, ArrowUpDown, Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import ResizableTable, { type Column as ResizableColumn } from '@/components/shared/ResizableTable'
import { expensesService } from '@/services/expenses.service'
import CenteredModal from '@/components/shared/CenteredModal'
import ReceiptForm, { type ReceiptFormHandle } from './ReceiptForm'
import { fmtDate, csvDownload, MenuBtn, StatusPill } from './_helpers'
import ExpenseActivityWidget from './ExpenseActivityWidget'

interface Receipt { id: string; receiptNumber?: string; merchant?: string; date: string; category?: string; amount: number; status?: string }
type SortKey = 'receiptNumber' | 'merchant' | 'date' | 'category' | 'amount' | 'status'
type ColDef = { key: string; label: string; visible: boolean; width: number; align?: ResizableColumn<Receipt>['align'] }

const DEFAULT_COLS: ColDef[] = [
  { key: 'receiptNumber', label: 'Receipt #', visible: true, width: 130 },
  { key: 'merchant',      label: 'Merchant',  visible: true, width: 180 },
  { key: 'date',          label: 'Date',      visible: true, width: 115 },
  { key: 'category',      label: 'Category',  visible: true, width: 150 },
  { key: 'amount',        label: 'Amount',    visible: true, width: 120, align: 'right' },
  { key: 'status',        label: 'Status',    visible: true, width: 130 },
]
const STORAGE_KEY = 'receipts-cols-v4'
function loadCols(): ColDef[] { try { const s = localStorage.getItem(STORAGE_KEY); if (s) { const saved = JSON.parse(s) as ColDef[]; return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width, visible: sc.visible } : d }) } } catch {} return DEFAULT_COLS }

function compare(a: Receipt, b: Receipt, key: SortKey, dir: 'asc' | 'desc'): number {
  if (key === 'amount') { const d = a.amount - b.amount; return dir === 'asc' ? d : -d }
  const al = String(a[key] ?? '').toLowerCase(); const bl = String(b[key] ?? '').toLowerCase()
  return dir === 'asc' ? al.localeCompare(bl) : bl.localeCompare(al)
}
const STATUSES = ['ALL', 'DRAFT', 'UNMATCHED', 'MATCHED', 'ATTACHED']

export default function ReceiptsPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows]                 = useState<Receipt[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey]           = useState<SortKey>('date')
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
  const [receiptPanelOpen, setReceiptPanelOpen] = useState(false)
  const [openReceiptId, setOpenReceiptId] = useState<string | null>(null)
  const [openReceiptMode, setOpenReceiptMode] = useState<'new' | 'edit'>('new')
  const receiptFormRef = useRef<ReceiptFormHandle | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const saveCols  = (next: ColDef[]) => { setCols(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {} }
  const toggleCol = (key: string)   => saveCols(cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c))
  const handleColumnsChange = (next: ResizableColumn<Receipt>[]) => {
    saveCols(cols.map(col => {
      const updated = next.find(c => c.key === col.key)
      return updated ? { ...col, width: updated.width } : col
    }))
  }
  const closeReceiptPanel = () => { setReceiptPanelOpen(false); setOpenReceiptId(null); setOpenReceiptMode('new') }
  const openNewReceipt = () => { setReceiptPanelOpen(true); setOpenReceiptMode('new'); setOpenReceiptId(null) }
  const openEditReceipt = (id: string) => { setReceiptPanelOpen(true); setOpenReceiptMode('edit'); setOpenReceiptId(id) }
  const saveReceipt = () => { receiptFormRef.current?.save() }

  const fetchReceipts = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listReceipts(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.receipts ?? [])
    } catch {
      setError('Failed to load receipts')
      showToast('Failed to load receipts')
    } finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchReceipts() }, [fetchReceipts])
  const onReceiptSaved = async () => { await fetchReceipts(); closeReceiptPanel() }
  const fmt = (n: number) => formatCurrency(n, currency)

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') list = list.filter(r => r.status === statusFilter)
    if (search) { const q = search.toLowerCase(); list = list.filter(r => (r.receiptNumber ?? '').toLowerCase().includes(q) || (r.merchant ?? '').toLowerCase().includes(q)) }
    if (dateFrom) list = list.filter(r => r.date >= dateFrom)
    if (dateTo)   list = list.filter(r => r.date <= dateTo)
    return list
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const sorted = useMemo(() => [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir)), [filtered, sortKey, sortDir])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages) }, [currentPage, totalPages])
  const paged  = useMemo(() => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sorted, currentPage])
  const toggleSort   = (key: SortKey) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }
  const toggleSelect = (id: string)   => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll    = ()             => setSelected(p => p.size === paged.length ? new Set() : new Set(paged.map(r => r.id)))
  const activeFilterCount = [statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length
  const handleExportCSV = () => { setShowExport(false); csvDownload(`receipts-${new Date().toISOString().slice(0,10)}.csv`,['Receipt #','Merchant','Date','Category','Amount','Status'],sorted.map(r=>[r.receiptNumber??'',r.merchant??'',r.date,r.category??'',String(r.amount),r.status??'']));showToast('CSV exported') }
  const visibleCols = cols.filter(c => c.visible)

  const tableColumns: ResizableColumn<Receipt>[] = useMemo(() => [
    {
      key: 'select',
      header: '',
      width: 44,
      minWidth: 44,
      sortable: false,
      render: (_value, row) => (
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); toggleSelect(row.id) }}
          title={selected.has(row.id) ? 'Deselect receipt' : 'Select receipt'}
          aria-label={selected.has(row.id) ? 'Deselect receipt' : 'Select receipt'}
          className="text-gray-300 hover:text-emerald-600"
        >
          {selected.has(row.id) ? <CheckSquare size={15} className="text-emerald-500" /> : <Square size={15} />}
        </button>
      ),
    },
    ...visibleCols.map((col) => ({
      key: col.key,
      header: col.label,
      width: col.width,
      minWidth: col.width,
      sortable: true,
      align: col.align,
      render: (_value, row) => renderCell(row, col.key),
    })),
    {
      key: 'actions',
      header: '',
      width: 52,
      minWidth: 52,
      sortable: false,
      align: 'right',
      render: (_value, row) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect()
            if (actionMenuId === row.id) {
              setActionMenuId(null)
              setMenuPos(null)
            } else {
              setActionMenuId(row.id)
              setMenuPos({ x: rect.right, y: rect.bottom })
            }
          }}
          title="Receipt actions"
          aria-label="Receipt actions"
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <MoreVertical size={14} />
        </button>
      ),
    },
  ], [visibleCols, selected, actionMenuId])

  const renderCell = (row: Receipt, key: string) => {
    switch (key) {
      case 'receiptNumber': return <span className="font-semibold text-gray-800">{row.receiptNumber ?? '—'}</span>
      case 'merchant':      return <span className="text-gray-700 truncate">{row.merchant ?? '—'}</span>
      case 'date':          return <span className="text-gray-500">{fmtDate(row.date)}</span>
      case 'category':      return <span className="text-gray-600 text-xs">{row.category ?? '—'}</span>
      case 'amount':        return <span className="font-semibold text-emerald-800 tabular-nums">{fmt(row.amount)}</span>
      case 'status':        return <StatusPill status={row.status ?? 'DRAFT'} />
      default: return null
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-emerald-900">Receipts</h1><p className="text-sm text-emerald-600/70 mt-0.5">{`${sorted.length} receipts`}</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative"><button onClick={() => setShowColToggle(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><SlidersHorizontal size={14} /> Columns</button>{showColToggle && (<div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-20">{cols.map(c => (<label key={c.key} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer select-none"><input type="checkbox" checked={c.visible} onChange={() => toggleCol(c.key)} className="rounded" />{c.label}</label>))}</div>)}</div>
          <div className="relative"><button onClick={() => setShowExport(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><Download size={14} /> Export</button>{showExport && (<div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20"><button onClick={handleExportCSV} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Export CSV</button></div>)}</div>
          <button onClick={openNewReceipt} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"><Plus size={15} /> Add Receipt</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" /><input type="text" placeholder="Search receipts..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
        <div className="flex items-center gap-1.5 flex-wrap">{STATUSES.map(s => (<button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1) }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{s === 'ALL' ? 'All' : s}</button>))}</div>
        <button onClick={() => setShowAdvFilters(p => !p)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${showAdvFilters || activeFilterCount > 0 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Filter size={13} /> Filters {activeFilterCount > 0 && <span className="bg-emerald-600 text-white rounded-full px-1.5 py-px text-[10px] font-bold">{activeFilterCount}</span>}</button>
      </div>
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {showAdvFilters && (<div className="bg-white rounded-xl border border-emerald-100 p-4 flex flex-wrap gap-4 items-end"><div><label htmlFor="dateFrom" className="block text-xs font-medium text-gray-500 mb-1">Date From</label><input id="dateFrom" type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div><div><label htmlFor="dateTo" className="block text-xs font-medium text-gray-500 mb-1">Date To</label><input id="dateTo" type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div><button onClick={() => { setStatusFilter('ALL'); setDateFrom(''); setDateTo('') }} className="text-xs text-emerald-600 hover:underline">Clear all</button></div>)}
      {selected.size > 0 && (<div className="bg-emerald-600 text-white rounded-xl px-4 py-2.5 flex items-center gap-3"><CheckSquare size={16} /><span className="text-sm font-semibold">{selected.size} selected</span><div className="flex items-center gap-2 ml-auto"><button onClick={() => { csvDownload(`rct-sel.csv`,['Receipt #','Merchant','Date','Category','Amount','Status'],sorted.filter(r=>selected.has(r.id)).map(r=>[r.receiptNumber??'',r.merchant??'',r.date,r.category??'',String(r.amount),r.status??'']));showToast('CSV exported')}} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"><Download size={12}/> Export</button><button onClick={()=>setSelected(new Set())} title="Clear selection" aria-label="Clear selection" className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg"><X size={14}/></button></div></div>)}
      <ResizableTable
        columns={tableColumns}
        data={paged}
        onSort={toggleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        emptyMessage="No receipts found"
        rowClassName={(row) => (selected.has(row.id) ? 'bg-blue-50/20' : '')}
        onColumnsChange={handleColumnsChange}
        fixedWidth={96}
      />
      {totalPages>1&&(<div className="flex items-center justify-between px-1"><span className="text-xs text-gray-400">{sorted.length} total</span><div className="flex items-center gap-2"><button onClick={()=>setCurrentPage(p=>p-1)} disabled={currentPage===1} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Previous</button><span className="text-xs font-semibold text-gray-600">Page {currentPage} of {totalPages}</span><button onClick={()=>setCurrentPage(p=>p+1)} disabled={currentPage===totalPages} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button></div></div>)}

      <div className="mt-6">
        <ExpenseActivityWidget tableName="Receipt" entityLabel="Receipts" pageSize={8} />
      </div>
      {actionMenuId&&menuPos&&(()=>{const row=rows.find(r=>r.id===actionMenuId);if(!row)return null;return(<div className="fixed right-4 top-24 z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-52"><div className="px-3 py-1.5 border-b border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{row.receiptNumber??'Receipt'}</p></div><MenuBtn icon={<Eye size={13}/>} label="Edit Receipt" onClick={()=>{openEditReceipt(row.id);setActionMenuId(null)}}/></div>)})()}
      {actionMenuId&&<div className="fixed inset-0 z-[9998]" onClick={()=>{setActionMenuId(null);setMenuPos(null)}}/>}
      {toast&&<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none">{toast}</div>}
      <CenteredModal
        open={receiptPanelOpen}
        onClose={closeReceiptPanel}
        title={openReceiptMode === 'new' ? 'New Receipt' : 'Edit Receipt'}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeReceiptPanel}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveReceipt}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Save
            </button>
          </div>
        }
      >
        <ReceiptForm
          ref={receiptFormRef}
          mode={openReceiptMode}
          receiptId={openReceiptId ?? undefined}
          onClose={closeReceiptPanel}
          onSaved={onReceiptSaved}
        />
      </CenteredModal>
    </div>
  )
}
