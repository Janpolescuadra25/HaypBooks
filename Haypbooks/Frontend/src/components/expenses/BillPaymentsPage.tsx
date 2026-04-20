'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Ban, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import DataPage from '@/components/shared/DataPage'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import ColumnResizer from '@/components/ColumnResizer'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface BillPayment {
  id: string
  paymentNumber?: string
  vendorName?: string
  billNumber?: string
  date: string
  amount: number
  method?: string
  reference?: string
  status?: string
}

type SortKey = 'paymentNumber' | 'vendorName' | 'date' | 'method' | 'status' | 'amount'

const PAYMENT_TABLE_ORDER: SortKey[] = ['paymentNumber', 'vendorName', 'date', 'method', 'status', 'amount']
const DEFAULT_PAYMENT_COL_WIDTHS: Record<SortKey, number> = {
  paymentNumber: 130,
  vendorName: 190,
  date: 120,
  method: 140,
  status: 130,
  amount: 130,
}
const PAYMENT_COLUMNS_STORAGE_KEY = 'bill-payments-column-widths-v2'

const SAMPLE_PAYMENTS: BillPayment[] = [
  { id: 'payment-001', paymentNumber: 'PAY-1001', vendorName: 'Luzon Supplies', billNumber: 'BILL-001', date: '2026-04-10', amount: 25000, method: 'Bank Transfer', reference: 'TXN1234', status: 'COMPLETED' },
  { id: 'payment-002', paymentNumber: 'PAY-1002', vendorName: 'MNL Office Solutions', billNumber: 'BILL-002', date: '2026-03-25', amount: 10000, method: 'Check', reference: 'CHK5678', status: 'COMPLETED' },
  { id: 'payment-003', paymentNumber: 'PAY-1003', vendorName: 'Cebu Transport Co.', billNumber: 'BILL-003', date: '2026-03-15', amount: 9200, method: 'Credit Card', reference: 'CC9012', status: 'VOIDED' },
]

function loadPaymentWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(PAYMENT_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_PAYMENT_COL_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_PAYMENT_COL_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => PAYMENT_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_PAYMENT_COL_WIDTHS
  }
}

function comparePayments(a: BillPayment, b: BillPayment, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''
  if (key === 'amount') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }
  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function BillPaymentsPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [payments, setPayments] = useState<BillPayment[]>(SAMPLE_PAYMENTS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadPaymentWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(PAYMENT_COLUMNS_STORAGE_KEY, JSON.stringify(next))
    } catch {
    }
  }, [])

  const fetchPayments = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/bill-payments`)
      setPayments(Array.isArray(data) ? data : data.payments ?? [])
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to load bill payments')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const filtered = useMemo(() => {
    if (!search) return payments
    const q = search.toLowerCase()
    return payments.filter((payment) =>
      (payment.vendorName ?? '').toLowerCase().includes(q) ||
      (payment.paymentNumber ?? '').toLowerCase().includes(q) ||
      (payment.reference ?? '').toLowerCase().includes(q),
    )
  }, [payments, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => comparePayments(a, b, sortKey, sortDir))
  }, [filtered, sortKey, sortDir])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, pageSize, sorted.length])

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  const handleVoid = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/bill-payments/${id}/void`)
      setPayments((prev) => prev.map((payment) => payment.id === id ? { ...payment, status: 'VOIDED' } : payment))
      toast.success('Payment voided')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to void payment')
    }
  }, [companyId, toast])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return d
    }
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
  }

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
        accessorKey: 'paymentNumber',
        header: makeHeader('Payment #', 'paymentNumber', widths.paymentNumber),
        meta: { align: 'left', style: { width: widths.paymentNumber, minWidth: widths.paymentNumber, maxWidth: widths.paymentNumber } },
      },
      {
        accessorKey: 'vendorName',
        header: makeHeader('Vendor', 'vendorName', widths.vendorName),
        meta: { align: 'left', style: { width: widths.vendorName, minWidth: widths.vendorName, maxWidth: widths.vendorName } },
      },
      {
        accessorKey: 'date',
        header: makeHeader('Date', 'date', widths.date),
        meta: { align: 'left', style: { width: widths.date, minWidth: widths.date, maxWidth: widths.date } },
        cell: ({ getValue }) => <span>{fmtDate(String(getValue() ?? ''))}</span>,
      },
      {
        accessorKey: 'method',
        header: makeHeader('Method', 'method', widths.method),
        meta: { align: 'left', style: { width: widths.method, minWidth: widths.method, maxWidth: widths.method } },
      },
      {
        accessorKey: 'status',
        header: makeHeader('Status', 'status', widths.status),
        meta: { align: 'left', style: { width: widths.status, minWidth: widths.status, maxWidth: widths.status } },
        cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? 'Pending')} domain="generic" />,
      },
      {
        accessorKey: 'amount',
        header: makeHeader('Amount', 'amount', widths.amount),
        meta: { align: 'right', style: { width: widths.amount, minWidth: widths.amount, maxWidth: widths.amount } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        meta: { align: 'right', style: { width: 120, minWidth: 120, maxWidth: 120 } },
        cell: ({ row }) => {
          const payment = row.original as BillPayment
          return (
            <div className="flex items-center justify-end gap-1">
              {String(payment.status ?? '').toUpperCase() !== 'VOIDED' && (
                <button onClick={() => handleVoid(payment.id)} className="p-1 rounded hover:bg-red-100 text-red-500" data-no-row-toggle title="Void payment"><Ban size={14} /></button>
              )}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleVoid, saveWidths, sortDir, sortKey, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Bill Payments"
      subtitle={`${sorted.length} payments`}
      primaryActionLabel="Record Payment"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="grid gap-3 lg:grid-cols-[1fr]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Search payments..."
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>
      )}
      columns={columns}
      data={paged}
      isLoading={cidLoading || loading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={sorted.length}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
      selectedIds={[]}
      onSelectionChange={() => {}}
      getRowId={(row) => row.id}
      emptyTitle="No payments found"
      emptyDescription="Try a different search or record a payment."
      emptyPrimaryAction="Record Payment"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
