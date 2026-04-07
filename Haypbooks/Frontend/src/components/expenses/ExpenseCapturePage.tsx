'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

type Tab = 'expenses' | 'receipts' | 'mileage' | 'reimbursements'

type ExpenseRow = {
  id: string
  date: string
  employee: string
  category: string
  description: string
  amount: number
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid'
}

type ReceiptRow = {
  id: string
  date: string
  merchant: string
  category: string
  amount: number
  employee: string
  status: 'Unmatched' | 'Matched' | 'Pending'
}

type MileageRow = {
  id: string
  date: string
  employee: string
  purpose: string
  miles: number
  ratePerMile: number
  amount: number
  status: 'Pending' | 'Approved' | 'Paid'
}

type ReimbursementRow = {
  id: string
  employee: string
  submittedDate: string
  description: string
  totalAmount: number
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected'
  paymentMethod: string
}

const TAB_LABELS: { id: Tab; label: string }[] = [
  { id: 'expenses', label: 'Expenses' },
  { id: 'receipts', label: 'Receipts' },
  { id: 'mileage', label: 'Mileage' },
  { id: 'reimbursements', label: 'Reimbursements' },
]

const EXPENSE_STATUS: Record<string, string> = {
  Draft: 'bg-gray-50 text-gray-600 border-gray-200',
  Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-600 border-red-200',
  Paid: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Unmatched: 'bg-amber-50 text-amber-700 border-amber-200',
  Matched: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
}

interface Props {
  initialTab?: Tab
}

export default function ExpenseCapturePage({ initialTab = 'expenses' }: Props) {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [search, setSearch] = useState('')

  // Per-tab data
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [receipts, setReceipts] = useState<ReceiptRow[]>([])
  const [mileage, setMileage] = useState<MileageRow[]>([])
  const [reimbursements, setReimbursements] = useState<ReimbursementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const endpoints: Record<Tab, string> = {
        expenses: `/companies/${companyId}/expense-capture/expenses`,
        receipts: `/companies/${companyId}/expense-capture/receipts`,
        mileage: `/companies/${companyId}/expense-capture/mileage`,
        reimbursements: `/companies/${companyId}/expense-capture/reimbursements`,
      }
      const { data } = await apiClient.get(endpoints[activeTab])
      const rows = Array.isArray(data) ? data : data?.items ?? []
      if (activeTab === 'expenses') setExpenses(rows)
      else if (activeTab === 'receipts') setReceipts(rows)
      else if (activeTab === 'mileage') setMileage(rows)
      else setReimbursements(rows)
    } catch (err: any) {
      setError(err?.response?.data?.message || `Failed to load ${activeTab}`)
    } finally {
      setLoading(false)
    }
  }, [companyId, activeTab])

  useEffect(() => { fetchData() }, [fetchData])

  // Clear search on tab change
  useEffect(() => { setSearch('') }, [activeTab])

  const NEW_LABELS: Record<Tab, string> = {
    expenses: 'New Expense',
    receipts: 'Upload Receipt',
    mileage: 'Log Mileage',
    reimbursements: 'New Request',
  }

  const renderContent = () => {
    if (loading || companyLoading) {
      return <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Loading…</div>
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchData} className="text-sm text-indigo-600 hover:underline">Retry</button>
        </div>
      )
    }

    if (activeTab === 'expenses') {
      const filtered = expenses.filter((e) =>
        !search ||
        e.employee?.toLowerCase().includes(search.toLowerCase()) ||
        e.category?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase())
      )
      if (filtered.length === 0) return <EmptyState label="expenses" onClear={() => setSearch('')} hasSearch={!!search} />
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Date', 'Employee', 'Category', 'Description', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 text-slate-600">{row.date}</td>
                  <td className="px-4 py-3 text-slate-700">{row.employee}</td>
                  <td className="px-4 py-3 text-slate-600">{row.category}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{row.description}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(row.amount, currency)}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeTab === 'receipts') {
      const filtered = receipts.filter((r) =>
        !search ||
        r.merchant?.toLowerCase().includes(search.toLowerCase()) ||
        r.employee?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase())
      )
      if (filtered.length === 0) return <EmptyState label="receipts" onClear={() => setSearch('')} hasSearch={!!search} />
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Date', 'Merchant', 'Employee', 'Category', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 text-slate-600">{row.date}</td>
                  <td className="px-4 py-3 text-slate-700">{row.merchant}</td>
                  <td className="px-4 py-3 text-slate-600">{row.employee}</td>
                  <td className="px-4 py-3 text-slate-600">{row.category}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(row.amount, currency)}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeTab === 'mileage') {
      const filtered = mileage.filter((m) =>
        !search ||
        m.employee?.toLowerCase().includes(search.toLowerCase()) ||
        m.purpose?.toLowerCase().includes(search.toLowerCase())
      )
      if (filtered.length === 0) return <EmptyState label="mileage logs" onClear={() => setSearch('')} hasSearch={!!search} />
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Date', 'Employee', 'Purpose', 'Miles', 'Rate', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 text-slate-600">{row.date}</td>
                  <td className="px-4 py-3 text-slate-700">{row.employee}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{row.purpose}</td>
                  <td className="px-4 py-3 text-slate-800">{row.miles} mi</td>
                  <td className="px-4 py-3 text-slate-600">{formatCurrency(row.ratePerMile, currency)}/mi</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(row.amount, currency)}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeTab === 'reimbursements') {
      const filtered = reimbursements.filter((r) =>
        !search ||
        r.employee?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
      )
      if (filtered.length === 0) return <EmptyState label="reimbursements" onClear={() => setSearch('')} hasSearch={!!search} />
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Employee', 'Submitted', 'Description', 'Amount', 'Payment Method', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 text-slate-700">{row.employee}</td>
                  <td className="px-4 py-3 text-slate-600">{row.submittedDate}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{row.description}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(row.totalAmount, currency)}</td>
                  <td className="px-4 py-3 text-slate-600">{row.paymentMethod}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Expense Capture</h1>
            <p className="text-sm text-slate-500 mt-1">Track expenses, receipts, mileage, and reimbursements</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
              {NEW_LABELS[activeTab]}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex border-b border-slate-200 gap-0">
          {TAB_LABELS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-6 py-3">
          <input
            placeholder={`Search ${activeTab}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table content */}
      <div className="flex-1 px-6 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${EXPENSE_STATUS[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  )
}

function EmptyState({ label, onClear, hasSearch }: { label: string; onClear: () => void; hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
      <p className="text-sm">No {label} found</p>
      {hasSearch && (
        <button onClick={onClear} className="text-xs text-indigo-600 hover:underline">Clear search</button>
      )}
    </div>
  )
}
