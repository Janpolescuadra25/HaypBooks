'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Download, Clock, Trash2, Edit2, Eye, List, Banknote } from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { cn } from '@/lib/utils'
import HaypVendorModal from '@/components/shared/HaypVendorModal'
import { csvDownload } from './_helpers'
import { useRouter } from 'next/navigation'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { Badge } from '@/components/ui/badge'

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
  const [rows, setRows] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [toast, setToast] = useState('')
  const [vendorPanelOpen, setVendorPanelOpen] = useState(false)
  const [openVendorId, setOpenVendorId] = useState<string | null>(null)
  const [openVendorMode, setOpenVendorMode] = useState<'new' | 'edit'>('new')

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }, [])
  const closeVendorPanel = useCallback(() => { setVendorPanelOpen(false); setOpenVendorId(null); setOpenVendorMode('new') }, [])
  const openNewVendor = useCallback(() => { setVendorPanelOpen(true); setOpenVendorMode('new'); setOpenVendorId(null) }, [])
  const openEditVendor = useCallback((id: string) => { setVendorPanelOpen(true); setOpenVendorMode('edit'); setOpenVendorId(id) }, [])

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
  }, [companyId, showToast])

  useEffect(() => { fetchVendors() }, [fetchVendors])
  const onVendorSaved = async () => { await fetchVendors(); closeVendorPanel() }

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') list = list.filter((r) => (r.status ?? 'ACTIVE') === statusFilter)
    return list
  }, [rows, statusFilter])

  const handleDeactivate = useCallback(async (id: string) => {
    if (!companyId) return
    if (!confirm('Deactivate this vendor? This will retain the vendor record but mark it inactive.')) return
    try {
      await expensesService.updateVendor(companyId, id, { status: 'INACTIVE' })
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'INACTIVE' } : r)))
      showToast('Vendor deactivated')
    } catch {
      showToast('Failed to deactivate vendor')
    }
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
      setRows((prev) => prev.filter((r) => r.id !== id))
      showToast('Vendor deleted')
    } catch {
      showToast('Failed to delete vendor')
    }
  }, [companyId, rows, showToast])

  const handleDeactivateSelected = useCallback(async (activeIds: string[]) => {
    if (!companyId || activeIds.length === 0) return
    if (!confirm(`Deactivate ${activeIds.length} selected vendor${activeIds.length !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(activeIds.map((id) => expensesService.updateVendor(companyId, id, { status: 'INACTIVE' })))
      setRows((prev) => prev.map((row) => (activeIds.includes(row.id) ? { ...row, status: 'INACTIVE' } : row)))
      showToast(`${activeIds.length} selected vendor${activeIds.length !== 1 ? 's' : ''} deactivated`)
    } catch {
      showToast('Failed to deactivate selected vendors')
    }
  }, [companyId, showToast])

  const handleDeleteSelected = useCallback(async (ids: string[]) => {
    if (!companyId || ids.length === 0) return
    if (!confirm(`Delete ${ids.length} selected vendor${ids.length !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(ids.map((id) => expensesService.deleteVendor(companyId, id)))
      setRows((prev) => prev.filter((r) => !ids.includes(r.id)))
      showToast(`${ids.length} vendor${ids.length !== 1 ? 's' : ''} deleted`)
    } catch {
      showToast('Failed to delete selected vendors')
    }
  }, [companyId, showToast])

  const handleExportSelectedCSV = useCallback((selectedIds: string[]) => {
    const selectedData = filtered.filter((v) => selectedIds.includes(v.id))
    csvDownload(`vendors-selected-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Name', 'Email', 'Phone', 'Status', 'Balance'],
      selectedData.map((r) => [r.name, r.email ?? '', r.phone ?? '', r.status ?? '', String(r.balance ?? 0)]))
    showToast('CSV exported')
  }, [filtered, showToast])

  const handleExportCSV = useCallback(() => {
    csvDownload(`vendors-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Name', 'Email', 'Phone', 'Status', 'Balance'],
      filtered.map((r) => [r.name, r.email ?? '', r.phone ?? '', r.status ?? '', String(r.balance ?? 0)]))
    showToast('CSV exported')
  }, [filtered, showToast])

  const columns: HaypColumn<Vendor>[] = useMemo(() => [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      size: 220,
      minSize: 90,
      render: (val) => <span className="font-semibold text-gray-800 truncate">{val || '—'}</span>,
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      size: 220,
      minSize: 90,
      render: (val) => <span className="text-gray-500 text-xs truncate">{val || '—'}</span>,
    },
    {
      id: 'phone',
      header: 'Phone',
      accessorKey: 'phone',
      size: 150,
      minSize: 90,
      render: (val) => <span className="text-gray-500 text-xs truncate">{val || '—'}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 130,
      minSize: 90,
      render: (val) => {
        const status = val || 'ACTIVE'
        return (
          <Badge
            variant="outline"
            className={cn(
              'capitalize text-[10px] px-2 py-0 h-5 border-none font-bold tracking-tight',
              status === 'ACTIVE' && 'bg-emerald-500/10 text-emerald-700',
              status === 'INACTIVE' && 'bg-gray-500/10 text-gray-700',
            )}
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'balance',
      header: 'Balance',
      accessorKey: 'balance',
      size: 140,
      minSize: 90,
      align: 'right',
      isSummable: true,
      render: (val) => (
        <div className="text-right font-mono font-medium text-xs text-gray-900 tabular-nums">
          {formatCurrency(val ?? 0, currency)}
        </div>
      ),
    },
  ], [currency])

  const filters = useMemo(() => [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ], [])

  const actions: HaypActionItem[] = useMemo(() => [
    {
      label: 'View Details',
      icon: <Eye className="mr-2.5 h-4 w-4 opacity-70" />,
      onClick: (id) => openEditVendor(id),
    },
    {
      label: 'Edit Vendor',
      icon: <Edit2 className="mr-2.5 h-4 w-4 opacity-70" />,
      onClick: (id) => openEditVendor(id),
    },
    {
      label: 'View Transactions',
      icon: <List className="mr-2.5 h-4 w-4 opacity-70" />,
      onClick: (id) => router.push(`/expenses/vendors/activity?vendorId=${id}`),
    },
    {
      label: 'Export Vendor Data',
      icon: <Download className="mr-2.5 h-4 w-4 opacity-70" />,
      onClick: (id) => handleExportSelectedCSV([id]),
    },
    { divider: true, label: '', onClick: () => {} },
    {
      label: 'Deactivate Vendor',
      icon: <Trash2 className="mr-2.5 h-4 w-4 opacity-70" />,
      danger: true,
      onClick: (id) => handleDeactivate(id),
      show: (row) => (row.status ?? 'ACTIVE') === 'ACTIVE',
    },
    {
      label: 'Delete Vendor',
      icon: <Trash2 className="mr-2.5 h-4 w-4 opacity-70" />,
      danger: true,
      onClick: (id) => handleDelete(id),
      show: (row) => (row.status ?? 'ACTIVE') !== 'ACTIVE',
    },
  ], [handleDeactivate, handleDelete, handleExportSelectedCSV, openEditVendor, router])

  const bulkActions: HaypBulkAction[] = useMemo(() => [
    {
      label: 'Export',
      icon: <Download className="mr-2.5 h-4 w-4 opacity-70" />,
      variant: 'default',
      onClick: (ids) => handleExportSelectedCSV(ids),
    },
    {
      label: 'Deactivate',
      icon: <Trash2 className="mr-2.5 h-4 w-4 opacity-70" />,
      variant: 'danger',
      onClick: (ids) => handleDeactivateSelected(ids),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="mr-2.5 h-4 w-4 opacity-70" />,
      variant: 'danger',
      onClick: (ids) => handleDeleteSelected(ids),
    },
  ], [handleDeactivateSelected, handleDeleteSelected, handleExportSelectedCSV])

  const totals: HaypTotalsConfig = useMemo(() => ({
    enabled: true,
    formatValue: (value) => formatCurrency(value, currency),
  }), [currency])

  const stats = useMemo(() => [
    { icon: List, label: 'Total Vendors', value: rows.length, color: 'blue' },
    { icon: Clock, label: 'Active Vendors', value: rows.filter(r => (r.status ?? 'ACTIVE') === 'ACTIVE').length, color: 'emerald' },
    { icon: Trash2, label: 'Inactive Vendors', value: rows.filter(r => r.status === 'INACTIVE').length, color: 'amber' },
    { icon: Banknote, label: 'Total Balance', value: formatCurrency(rows.reduce((acc, curr) => acc + (curr.balance ?? 0), 0), currency), color: 'rose' },
  ], [rows, currency])

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        <HaypDataTable
          data={filtered}
          columns={columns}
          tableId="vendors"
          title="Vendors"
          description="Manage your suppliers, service providers, and expense categories in one place."
          stats={stats}
          headerActions={
            <button 
              onClick={openNewVendor} 
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} />
              New Vendor
            </button>
          }
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          filters={filters}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          filterLabel="All Statuses"
          actions={actions}
          bulkActions={bulkActions}
          totals={totals}
          onRefresh={fetchVendors}
          onExport={handleExportCSV}
          exportLabel="Export"
          onActivityLog={() => router.push('/expenses/vendors/activity')}
          onRowClick={(row) => openEditVendor(row.id)}
          emptyTitle="No vendors found"
          emptySubtitle="Adjust your search or filter to see results"
          loading={loading}
        />
      </div>

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             {toast}
          </div>
        </div>
      )}

      <HaypVendorModal
        isOpen={vendorPanelOpen}
        onClose={closeVendorPanel}
        mode={openVendorMode}
        vendorId={openVendorId ?? undefined}
        onSaved={onVendorSaved}
      />
    </div>
  )
}

