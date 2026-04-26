'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Search, MoreVertical, Download, Filter, SlidersHorizontal, Clock, CheckSquare, Square, X, RefreshCw, Eye, Pause, Play, StopCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import EnhancedTable, { type Column as EnhancedColumn, useEnhancedTable } from '@/components/shared/EnhancedTable'
import CenteredModal from '@/components/shared/CenteredModal'
import RecurringBillForm, { type RecurringBillFormHandle } from './RecurringBillForm'
import { fmtDate, csvDownload, MenuBtn, StatusPill } from './_helpers'
import { useRouter } from 'next/navigation'

interface RecurringBill { id: string; templateName?: string; vendorName?: string; frequency?: string; nextDate?: string; status?: string; amount: number }
type SortKey = 'templateName' | 'vendorName' | 'frequency' | 'nextDate' | 'status' | 'amount'
type ColDef = { key: string; label: string; visible: boolean; width: number; align?: EnhancedColumn<RecurringBill>['align'] }

const DEFAULT_COLS: ColDef[] = [
  { key: 'templateName', label: 'Template',  visible: true, width: 190 },
  { key: 'vendorName',   label: 'Vendor',    visible: true, width: 180 },
  { key: 'frequency',    label: 'Frequency', visible: true, width: 120 },
  { key: 'nextDate',     label: 'Next Date', visible: true, width: 120 },
  { key: 'status',       label: 'Status',    visible: true, width: 130 },
  { key: 'amount',       label: 'Amount',    visible: true, width: 130, align: 'right' },
]
const STORAGE_KEY = 'recurring-bills-cols-v4'
function loadCols(): ColDef[] { try { const s = localStorage.getItem(STORAGE_KEY); if (s) { const saved = JSON.parse(s) as ColDef[]; return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width, visible: sc.visible } : d }) } } catch {} return DEFAULT_COLS }

function compare(a: RecurringBill, b: RecurringBill, key: SortKey, dir: 'asc' | 'desc'): number {
  if (key === 'amount') { const d = a.amount - b.amount; return dir === 'asc' ? d : -d }
  const al = String(a[key] ?? '').toLowerCase(); const bl = String(b[key] ?? '').toLowerCase()
  return dir === 'asc' ? al.localeCompare(bl) : bl.localeCompare(al)
}
const STATUSES = ['ALL', 'ACTIVE', 'PAUSED', 'ENDED']

