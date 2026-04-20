'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  balance?: number
  status?: string
}

type SortKey = 'name' | 'email' | 'phone' | 'status' | 'balance'
type SortDir = 'asc' | 'desc'

const VENDOR_TABLE_ORDER: SortKey[] = ['name', 'email', 'phone', 'status', 'balance']
const DEFAULT_COLUMN_WIDTHS: Record<SortKey, number> = {
  name: 240,
  email: 240,
  phone: 160,
  status: 130,
  balance: 140,
}
const VENDOR_COLUMNS_STORAGE_KEY = 'vendors-page-column-widths-v2'

function loadVendorWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(VENDOR_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_COLUMN_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_COLUMN_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => VENDOR_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_COLUMN_WIDTHS
  }
}

function compareVendors(a: Vendor, b: Vendor, key: SortKey, dir: SortDir): number {
  const left = a[key] ?? ''
  const right = b[key] ?? ''
  if (key === 'balance') {
    const na = Number(left)
    const nb = Number(right)
    return dir === 'asc' ? na - nb : nb - na
  }
  const al = String(left).toLowerCase()
  const bl = String(right).toLowerCase()
  return dir === 'asc' ? al.localeCompare(bl) : bl.localeCompare(al)
}

export default function VendorsPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadVendorWidthMap())
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(VENDOR_COLUMNS_STORAGE_KEY, JSON.stringify(next))
    } catch {
    }
  }, [])

  const fetchVendors = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/vendors`)
      setVendors(Array.isArray(data) ? data : data.vendors ?? [])
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchVendors() }, [fetchVendors])

  const filtered = useMemo(() => {
    if (!search) return vendors
    const q = search.toLowerCase()
    return vendors.filter((vendor) =>
      vendor.name.toLowerCase().includes(q) ||
      (vendor.email ?? '').toLowerCase().includes(q) ||
      (vendor.phone ?? '').toLowerCase().includes(q),
    )
  }, [vendors, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => compareVendors(a, b, sortKey, sortDir))
  }, [filtered, sortKey, sortDir])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, pageSize, sorted.length])

  const pagedVendors = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
  }

  const handleDeleteSelected = useCallback(async () => {
    if (!companyId || selectedIds.length === 0) return
    try {
      await Promise.all(selectedIds.map((id) => apiClient.delete(`/companies/${companyId}/vendors/${id}`)))
      setVendors((prev) => prev.filter((vendor) => !selectedIds.includes(vendor.id)))
      setSelectedIds([])
      toast.success(`${selectedIds.length} selected vendor${selectedIds.length === 1 ? '' : 's'} deleted`)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to delete selected vendors')
    }
  }, [companyId, selectedIds, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.delete(`/companies/${companyId}/vendors/${id}`)
      setVendors((prev) => prev.filter((vendor) => vendor.id !== id))
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
      toast.success('Vendor deleted')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to delete vendor')
    }
  }, [companyId, toast])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const columns = useMemo(() => {
    const makeHeader = (label: string, key: SortKey, width: number) => (
      <div className="relative flex items-center gap-2">
        <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-2 text-left font-medium text-slate-800 hover:text-slate-900">
          {label}
          {sortKey === key ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
        </button>
        <ColumnResizer colKey={key} width={width} onChange={(_, next) => saveWidths({ ...widths, [key]: next })} min={80} />
      </div>
    )

    return [
      {
        accessorKey: 'name',
        header: makeHeader('Name', 'name', widths.name),
        meta: { align: 'left', style: { width: widths.name, minWidth: widths.name, maxWidth: widths.name } },
      },
      {
        accessorKey: 'email',
        header: makeHeader('Email', 'email', widths.email),
        meta: { align: 'left', hideBelow: 'md', style: { width: widths.email, minWidth: widths.email, maxWidth: widths.email } },
      },
      {
        accessorKey: 'phone',
        header: makeHeader('Phone', 'phone', widths.phone),
        meta: { align: 'left', hideBelow: 'lg', style: { width: widths.phone, minWidth: widths.phone, maxWidth: widths.phone } },
      },
      {
        accessorKey: 'status',
        header: makeHeader('Status', 'status', widths.status),
        meta: { align: 'left', style: { width: widths.status, minWidth: widths.status, maxWidth: widths.status } },
        cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? 'Draft')} domain="generic" />,
      },
      {
        accessorKey: 'balance',
        header: makeHeader('Balance', 'balance', widths.balance),
        meta: { align: 'right', style: { width: widths.balance, minWidth: widths.balance, maxWidth: widths.balance } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        meta: { align: 'right', style: { width: 120, minWidth: 120, maxWidth: 120 } },
        cell: ({ row }) => {
          const vendor = row.original as Vendor
          return (
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => toast.info('Coming soon')} className="p-1 rounded hover:bg-slate-100 text-slate-600" data-no-row-toggle title="Edit vendor"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(vendor.id)} className="p-1 rounded hover:bg-red-100 text-red-500" data-no-row-toggle title="Delete vendor"><Trash2 size={14} /></button>
            </div>
          )
        },
      },
    ]
  }, [fmt, handleDelete, saveWidths, sortDir, sortKey, toast, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Vendors"
      subtitle={`${sorted.length} visible vendors`}
      primaryActionLabel="Add Vendor"
      onPrimaryAction={() => toast.info('Coming soon')}
      secondaryActions={
        <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
          Delete Selected ({selectedIds.length})
        </button>
      }
      filters={(
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            placeholder="Search vendors..."
            className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      )}
      columns={columns}
      data={pagedVendors}
      isLoading={cidLoading || loading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={sorted.length}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      getRowId={(row) => row.id}
      bulkActions={[{ label: 'Delete Selected', icon: <Trash2 size={14} />, onClick: handleDeleteSelected, variant: 'destructive' }]}
      emptyTitle="No vendors found"
      emptyDescription="Try a different search or add your first vendor."
      emptyPrimaryAction="Add Vendor"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
