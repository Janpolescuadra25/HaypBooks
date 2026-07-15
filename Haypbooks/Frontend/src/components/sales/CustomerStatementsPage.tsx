'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Printer, Loader2, AlertCircle, X } from 'lucide-react'
import { salesService, CustomerStatementResponse, StatementLine } from '@/services/sales.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn } from '@/components/shared/HaypDataTable.types'

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
  const [statement, setStatement] = useState<CustomerStatementResponse | null>(null)
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
      setStatement(null)
      return
    }
    setLoading(true)
    try {
      const response = await salesService.getCustomerStatement(companyId, selectedCustomerId, { asOf: asOfDate })
      setStatement(response.data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load statement')
      setStatement(null)
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedCustomerId, asOfDate])

  useEffect(() => { loadCustomers() }, [loadCustomers])
  useEffect(() => { loadStatement() }, [loadStatement])

  const summary = statement?.totals ?? { invoices: 0, payments: 0, credits: 0, net: 0 }
  const statementLines: StatementLine[] = statement?.lines ?? []

  const columns = useMemo<HaypColumn<StatementLine>[]>(() => [
    { id: 'date', header: 'Date', accessorKey: 'date', size: 120 },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      size: 120,
      render: (_value, row) => {
        const label = row.type === 'invoice' ? 'Invoice' : row.type === 'payment' ? 'Payment' : 'Credit Note'
        const badgeClass = row.type === 'invoice'
          ? 'bg-indigo-50 text-indigo-700'
          : row.type === 'payment'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-amber-50 text-amber-700'
        return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${badgeClass}`}>{label}</span>
      },
    },
    {
      id: 'number',
      header: 'No.',
      accessorKey: 'number',
      size: 140,
      render: (value, row) => (
        <span>{value ?? '—'}{row.appliedToInvoiceNumber ? ` (${row.appliedToInvoiceNumber})` : ''}</span>
      ),
    },
    { id: 'description', header: 'Description', accessorKey: 'description', size: 260 },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      size: 140,
      align: 'right',
      render: (_value, row) => (
        <span className={row.amount < 0 ? 'text-red-600' : 'text-slate-900'}>{fmt(row.amount)}</span>
      ),
    },
    {
      id: 'runningBalance',
      header: 'Balance',
      accessorKey: 'runningBalance',
      size: 140,
      align: 'right',
      render: (_value, row) => (
        <span className="font-semibold">{fmt(row.runningBalance)}</span>
      ),
    },
  ], [fmt])

  const statementCards = [
    { label: 'Total Invoiced', amount: summary.invoices },
    { label: 'Total Payments', amount: summary.payments },
    { label: 'Total Credits', amount: summary.credits },
    { label: 'Net Balance', amount: summary.net },
  ]

  const exportCsv = useCallback(() => {
    if (!statementLines.length) {
      toast.error('No statement data available to export')
      return
    }
    const headers = ['Date', 'Type', 'Number', 'Description', 'Amount', 'Running Balance']
    const rows = statementLines.map((line) => [
      line.date,
      line.type,
      line.number ?? '',
      line.description,
      line.amount.toFixed(2),
      line.runningBalance.toFixed(2),
    ])
    const csv = [headers, ...rows]
      .map((line) => line.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `customer-statement-${selectedCustomerId}-${asOfDate}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [selectedCustomerId, asOfDate, statementLines, toast])

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
          <div className="min-h-[320px] rounded-xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center text-slate-500">
            <p className="text-lg font-semibold text-slate-900">Select a customer to view their statement</p>
            <p className="mt-2 text-sm">Select a customer to view their transaction statement.</p>
          </div>
        ) : (
          <>
            {statement ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Statement for {statement.customerName} as of {statement.asOf}
                </h2>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {statementCards.map((card) => (
                <div key={card.label} className="rounded-xl border px-5 py-5 shadow-sm bg-slate-50">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">{card.label}</p>
                  <p className="mt-3 text-2xl font-bold">{fmt(card.amount)}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <HaypDataTable
                data={statementLines}
                columns={columns}
                tableId="customer-statements-details"
                loading={loading}
                emptyTitle="No statement data"
                emptySubtitle="This customer has no statement details for the selected date."
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

