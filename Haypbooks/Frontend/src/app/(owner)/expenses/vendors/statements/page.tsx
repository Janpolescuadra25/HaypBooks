'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { expensesService } from '@/services/expenses.service'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import HaypSelect from '@/components/shared/HaypSelect'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn } from '@/components/shared/HaypDataTable.types'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/ui/badge'

interface VendorOption {
  id: string
  name: string
}

interface StatementLine {
  id: string
  date: string
  type: string
  description: string
  number?: string
  dueDate?: string
  amount: number
  runningBalance: number
}

const STATEMENT_TYPES = [
  { value: 'transaction', label: 'Transaction' },
  { value: 'balance-forward', label: 'Balance Forward' },
  { value: 'open-item', label: 'Open Item' },
]

export default function Page() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [vendors, setVendors] = useState<VendorOption[]>([])
  const [statementRows, setStatementRows] = useState<StatementLine[]>([])
  const [summary, setSummary] = useState({ bills: 0, payments: 0, credits: 0, net: 0 })
  const [selectedVendor, setSelectedVendor] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10))
  const [startDate, setStartDate] = useState('')
  const [statementType, setStatementType] = useState('transaction')
  const [loading, setLoading] = useState(true)
  const [statementLoading, setStatementLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchVendors = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await expensesService.listVendors(companyId)
      const data = res.data ?? res
      const list = Array.isArray(data) ? data : data.vendors ?? []
      setVendors(list.map((vendor: any) => ({ id: vendor.id, name: vendor.name })))
    } catch {
      setError('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  const fetchStatement = useCallback(async () => {
    if (!companyId || !selectedVendor) return
    setStatementLoading(true)
    setError('')
    try {
      const res = await expensesService.getVendorStatement(companyId, selectedVendor, {
        asOf,
        start: startDate || undefined,
        type: statementType,
      })
      const data = res.data ?? res
      setVendorName(data.vendorName ?? '')
      setStatementRows(Array.isArray(data.lines) ? data.lines : data.statement?.lines ?? [])
      setSummary({
        bills: Number(data.totals?.bills ?? 0),
        payments: Number(data.totals?.payments ?? 0),
        credits: Number(data.totals?.credits ?? 0),
        net: Number(data.totals?.net ?? 0),
      })
    } catch {
      setError('Failed to load vendor statement')
      setStatementRows([])
      setSummary({ bills: 0, payments: 0, credits: 0, net: 0 })
    } finally {
      setStatementLoading(false)
    }
  }, [companyId, selectedVendor, asOf, startDate, statementType])

  useEffect(() => { fetchVendors() }, [fetchVendors])

  const columns: HaypColumn<StatementLine>[] = useMemo(() => [
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      size: 120,
      minSize: 90,
      render: (value) => <span className="text-sm text-slate-700">{value || '—'}</span>,
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      size: 150,
      minSize: 90,
      render: (value) => {
        const label = value === 'bill' ? 'Bill' : value === 'payment' ? 'Payment' : value === 'vendor_credit' ? 'Vendor Credit' : value === 'balance_forward' ? 'Balance Forward' : value
        return <Badge className="capitalize text-[10px] px-2 py-0 h-5 border-none font-bold tracking-tight bg-slate-100 text-slate-700">{label}</Badge>
      },
    },
    {
      id: 'description',
      header: 'Description',
      accessorKey: 'description',
      size: 260,
      minSize: 120,
      render: (value) => <span className="text-sm text-slate-700 truncate block max-w-[280px]">{value || '—'}</span>,
    },
    {
      id: 'number',
      header: 'Number',
      accessorKey: 'number',
      size: 130,
      minSize: 90,
      render: (value) => <span className="text-sm text-slate-700">{value || '—'}</span>,
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      accessorKey: 'dueDate',
      size: 120,
      minSize: 90,
      render: (value) => <span className="text-sm text-slate-700">{value || '—'}</span>,
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      size: 140,
      minSize: 90,
      align: 'right',
      render: (value) => (
        <div className="text-right font-mono font-medium text-xs text-slate-900 tabular-nums">
          {formatCurrency(Number(value ?? 0), currency)}
        </div>
      ),
    },
    {
      id: 'runningBalance',
      header: 'Balance',
      accessorKey: 'runningBalance',
      size: 150,
      minSize: 90,
      align: 'right',
      render: (value) => (
        <div className="text-right font-mono font-medium text-xs text-slate-900 tabular-nums">
          {formatCurrency(Number(value ?? 0), currency)}
        </div>
      ),
    },
  ], [currency])

  const vendorOptions = useMemo(() => [
    { value: '', label: 'Select vendor' },
    ...vendors.map((vendor) => ({ value: vendor.id, label: vendor.name })),
  ], [vendors])

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible px-4 py-6">
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,560px)_minmax(0,360px)]">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Vendor Statements</h1>
                  <p className="text-sm text-slate-500">Generate a statement view of vendor bills, payments, and credits.</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{vendorName || 'Vendor not selected'}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">Vendor</label>
                  <HaypSelect
                    value={selectedVendor}
                    onChange={setSelectedVendor}
                    options={vendorOptions}
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">Statement Type</label>
                  <HaypSelect
                    value={statementType}
                    onChange={setStatementType}
                    options={STATEMENT_TYPES}
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="statementAsOf" className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">As Of</label>
                  <input
                    id="statementAsOf"
                    type="date"
                    value={asOf}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => setAsOf(event.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="statementStartDate" className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">Start Date</label>
                  <input
                    id="statementStartDate"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={fetchStatement}
                  disabled={!selectedVendor || statementLoading}
                  className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {statementLoading ? 'Loading…' : 'Run Statement'}
                </button>
                {error && <p className="text-sm text-rose-600">{error}</p>}
              </div>
            </div>
            <div className="grid gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Statement Summary</p>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Bills</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(summary.bills, currency)}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Payments</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(summary.payments, currency)}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Credits</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(summary.credits, currency)}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Net</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(summary.net, currency)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <HaypDataTable
              data={statementRows}
              columns={columns}
              tableId="vendor-statements"
              title="Statement Lines"
              description="Review the selected vendor statement activity."
              loading={statementLoading || cidLoading || loading}
              emptyTitle={selectedVendor ? 'No statement lines found' : 'Select a vendor to load a statement'}
              emptySubtitle={selectedVendor ? 'Try a different date range or statement type.' : 'Choose a vendor and click Run Statement.'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
