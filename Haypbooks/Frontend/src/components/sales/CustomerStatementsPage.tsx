'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Printer, Loader2, AlertCircle, X } from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn } from '@/components/shared/HaypDataTable.types'

interface ArAgingCustomer {
  customerId: string
  customerName: string
  current: number
  days30: number
  days60: number
  days90: number
  over90: number
  total: number
}

interface ArAgingSummary {
  current: number
  days1to30: number
  days31to60: number
  days61to90: number
  over90: number
  total: number
}

interface AgingResponse {
  summary?: ArAgingSummary
  buckets?: Array<{ label: string; amount: number }>
  customers?: ArAgingCustomer[]
}

interface CustomerOption {
  id: string
  name: string
  email?: string
}

export default function CustomerStatementsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [customerLoading, setCustomerLoading] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState<AgingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fmt = useCallback((value: number) => formatCurrency(value, currency), [currency])

  const loadCustomers = useCallback(async () => {
    if (!companyId) return
    setCustomerLoading(true)
    try {
      const response = await salesService.listArCustomers(companyId)
      const customerList = Array.isArray(response.data)
        ? response.data
        : []
      setCustomers(customerList.map((c: any) => ({ id: c.id, name: c.name ?? '', email: c.email ?? undefined })))
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to load customers')
    } finally {
      setCustomerLoading(false)
    }
  }, [companyId, toast])

  const loadStatement = useCallback(async () => {
    if (!companyId || !selectedCustomerId) {
      setData(null)
      return
    }
    setLoading(true)
    try {
      const response = await salesService.getArAgingReport(companyId, {
        asOf: asOfDate,
        customerId: selectedCustomerId,
      })
      setData(response.data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load statement')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedCustomerId, asOfDate])

  useEffect(() => { loadCustomers() }, [loadCustomers])
  useEffect(() => { loadStatement() }, [loadStatement])

  const summary = data?.summary ?? { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0, total: 0 }
  const statements: ArAgingCustomer[] = data?.customers ?? []

  const columns = useMemo<HaypColumn<ArAgingCustomer>[]>(() => [
    { id: 'customerName', header: 'Customer', accessorKey: 'customerName', size: 220 },
    {
      id: 'current', header: 'Current', accessorKey: 'current', size: 120, align: 'right',
      render: (_value, row) => (row.current ? fmt(row.current) : '—'),
    },
    {
      id: 'days30', header: '1-30 Days', accessorKey: 'days30', size: 120, align: 'right',
      render: (_value, row) => (row.days30 ? fmt(row.days30) : '—'),
    },
    {
      id: 'days60', header: '31-60 Days', accessorKey: 'days60', size: 120, align: 'right',
      render: (_value, row) => (row.days60 ? fmt(row.days60) : '—'),
    },
    {
      id: 'days90', header: '61-90 Days', accessorKey: 'days90', size: 120, align: 'right',
      render: (_value, row) => (row.days90 ? fmt(row.days90) : '—'),
    },
    {
      id: 'over90', header: 'Over 90 Days', accessorKey: 'over90', size: 120, align: 'right',
      render: (_value, row) => (row.over90 ? fmt(row.over90) : '—'),
    },
    {
      id: 'total', header: 'Total Outstanding', accessorKey: 'total', size: 140, align: 'right',
      render: (_value, row) => fmt(row.total),
    },
  ], [fmt])

  const statementCards = [
    { label: 'Current', amount: summary.current, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: '1-30 Days', amount: summary.days1to30, className: 'bg-slate-50 text-slate-700 border-slate-200' },
    { label: '31-60 Days', amount: summary.days31to60, className: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: '61-90 Days', amount: summary.days61to90, className: 'bg-orange-50 text-orange-700 border-orange-200' },
    { label: 'Over 90 Days', amount: summary.over90, className: 'bg-red-50 text-red-700 border-red-200' },
    { label: 'Total Outstanding', amount: summary.total, className: 'bg-slate-900 text-white border-slate-800' },
  ]

  const exportCsv = useCallback(() => {
    if (!statements.length) {
      toast.error('No statement data available to export')
      return
    }
    const headers = ['Customer', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', 'Over 90 Days', 'Total']
    const rows = statements.map((row) => [
      row.customerName,
      row.current,
      row.days30,
      row.days60,
      row.days90,
      row.over90,
      row.total,
    ])
    const summaryRow = [
      'Summary',
      summary.current,
      summary.days1to30,
      summary.days31to60,
      summary.days61to90,
      summary.over90,
      summary.total,
    ]
    const csv = [headers, ...rows, summaryRow]
      .map((line) => line.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `customer-statement-${selectedCustomerId}-${asOfDate}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [selectedCustomerId, asOfDate, statements, summary, toast])

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  if (cidLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px] bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-3 text-emerald-700">Loading company data…</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Statements</h1>
            <p className="text-sm text-slate-500 mt-1">View statement balances for a selected customer as of a given date.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <CustomerPickerField
                label="Customer"
                value={selectedCustomerId}
                customers={customers}
                loading={customerLoading}
                placeholder="Select customer..."
                onChange={setSelectedCustomerId}
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 h-12">
              <span className="text-xs font-semibold text-slate-500">As of</span>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                placeholder="As of date"
                className="text-sm border-0 focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              <Printer size={16} /> Print Statement
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">Unable to load statement</div>
              <p>{error}</p>
            </div>
            <button type="button" title="Dismiss error" onClick={() => setError('')} className="text-slate-500 hover:text-slate-900"><X size={16} /></button>
          </div>
        ) : null}

        {!selectedCustomerId ? (
          <div className="min-h-[320px] rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center text-slate-500">
            <p className="text-lg font-semibold text-slate-900">Select a customer to view their statement</p>
            <p className="mt-2 text-sm">Customer statements are generated from the AR aging report for the chosen date.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {statementCards.map((card) => (
                <div key={card.label} className={`rounded-3xl border px-5 py-5 shadow-sm ${card.className}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">{card.label}</p>
                  <p className="mt-3 text-2xl font-bold">{fmt(card.amount)}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              <HaypDataTable
                data={statements}
                columns={columns}
                tableId="customer-statements-details"
                title={`Statement details for ${selectedCustomer?.name ?? 'Customer'}`}
                description={`Aging balances as of ${asOfDate}`}
                loading={loading}
                emptyTitle="No statement data"
                emptySubtitle="This customer has no aging details for the selected date."
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
