'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Search, MoreVertical, Download, Filter, SlidersHorizontal, Clock,
  CheckSquare, Square, X, ArrowUpDown, Trash2, Edit2, Eye, RefreshCw, Power,
} from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import EnhancedTable, { type Column as EnhancedColumn, useEnhancedTable } from '@/components/shared/EnhancedTable'
import CenteredModal from '@/components/shared/CenteredModal'
import VendorForm, { type VendorFormHandle } from './VendorForm'
import { fmtDate, csvDownload, MenuBtn, StatusPill } from './_helpers'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  balance?: number
  status?: string
}
type SortKey = 'name' | 'email' | 'phone' | 'status' | 'balance'

// ─── Columns ──────────────────────────────────────────────────────────────────
type ColDef = { key: string; label: string; visible: boolean; width: number; align?: EnhancedColumn<Vendor>['align'] }
const DEFAULT_COLS: ColDef[] = [
  { key: 'name',    label: 'Name',    visible: true, width: 240 },
  { key: 'email',   label: 'Email',   visible: true, width: 220 },
  { key: 'phone',   label: 'Phone',   visible: true, width: 150 },
  { key: 'status',  label: 'Status',  visible: true, width: 130 },
  { key: 'balance', label: 'Balance', visible: true, width: 130, align: 'right' },
]
const STORAGE_KEY = 'vendors-cols-v3'

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) {
      const saved = JSON.parse(s) as ColDef[]
      return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width, visible: sc.visible } : d })
    }
  } catch {}
  return DEFAULT_COLS
}

function compare(a: Vendor, b: Vendor, key: SortKey, dir: 'asc' | 'desc'): number {
  if (key === 'balance') { const d = (a.balance ?? 0) - (b.balance ?? 0); return dir === 'asc' ? d : -d }
  const al = String(a[key] ?? '').toLowerCase(); const bl = String(b[key] ?? '').toLowerCase()
  return dir === 'asc' ? al.localeCompare(bl) : bl.localeCompare(al)
}

const STATUSES = ['ALL', 'ACTIVE', 'INACTIVE']