export default function RecurringBillsPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows]                 = useState<RecurringBill[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey]           = useState<SortKey>('templateName')
  const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage]   = useState(1)
  const pageSize = 25
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [menuPos, setMenuPos]           = useState<{ x: number; y: number } | null>(null)
  const [showExport, setShowExport]     = useState(false)
  const [showAdvFilters, setShowAdvFilters] = useState(false)
  const [showColToggle, setShowColToggle]   = useState(false)
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [cols, setCols]                 = useState<ColDef[]>(() => loadCols())
  const colsRef                         = useRef(cols)
  const [toast, setToast]               = useState('')
  const [panelOpen, setPanelOpen]       = useState(false)
  const [openId, setOpenId]             = useState<string | null>(null)
  const [openMode, setOpenMode]         = useState<'new' | 'edit'>('new')
  const formRef                         = useRef<RecurringBillFormHandle | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const saveCols  = (next: ColDef[]) => { setCols(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {} }
  const toggleCol = (key: string)   => saveCols(cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c))
  const visibleCols = cols.filter(c => c.visible)

  const handleColumnsChange = (next: EnhancedColumn<RecurringBill>[]) => {
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
      const res = await expensesService.listRecurringBills(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.recurringBills ?? [])
    } catch {
      setError('Failed to load recurring bills')
      showToast('Failed to load recurring bills')
    } finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchRows() }, [fetchRows])

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') list = list.filter(r => r.status === statusFilter)
    if (search) { const q = search.toLowerCase(); list = list.filter(r => (r.templateName ?? '').toLowerCase().includes(q) || (r.vendorName ?? '').toLowerCase().includes(q)) }
    if (dateFrom) list = list.filter(r => (r.nextDate ?? '') >= dateFrom)
    if (dateTo)   list = list.filter(r => (r.nextDate ?? '') <= dateTo)
    return list
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const sorted = useMemo(() => [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir)), [filtered, sortKey, sortDir])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages) }, [currentPage, totalPages])
  const paged  = useMemo(() => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sorted, currentPage])
  const table = useEnhancedTable<RecurringBill>({ data: paged, tableId: 'recurring-bills' })

  const selectedRowsData = useMemo(
    () => rows.filter((row) => table.selectedRows.includes(row.id)),
    [rows, table.selectedRows],
  )
  const canDeleteSelected = selectedRowsData.length > 0 && selectedRowsData.every((row) => row.status === 'DRAFT')
  const canVoidSelected = selectedRowsData.some((row) => row.status !== 'DRAFT' && row.status !== 'VOID')
  const voidableSelectedRows = selectedRowsData.filter((row) => row.status !== 'DRAFT' && row.status !== 'VOID')

  const handleDeleteSelected = useCallback(async () => {
    if (!companyId || table.selectedRows.length === 0) return
    if (!canDeleteSelected) return
    const drafts = selectedRowsData.filter((row) => row.status === 'DRAFT')
    if (drafts.length === 0) return
    if (!confirm(`Delete ${drafts.length} selected recurring bill${drafts.length !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(drafts.map((row) => expensesService.updateRecurringBill(companyId, row.id, { status: 'DELETED' })))
      setRows((prev) => prev.filter((row) => !drafts.some((draft) => draft.id === row.id)))
      table.clearSelection()
      showToast(`${drafts.length} selected recurring bill${drafts.length !== 1 ? 's' : ''} deleted`)
    } catch {
      showToast('Failed to delete selected recurring bills')
    }
  }, [canDeleteSelected, companyId, selectedRowsData, table])

  const handleVoidSelected = useCallback(async () => {
    if (!companyId || table.selectedRows.length === 0) return
    if (!canVoidSelected) return
    const voidable = voidableSelectedRows
    if (voidable.length === 0) {
      showToast('No recurring bills selected to void')
      return
    }
    if (!confirm(`Void ${voidable.length} selected recurring bill${voidable.length !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(voidable.map((row) => expensesService.updateRecurringBill(companyId, row.id, { status: 'VOID' })))
      setRows((prev) => prev.map((row) => voidable.some((selected) => selected.id === row.id) ? { ...row, status: 'VOID' } : row))
      table.clearSelection()
      showToast(`${voidable.length} selected recurring bill${voidable.length !== 1 ? 's' : ''} voided`)
    } catch {
      showToast('Failed to void selected recurring bills')
    }
  }, [canVoidSelected, companyId, table, voidableSelectedRows])

  const toggleSort   = (key: SortKey) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }

  const columns: EnhancedColumn<RecurringBill>[] = [
    table.renderCheckboxColumn(),
    ...visibleCols.map(c => ({
      key: c.key, header: c.label, width: c.width, sortable: true, align: c.align ?? 'left',
      render: (_value, row) => renderCell(row, c.key),
    })),
{
      key: 'actions',
      isAction: true,
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
  const handleExportCSV = () => { setShowExport(false); csvDownload(`recurring-bills-${new Date().toISOString().slice(0,10)}.csv`,['Template','Vendor','Frequency','Next Date','Status','Amount'],sorted.map(r=>[r.templateName??'',r.vendorName??'',r.frequency??'',r.nextDate??'',r.status??'',String(r.amount)]));showToast('CSV exported') }

  const renderCell = (row: RecurringBill, key: string) => {
    switch (key) {
      case 'templateName': return <span className="font-semibold text-gray-800">{row.templateName ?? '—'}</span>
      case 'vendorName':   return <span className="text-gray-700 truncate">{row.vendorName ?? '—'}</span>
      case 'frequency':    return <span className="text-gray-600 text-xs">{row.frequency ?? '—'}</span>
      case 'nextDate':     return <span className="text-gray-500">{row.nextDate ? fmtDate(row.nextDate) : '—'}</span>
      case 'status':       return <StatusPill status={row.status ?? 'ACTIVE'} />
      case 'amount':       return <span className="font-semibold text-emerald-800 tabular-nums">{fmt(row.amount)}</span>
      default: return null
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Recurring Bills</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{loading ? 'Loading...' : `${sorted.length} templates`}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchRows} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><RefreshCw size={14} /></button>
          <div className="relative"><button onClick={() => setShowColToggle(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><SlidersHorizontal size={14} /> Columns</button>{showColToggle && (<div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-20">{cols.map(c => (<label key={c.key} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer select-none"><input type="checkbox" checked={c.visible} onChange={() => toggleCol(c.key)} className="rounded" />{c.label}</label>))}</div>)}</div>
          <div className="relative"><button onClick={() => setShowExport(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><Download size={14} /> Export</button>{showExport && (<div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20"><button onClick={handleExportCSV} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Export CSV</button><button onClick={() => { setShowExport(false); showToast('PDF coming soon') }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Export PDF</button></div>)}</div>
          <button onClick={() => router.push('/expenses/bills-payments/recurring-bills/activity')} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-medium"><Clock size={15} /> Activity Log</button>
          <button onClick={() => { setPanelOpen(true); setOpenMode('new'); setOpenId(null) }} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"><Plus size={15} /> New Template</button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" /><input type="text" placeholder="Search recurring bills..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
        <div className="flex items-center gap-1.5 flex-wrap">{STATUSES.map(s => (<button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1) }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{s === 'ALL' ? 'All' : s}</button>))}</div>
        <button onClick={() => setShowAdvFilters(p => !p)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${showAdvFilters || activeFilterCount > 0 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Filter size={13} /> Filters {activeFilterCount > 0 && <span className="bg-emerald-600 text-white rounded-full px-1.5 py-px text-[10px] font-bold">{activeFilterCount}</span>}</button>
      </div>
      {showAdvFilters && (<div className="bg-white rounded-xl border border-emerald-100 p-4 flex flex-wrap gap-4 items-end"><div><label className="block text-xs font-medium text-gray-500 mb-1">Next Date From</label><input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div><div><label className="block text-xs font-medium text-gray-500 mb-1">Next Date To</label><input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div><button onClick={() => { setStatusFilter('ALL'); setDateFrom(''); setDateTo('') }} className="text-xs text-emerald-600 hover:underline">Clear all</button></div>)}
      {table.renderBulkToolbar([
        { label: 'Export Selected', onClick: () => table.exportSelectedToCsv(`recurring-bills-selected-${new Date().toISOString().slice(0, 10)}.csv`, ['Template','Vendor','Frequency','Next Date','Status','Amount'], (row) => [row.templateName ?? '', row.vendorName ?? '', row.frequency ?? '', row.nextDate ?? '', row.status ?? '', String(row.amount)]) },
        { label: 'Delete Selected', variant: 'danger', onClick: handleDeleteSelected, disabled: !canDeleteSelected },
        { label: 'Void Selected', variant: 'danger', onClick: handleVoidSelected, disabled: !canVoidSelected },
      ])}
      <EnhancedTable columns={columns} data={paged} onSort={toggleSort} sortKey={sortKey} sortDir={sortDir} tableId="recurring-bills" hasStickyActions={true} emptyMessage={loading ? 'Loading...' : 'No recurring bills found'} rowClassName={(row) => (table.selectedRows.includes(row.id) ? 'bg-blue-50/20' : '')} onColumnsChange={handleColumnsChange}
        enableRowSelection={true}
        selectedRows={table.selectedRows}
        toggleRowSelection={table.toggleRowSelection}
        handleSelectAll={table.handleSelectAll}
        isAllSelected={table.isAllSelected}
        isIndeterminate={table.isIndeterminate}
        selectAllRef={table.selectAllRef}
      />
      {totalPages>1&&(<div className="flex items-center justify-between px-1"><span className="text-xs text-gray-400">{sorted.length} total</span><div className="flex items-center gap-2"><button onClick={()=>setCurrentPage(p=>p-1)} disabled={currentPage===1} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Previous</button><span className="text-xs font-semibold text-gray-600">Page {currentPage} of {totalPages}</span><button onClick={()=>setCurrentPage(p=>p+1)} disabled={currentPage===totalPages} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button></div></div>)}

      {/* Activity log available via top toolbar button */}
      {actionMenuId&&menuPos&&(()=>{const row=rows.find(r=>r.id===actionMenuId);if(!row)return null;const ml=Math.min(Math.max(4,menuPos.x-208),(typeof window!=='undefined'?window.innerWidth:800)-212);const mt=Math.min(menuPos.y+4,(typeof window!=='undefined'?window.innerHeight:600)-160);return(<div style={{position:'fixed',top:mt,left:ml,zIndex:9999}} className="bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-52"><div className="px-3 py-1.5 border-b border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{row.templateName??'Template'}</p></div><MenuBtn icon={<Eye size={13}/>} label="Edit Template" onClick={()=>{setPanelOpen(true);setOpenMode('edit');setOpenId(row.id);setActionMenuId(null)}}/><div className="my-1 border-t border-gray-100"/>{row.status==='ACTIVE'&&<MenuBtn icon={<Pause size={13}/>} label="Pause" onClick={()=>{showToast('Coming soon');setActionMenuId(null)}}/>}{row.status==='PAUSED'&&<MenuBtn icon={<Play size={13}/>} label="Resume" onClick={()=>{showToast('Coming soon');setActionMenuId(null)}}/>}{row.status!=='ENDED'&&<MenuBtn icon={<StopCircle size={13}/>} label="End" danger onClick={()=>{showToast('Coming soon');setActionMenuId(null)}}/>}</div>)})()}
      {actionMenuId&&<div className="fixed inset-0 z-[9998]" onClick={()=>{setActionMenuId(null);setMenuPos(null)}}/>}
      <CenteredModal open={panelOpen} onClose={() => { setPanelOpen(false); setOpenId(null); setOpenMode('new') }} title={openMode === 'new' ? 'New Recurring Bill Template' : 'Edit Recurring Bill Template'} footer={<div className="flex gap-3 justify-end"><button type="button" onClick={() => { setPanelOpen(false); setOpenId(null) }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="button" onClick={() => formRef.current?.save()} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Save</button></div>}><RecurringBillForm ref={formRef} mode={openMode} billId={openId ?? undefined} onClose={() => { setPanelOpen(false); setOpenId(null) }} onSaved={() => { setPanelOpen(false); setOpenId(null); fetchRows() }} /></CenteredModal>
      {actionMenuId&&<div className="fixed inset-0 z-[9998]" onClick={()=>{setActionMenuId(null);setMenuPos(null)}}/>}
      {toast&&<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none">{toast}</div>}
    </div>
  )
}



