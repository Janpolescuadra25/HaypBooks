'use client'

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, MoreVertical, Download, Filter, SlidersHorizontal, Clock, CheckSquare, Square, X, ArrowUpDown, Eye, Check, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import EnhancedTable, { type Column as EnhancedColumn, useEnhancedTable } from '@/components/shared/EnhancedTable'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { fmtDate, csvDownload, MenuBtn, StatusPill } from './_helpers'

interface PurchaseOrder { id: string; poNumber?: string; vendorName?: string; date: string; expectedDelivery?: string; status?: string; total: number }
type SortKey = 'poNumber' | 'vendorName' | 'date' | 'expectedDelivery' | 'status' | 'total'
type ColDef = { key: string; label: string; visible: boolean; width: number; align?: EnhancedColumn<PurchaseOrder>['align'] }

const DEFAULT_COLS: ColDef[] = [
  { key: 'poNumber',         label: 'PO #',             visible: true, width: 130 },
  { key: 'vendorName',       label: 'Vendor',            visible: true, width: 200 },
  { key: 'date',             label: 'Date',              visible: true, width: 115 },
  { key: 'expectedDelivery', label: 'Expected Delivery', visible: true, width: 130 },
  { key: 'status',           label: 'Status',            visible: true, width: 130 },
  { key: 'total',            label: 'Total',             visible: true, width: 130, align: 'right' },
]
const STORAGE_KEY = 'purchase-orders-cols-v4'
function loadCols(): ColDef[] { try { const s = localStorage.getItem(STORAGE_KEY); if (s) { const saved = JSON.parse(s) as ColDef[]; return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width, visible: sc.visible } : d }) } } catch {} return DEFAULT_COLS }


