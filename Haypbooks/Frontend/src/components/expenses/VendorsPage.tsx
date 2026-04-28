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
import CenteredModal from '@/components/shared/CenteredModal'
import VendorForm, { type VendorFormHandle } from './VendorForm'
import { csvDownload } from './_helpers'
import { useRouter } from 'next/navigation'
import { VendorTable } from './VendorTable'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  balance?: number
  status?: string
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
  const [toast, setToast] = useState('')
  const [vendorPanelOpen, setVendorPanelOpen] = useState(false)
  const [openVendorId, setOpenVendorId] = useState<string | null>(null)
  const [openVendorMode, setOpenVendorMode] = useState<'new' | 'edit'>('new')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
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
    return list
  }, [rows, statusFilter])

  const handleDeactivate = useCallback(async (id: string) => {
    if (!companyId) return
    if (!confirm('Deactivate this vendor? This will retain the vendor record but mark it inactive.')) return
    try {
      await expensesService.updateVendor(companyId, id, { status: 'INACTIVE' })
      setRows(p => p.map(r => r.id === id ? { ...r, status: 'INACTIVE' } : r))
      showToast('Vendor deactivated')
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
      showToast('Vendor deleted')
    } catch { showToast('Failed to delete vendor') }
  }, [companyId, rows, showToast])

  const handleDeactivateSelected = useCallback(async (activeIds: string[]) => {
    if (!companyId || activeIds.length === 0) return
    if (!confirm(`Deactivate ${activeIds.length} selected vendor${activeIds.length !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(activeIds.map((id) => expensesService.updateVendor(companyId, id, { status: 'INACTIVE' })))
      setRows((prev) => prev.map((row) => activeIds.includes(row.id) ? { ...row, status: 'INACTIVE' } : row))
      showToast(`${activeIds.length} selected vendor${activeIds.length !== 1 ? 's' : ''} deactivated`)
    } catch {
      showToast('Failed to deactivate selected vendors')
    }
  }, [companyId])

  const handleDeleteSelected = useCallback(async (ids: string[]) => {
    if (!companyId || ids.length === 0) return
    if (!confirm(`Delete ${ids.length} selected vendor${ids.length !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(ids.map(id => expensesService.deleteVendor(companyId, id)))
      setRows(p => p.filter(r => !ids.includes(r.id)))
      showToast(`${ids.length} vendor${ids.length > 1 ? 's' : ''} deleted`)
    } catch { showToast('Failed to delete selected vendors') }
  }, [companyId])

  const handleExportSelectedCSV = (selectedIds: string[]) => {
    const selectedData = filtered.filter(v => selectedIds.includes(v.id))
    csvDownload(`vendors-selected-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Name', 'Email', 'Phone', 'Status', 'Balance'],
      selectedData.map(r => [r.name, r.email ?? '', r.phone ?? '', r.status ?? '', String(r.balance ?? 0)]))
    showToast('CSV exported')
  }

  const handleExportCSV = () => {
    csvDownload(`vendors-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Name', 'Email', 'Phone', 'Status', 'Balance'],
      filtered.map(r => [r.name, r.email ?? '', r.phone ?? '', r.status ?? '', String(r.balance ?? 0)]))
    showToast('CSV exported')
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 w-full h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Vendors</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{loading ? 'Loading...' : `${filtered.length} vendors`}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={openNewVendor} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-transparent bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"><Plus size={14} /> New Vendor</button>
            <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 text-emerald-700 rounded-lg hover:bg-emerald-50 bg-white transition-colors"><Download size={14} /> Export</button>
            <button onClick={() => router.push('/expenses/vendors/activity')} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 text-emerald-700 rounded-lg hover:bg-emerald-50 bg-white transition-colors font-medium"><Clock size={15} /> Activity Log</button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 min-w-0 pb-4">
        <VendorTable
          data={filtered}
          currency={currency}
          onRefresh={fetchVendors}
          onExportSelected={handleExportSelectedCSV}
          onDeactivateSelected={handleDeactivateSelected}
          onDeleteSelected={handleDeleteSelected}
          onView={(id) => openEditVendor(id)}
          onEdit={(id) => openEditVendor(id)}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
          globalFilter={search}
          setGlobalFilter={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onViewTransactions={(id) => router.push(`/expenses/vendors/activity?vendorId=${id}`)}
        />
      </div>

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