export default function VendorsPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows]       = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey]   = useState<SortKey>('name')
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 25
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [menuPos, setMenuPos]           = useState<{ x: number; y: number } | null>(null)
  const [showExport, setShowExport]     = useState(false)
  const [showAdvFilters, setShowAdvFilters] = useState(false)
  const [showColToggle, setShowColToggle]   = useState(false)
  const [cols, setCols]   = useState<ColDef[]>(() => loadCols())
  const [toast, setToast] = useState('')
  const [vendorPanelOpen, setVendorPanelOpen] = useState(false)
  const [openVendorId, setOpenVendorId] = useState<string | null>(null)
  const [openVendorMode, setOpenVendorMode] = useState<'new' | 'edit'>('new')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const saveCols  = (next: ColDef[]) => { setCols(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {} }
  const toggleCol = (key: string)   => saveCols(cols.map(c => c.key === key ? { ...c, visible: !c.visible } : c))
  const handleColumnsChange = (next: EnhancedColumn<Vendor>[]) => {
    saveCols(cols.map(col => {
      const updated = next.find(c => c.key === col.key)
      return updated ? { ...col, width: updated.width } : col
    }))
  }
  const vendorFormRef = useRef<VendorFormHandle | null>(null)
  const closeVendorPanel = () => { setVendorPanelOpen(false); setOpenVendorId(null); setOpenVendorMode('new') }
  const openNewVendor = () => { setVendorPanelOpen(true); setOpenVendorMode('new'); setOpenVendorId(null) }
  const openEditVendor = (id: string) => { setVendorPanelOpen(true); setOpenVendorMode('edit'); setOpenVendorId(id) }
  const saveVendor = () => { vendorFormRef.current?.save() }

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fetchVendors = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listVendors(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.vendors ?? [])
    } catch {
      setError('Failed to load vendors')
      showToast('Failed to load vendors')
    } finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchVendors() }, [fetchVendors])
  const onVendorSaved = async () => { await fetchVendors(); closeVendorPanel() }

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') list = list.filter(r => (r.status ?? 'ACTIVE') === statusFilter)
    if (search) { const q = search.toLowerCase(); list = list.filter(r => r.name.toLowerCase().includes(q) || (r.email ?? '').toLowerCase().includes(q) || (r.phone ?? '').toLowerCase().includes(q)) }
    return list
  }, [rows, statusFilter, search])

  const sorted = useMemo(() => [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir)), [filtered, sortKey, sortDir])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages) }, [currentPage, totalPages])
  const paged = useMemo(() => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sorted, currentPage])
  const table = useEnhancedTable<Vendor>({ data: paged, tableId: 'vendors' })

  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }
  const activeFilterCount = [statusFilter !== 'ALL'].filter(Boolean).length

  const handleDeactivate = useCallback(async (id: string) => {
    if (!companyId) return
    if (!confirm('Deactivate this vendor? This will retain the vendor record but mark it inactive.')) return
    try {
      await expensesService.updateVendor(companyId, id, { status: 'INACTIVE' })
      setRows(p => p.map(r => r.id === id ? { ...r, status: 'INACTIVE' } : r))
      showToast('Vendor deactivated'); setActionMenuId(null); setMenuPos(null)
    } catch { showToast('Failed to deactivate vendor') }
  }, [companyId, showToast])

  const handleDelete = useCallback(async (id: string) => {
    if (!companyId) return
    const vendor = rows.find((row) => row.id === id)
    if (vendor?.status === 'ACTIVE') {
      showToast('Active vendors must be deactivated before deletion')
      return
    }
    try {
      await expensesService.deleteVendor(companyId, id)
      setRows(p => p.filter(r => r.id !== id))
      table.clearSelection()
      showToast('Vendor deleted'); setActionMenuId(null); setMenuPos(null)
    } catch { showToast('Failed to delete vendor') }
  }, [companyId, rows, table, showToast])

  const selectedRowsData = useMemo(
    () => rows.filter((row) => table.selectedRows.includes(row.id)),
    [rows, table.selectedRows],
  )
  const canDeleteSelected = selectedRowsData.length > 0 && selectedRowsData.every((row) => (row.status ?? 'ACTIVE') !== 'ACTIVE')
  const canDeactivateSelected = selectedRowsData.some((row) => (row.status ?? 'ACTIVE') === 'ACTIVE')

  const handleDeactivateSelected = useCallback(async () => {
    if (!companyId || table.selectedRows.length === 0) return
    if (!canDeactivateSelected) {
      showToast('No active vendors selected to deactivate')
      return
    }
    const activeIds = selectedRowsData.filter((row) => (row.status ?? 'ACTIVE') === 'ACTIVE').map((row) => row.id)
    if (!confirm(`Deactivate ${activeIds.length} selected vendor${activeIds.length !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(activeIds.map((id) => expensesService.updateVendor(companyId, id, { status: 'INACTIVE' })))
      setRows((prev) => prev.map((row) => activeIds.includes(row.id) ? { ...row, status: 'INACTIVE' } : row))
      table.clearSelection()
      showToast(`${activeIds.length} selected vendor${activeIds.length !== 1 ? 's' : ''} deactivated`)
    } catch {
      showToast('Failed to deactivate selected vendors')
    }
  }, [canDeactivateSelected, companyId, selectedRowsData, table, showToast])

  const handleDeleteSelected = useCallback(async () => {
    if (!companyId || table.selectedRows.length === 0) return
    if (!canDeleteSelected) {
      showToast('Only inactive vendors can be deleted')
      return
    }
    const ids = table.selectedRows
    if (!confirm(`Delete ${ids.length} selected vendor${ids.length !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(ids.map(id => expensesService.deleteVendor(companyId, id)))
      setRows(p => p.filter(r => !ids.includes(r.id)))
      table.clearSelection()
      showToast(`${ids.length} vendor${ids.length > 1 ? 's' : ''} deleted`)
    } catch { showToast('Failed to delete selected vendors') }
  }, [canDeleteSelected, companyId, table, showToast])

  const handleExportCSV = () => {
    setShowExport(false)
    csvDownload(`vendors-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Name', 'Email', 'Phone', 'Status', 'Balance'],
      sorted.map(r => [r.name, r.email ?? '', r.phone ?? '', r.status ?? '', String(r.balance ?? 0)]))
    showToast('CSV exported')
  }

  const visibleCols = cols.filter(c => c.visible)

  const renderCell = useCallback((row: Vendor, key: string) => {
    switch (key) {
      case 'name':    return <span className="font-semibold text-gray-800 truncate">{row.name}</span>
      case 'email':   return <span className="text-gray-500 truncate">{row.email ?? 'u2014'}</span>
      case 'phone':   return <span className="text-gray-500 truncate">{row.phone ?? 'u2014'}</span>
      case 'status':  return <StatusPill status={row.status ?? 'ACTIVE'} />
      case 'balance': return <span className="font-semibold text-emerald-800 tabular-nums">{fmt(row.balance ?? 0)}</span>
      default: return null
    }
  }, [fmt])

  const tableColumns = useMemo<EnhancedColumn<Vendor>[]>(() => [
    table.renderCheckboxColumn(),
    ...visibleCols.map((col) => ({
      key: col.key,
      header: col.label,
      width: col.width,
      minWidth: col.width,
      sortable: true,
      align: col.align,
      render: (_value, row: Vendor) => renderCell(row, col.key),
    })),
    {
      key: 'actions',
      isAction: true,
      header: '',
      width: 52,
      minWidth: 52,
      sortable: false,
      align: 'right',
      render: (_value, row: Vendor) => {
        const isOpen = actionMenuId === row.id
        return (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect()
              if (isOpen) {
                setActionMenuId(null)
                setMenuPos(null)
              } else {
                setActionMenuId(row.id)
                setMenuPos({ x: rect.right, y: rect.bottom })
              }
            }}
            title="Vendor actions"
            aria-label="Vendor actions"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <MoreVertical size={14} />
          </button>
        )
      },
    },
  ], [visibleCols, actionMenuId, renderCell, table])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Vendors</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{loading ? 'Loading...' : `${sorted.length} vendors`}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={fetchVendors} title="Refresh vendors" aria-label="Refresh vendors" className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><RefreshCw size={14} /></button>
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
            <button onClick={() => router.push('/expenses/vendors/activity')} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-medium"><Clock size={15} /> Activity Log</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input type="text" placeholder="Search vendors..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <button onClick={openNewVendor} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><Plus size={14} /> New Vendor</button>
        <div className="flex items-center gap-1.5">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1) }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdvFilters(p => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${showAdvFilters || activeFilterCount > 0 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Filter size={13} /> Filters {activeFilterCount > 0 && <span className="bg-emerald-600 text-white rounded-full px-1.5 py-px text-[10px] font-bold">{activeFilterCount}</span>}
        </button>
      </div>

      {showAdvFilters && (
        <div className="bg-white rounded-xl border border-emerald-100 p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label htmlFor="statusFilter" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select id="statusFilter" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
              {STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
            </select>
          </div>
          <button onClick={() => setStatusFilter('ALL')} className="text-xs text-emerald-600 hover:underline">Clear filters</button>
        </div>
      )}

      {table.renderBulkToolbar([
        { label: 'Deactivate Selected', variant: 'danger', onClick: handleDeactivateSelected, disabled: !canDeactivateSelected },
        { label: 'Delete Selected', variant: 'danger', onClick: handleDeleteSelected, disabled: !canDeleteSelected },
        { label: 'Export Selected', onClick: () => table.exportSelectedToCsv(`vendors-selected-${new Date().toISOString().slice(0, 10)}.csv`, ['Name','Email','Phone','Status','Balance'], (row) => [row.name, row.email ?? '', row.phone ?? '', row.status ?? '', String(row.balance ?? 0)] ) },
      ])}

      <EnhancedTable
        columns={tableColumns}
        data={paged}
        onSort={toggleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        emptyMessage="No vendors found"
        rowClassName={(row) => (table.selectedRows.includes(row.id) ? 'bg-blue-50/20' : '')}
        onColumnsChange={handleColumnsChange}
        fixedWidth={96}
        enableRowSelection={true}
        selectedRows={table.selectedRows}
        toggleRowSelection={table.toggleRowSelection}
        handleSelectAll={table.handleSelectAll}
        isAllSelected={table.isAllSelected}
        isIndeterminate={table.isIndeterminate}
        selectAllRef={table.selectAllRef}
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

      {/* Activity log available via top toolbar button */}

      {actionMenuId && menuPos && (() => {
        const row = rows.find(r => r.id === actionMenuId)
        if (!row) return null
        const ml = Math.min(Math.max(4, menuPos.x - 208), (typeof window !== 'undefined' ? window.innerWidth : 800) - 212)
        const mt = Math.min(menuPos.y + 4, (typeof window !== 'undefined' ? window.innerHeight : 600) - 160)
        return (
          <div className="fixed right-4 top-24 z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-52">
            <div className="px-3 py-1.5 border-b border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{row.name}</p></div>
            <MenuBtn icon={<Eye size={13} />} label="View Vendor" onClick={() => { openEditVendor(row.id); setActionMenuId(null) }} />
            <MenuBtn icon={<Edit2 size={13} />} label="Edit Vendor" onClick={() => { openEditVendor(row.id); setActionMenuId(null) }} />
            <div className="my-1 border-t border-gray-100" />
            {row.status === 'ACTIVE' ? (
              <MenuBtn icon={<Trash2 size={13} />} label="Deactivate Vendor" danger onClick={() => handleDeactivate(row.id)} />
            ) : (
              <MenuBtn icon={<Trash2 size={13} />} label="Delete Vendor" danger onClick={() => handleDelete(row.id)} />
            )}
          </div>
        )
      })()}
      {actionMenuId && <div className="fixed inset-0 z-[9998]" onClick={() => { setActionMenuId(null); setMenuPos(null) }} />}

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none">{toast}</div>}
      <CenteredModal
        open={vendorPanelOpen}
        onClose={closeVendorPanel}
        title={openVendorMode === 'new' ? 'New Vendor' : 'Edit Vendor'}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeVendorPanel}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveVendor}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Save
            </button>
          </div>
        }
      >
        <VendorForm
          ref={vendorFormRef}
          mode={openVendorMode}
          vendorId={openVendorId ?? undefined}
          onSaved={onVendorSaved}
        />
      </CenteredModal>
    </div>
  )
}