function compare(a: PurchaseOrder, b: PurchaseOrder, key: SortKey, dir: 'asc' | 'desc'): number {
  if (key === 'total') { const d = a.total - b.total; return dir === 'asc' ? d : -d }
  const al = String(a[key] ?? '').toLowerCase(); const bl = String(b[key] ?? '').toLowerCase()
  return dir === 'asc' ? al.localeCompare(bl) : bl.localeCompare(al)
}
const STATUSES = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'RECEIVED', 'CANCELLED']

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows]                  = useState<PurchaseOrder[]>([])
  const [search, setSearch]              = useState('')
  const [loading, setLoading]            = useState(true)
  const [error, setError]                = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey]           = useState<SortKey>('date')
  const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage]   = useState(1); const pageSize = 25
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [menuPos, setMenuPos]           = useState<{ x: number; y: number } | null>(null)
  const [showExport, setShowExport]     = useState(false)
  const [showAdvFilters, setShowAdvFilters] = useState(false)
  const [showColToggle, setShowColToggle]   = useState(false)
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [cols, setCols]                 = useState<ColDef[]>(() => loadCols())
  const colsRef                         = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])
  const saveCols  = (next: ColDef[]) => { setCols(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {} }

  const fetchPurchaseOrders = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listPurchaseOrders(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.purchaseOrders ?? [])
    } catch {
      setError('Failed to load purchase orders')
      toast.error('Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchPurchaseOrders() }, [fetchPurchaseOrders])
  const toggleCol = (key: string)   => saveCols(cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c))
  const visibleCols = cols.filter(c => c.visible)

  const handleColumnsChange = (next: EnhancedColumn<PurchaseOrder>[]) => {
    saveCols(cols.map(col => {
      const updated = next.find(c => c.key === col.key)
      return updated ? { ...col, width: updated.width } : col
    }))
  }

  const fmt = (n: number) => formatCurrency(n, currency)

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') list = list.filter(r => r.status === statusFilter)
    if (search) { const q = search.toLowerCase(); list = list.filter(r => (r.poNumber ?? '').toLowerCase().includes(q) || (r.vendorName ?? '').toLowerCase().includes(q)) }
    if (dateFrom) list = list.filter(r => r.date >= dateFrom)
    if (dateTo)   list = list.filter(r => r.date <= dateTo)
    return list
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const sorted = useMemo(() => [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir)), [filtered, sortKey, sortDir])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages) }, [currentPage, totalPages])
  const paged  = useMemo(() => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sorted, currentPage])
  const table = useEnhancedTable<PurchaseOrder>({ data: paged, tableId: 'purchase-orders' })

  const toggleSort   = (key: SortKey) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }
  const columns: EnhancedColumn<PurchaseOrder>[] = [
    ...visibleCols.map(c => ({
      key: c.key,
      header: c.label,
      width: c.width,
      sortable: true,
      align: c.align ?? 'left',
      render: (_value, row) => renderCell(row, c.key),
    })),
{
      key: 'actions',
      isAction: true,
      header: '',
      width: 140,
      align: 'right',
      render: (_value, row) => (
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            actionMenuId === row.id ? (setActionMenuId(null), setMenuPos(null)) : (setActionMenuId(row.id), setMenuPos({ x: r.right, y: r.bottom }))
          }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <MoreVertical size={14} />
          </button>
        </div>
      ),
    },
  ]
  const activeFilterCount = [statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length

  const handleExportCSV = useCallback(() => {
    setShowExport(false)
    csvDownload(`purchase-orders-${new Date().toISOString().slice(0,10)}.csv`, ['PO #','Vendor','Date','Exp. Delivery','Status','Total'], sorted.map(r => [r.poNumber ?? '', r.vendorName ?? '', r.date, r.expectedDelivery ?? '', r.status ?? '', String(r.total)]))
    toast.success('CSV exported')
  }, [sorted, toast])

  const handleExportSelected = useCallback(() => {
    if (table.selectedRows.length === 0) return
    csvDownload(`purchase-orders-selected-${new Date().toISOString().slice(0,10)}.csv`, ['PO #','Vendor','Date','Exp. Delivery','Status','Total'], sorted.filter((r) => table.selectedRows.includes(r.id)).map(r => [r.poNumber ?? '', r.vendorName ?? '', r.date, r.expectedDelivery ?? '', r.status ?? '', String(r.total)]))
    toast.success('Selected purchase orders exported')
  }, [sorted, table.selectedRows, toast])

  const handleDeleteSelected = useCallback(async () => {
    if (!companyId || table.selectedRows.length === 0) return
    const count = table.selectedRows.length
    if (!confirm(`Delete ${count} selected purchase order${count !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(table.selectedRows.map((id) => expensesService.deletePurchaseOrder(companyId, id)))
      setRows((prev) => prev.filter((row) => !table.selectedRows.includes(row.id)))
      table.clearSelection()
      toast.success(`${count} purchase order${count !== 1 ? 's' : ''} deleted`)
    } catch {
      toast.error('Failed to delete selected purchase orders')
    }
  }, [companyId, table.selectedRows, table, toast])

  const handleApproveSelected = useCallback(() => {
    if (table.selectedRows.length === 0) return
    setRows((prev) => prev.map((row) => table.selectedRows.includes(row.id) ? { ...row, status: 'APPROVED' } : row))
    table.clearSelection()
    toast.success(`${table.selectedRows.length} selected order${table.selectedRows.length !== 1 ? 's' : ''} approved`)
  }, [table.selectedRows, table, toast])

  const handleConvertSelected = useCallback(async () => {
    if (!companyId || table.selectedRows.length === 0) return
    const count = table.selectedRows.length
    if (!confirm(`Convert ${count} selected purchase order${count !== 1 ? 's' : ''} to bills?`)) return
    try {
      await Promise.all(table.selectedRows.map((id) => expensesService.convertPurchaseOrderToBill(companyId, id)))
      table.clearSelection()
      toast.success(`${count} selected order${count !== 1 ? 's' : ''} converted to bills`)
    } catch {
      toast.error('Failed to convert selected purchase orders')
    }
  }, [companyId, table.selectedRows, toast])

  const renderCell = (row: PurchaseOrder, key: string) => {
    switch (key) {
      case 'poNumber':         return <span className="font-semibold text-gray-800">{row.poNumber ?? '—'}</span>
      case 'vendorName':       return <span className="text-gray-700 truncate">{row.vendorName ?? '—'}</span>
      case 'date':             return <span className="text-gray-500">{fmtDate(row.date)}</span>
      case 'expectedDelivery': return <span className="text-gray-500">{row.expectedDelivery ? fmtDate(row.expectedDelivery) : '—'}</span>
      case 'status':           return <StatusPill status={row.status ?? 'DRAFT'} />
      case 'total':            return <span className="font-semibold text-emerald-800 tabular-nums">{fmt(row.total)}</span>
      default: return null
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-emerald-900">Purchase Orders</h1><p className="text-sm text-emerald-600/70 mt-0.5">{`${sorted.length} orders`}</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative"><button onClick={() => setShowColToggle(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><SlidersHorizontal size={14} /> Columns</button>{showColToggle && (<div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-20">{cols.map(c => (<label key={c.key} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer select-none"><input type="checkbox" checked={c.visible} onChange={() => toggleCol(c.key)} className="rounded" />{c.label}</label>))}</div>)}</div>
          <div className="relative"><button onClick={() => setShowExport(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><Download size={14} /> Export</button>{showExport && (<div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20"><button onClick={handleExportCSV} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Export CSV</button></div>)}</div>
          <button onClick={() => router.push('/expenses/procurement/orders/activity')} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-medium"><Clock size={15} /> Activity Log</button>
          <button onClick={() => router.push('/expenses/procurement/purchase-orders/new')} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"><Plus size={15} /> New PO</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" /><input type="text" placeholder="Search purchase orders..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
        <div className="flex items-center gap-1.5 flex-wrap">{STATUSES.map(s => (<button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1) }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{s === 'ALL' ? 'All' : s}</button>))}</div>
        <button onClick={() => setShowAdvFilters(p => !p)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${showAdvFilters || activeFilterCount > 0 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Filter size={13} /> Filters {activeFilterCount > 0 && <span className="bg-emerald-600 text-white rounded-full px-1.5 py-px text-[10px] font-bold">{activeFilterCount}</span>}</button>
      </div>
      {showAdvFilters && (<div className="bg-white rounded-xl border border-emerald-100 p-4 flex flex-wrap gap-4 items-end"><div><label className="block text-xs font-medium text-gray-500 mb-1">Date From</label><input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div><div><label className="block text-xs font-medium text-gray-500 mb-1">Date To</label><input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div><button onClick={() => { setStatusFilter('ALL'); setDateFrom(''); setDateTo('') }} className="text-xs text-emerald-600 hover:underline">Clear all</button></div>)}
      {table.renderBulkToolbar([
        { label: 'Delete Selected', variant: 'danger', onClick: () => handleDeleteSelected() },
        { label: 'Approve Selected', variant: 'primary', onClick: () => handleApproveSelected() },
        { label: 'Convert to Bill', onClick: () => handleConvertSelected() },
        { label: 'Export Selected', onClick: () => handleExportSelected() },
      ])}
      <EnhancedTable
        columns={columns}
        data={paged}
        onSort={toggleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        tableId="purchase-orders"
        hasStickyActions={true}
        enableRowSelection={true}
        selectedRows={table.selectedRows}
        toggleRowSelection={table.toggleRowSelection}
        handleSelectAll={table.handleSelectAll}
        isAllSelected={table.isAllSelected}
        isIndeterminate={table.isIndeterminate}
        selectAllRef={table.selectAllRef}
        emptyMessage="No purchase orders found"
        rowClassName={(row) => (table.selectedRows.includes(row.id) ? 'bg-blue-50/20' : '')}
        onColumnsChange={handleColumnsChange}
      />
      {totalPages>1&&(<div className="flex items-center justify-between px-1"><span className="text-xs text-gray-400">{sorted.length} total</span><div className="flex items-center gap-2"><button onClick={()=>setCurrentPage(p=>p-1)} disabled={currentPage===1} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Previous</button><span className="text-xs font-semibold text-gray-600">Page {currentPage} of {totalPages}</span><button onClick={()=>setCurrentPage(p=>p+1)} disabled={currentPage===totalPages} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button></div></div>)}

      {/* Activity log available via top toolbar button */}
      {actionMenuId && menuPos && (() => {
        const row = rows.find(r => r.id === actionMenuId)
        if (!row) return null
        const ml = Math.min(Math.max(4, menuPos.x - 208), (typeof window !== 'undefined' ? window.innerWidth : 800) - 212)
        const mt = Math.min(menuPos.y + 4, (typeof window !== 'undefined' ? window.innerHeight : 600) - 160)
        const targetId = row.id
        const poNum = row.poNumber ?? ''
        return (
          <div style={{ position: 'fixed', top: mt, left: ml, zIndex: 9999 }} className="bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-52">
            <div className="px-3 py-1.5 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{row.poNumber ?? 'PO'}</p>
            </div>
            <MenuBtn icon={<Eye size={13} />} label="View Order" onClick={() => { router.push(`/expenses/procurement/purchase-orders/${row.id}/edit`); setActionMenuId(null); setMenuPos(null) }} />
            {(row.status === 'APPROVED' || row.status === 'RECEIVED' || row.status === 'PARTIAL_RECEIVED') && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <MenuBtn icon={<FileText size={13} />} label="Convert to Bill" onClick={async () => {
                  setActionMenuId(null); setMenuPos(null)
                  if (!companyId) { toast.error('Company not loaded'); return }
                  if (!window.confirm('Convert PO #' + poNum + ' to a bill? This will create a new bill.')) return
                  try {
                    const res = await expensesService.convertPurchaseOrderToBill(companyId, targetId!)
                    const data = res.data ?? res
                    const billId = data?.id ?? data?.bill?.id ?? data?.billId
                    if (billId) {
                      toast.success('Bill created from PO #' + poNum)
                      router.push(`/expenses/bills-payments/bills/${billId}/edit`)
                      fetchPurchaseOrders()
                    } else {
                      toast.error('Failed to convert PO to bill')
                    }
                  } catch (err) {
                    console.error(err)
                    toast.error('Failed to convert PO to bill')
                  }
                }} />
              </>
            )}
          </div>
        )
      })()}
      {actionMenuId && <div className="fixed inset-0 z-[9998]" onClick={() => { setActionMenuId(null); setMenuPos(null) }} />}
    </div>
  )
}



