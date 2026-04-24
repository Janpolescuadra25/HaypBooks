'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, CheckSquare, Square, Eye, Send } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import ResizableTable, { type Column as ResizableColumn } from '@/components/shared/ResizableTable'
import ExpenseActivityWidget from './ExpenseActivityWidget'

interface ExpenseReport {
  id: string
  expenseNumber?: string
  employeeName?: string
  description?: string
  status?: string
  totalAmount: number
  submittedAt?: string
}

type SortKey = 'expenseNumber' | 'employeeName' | 'submittedAt' | 'status' | 'totalAmount'

const STATUSES = ['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'PAID', 'REJECTED']

function fmtDate(dateString?: string) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ExpensesPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [reports, setReports] = useState<ExpenseReport[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const pageSize = 25

  useEffect(() => {
    if (!companyId) return
    setLoading(true)
    setError('')
    expensesService.listExpenseReports(companyId, { limit: 100 })
      .then((res) => {
        interface RawExpenseReport { id?: unknown; expenseNumber?: unknown; employeeName?: unknown; description?: unknown; status?: unknown; totalAmount?: unknown; submittedAt?: unknown }
        setReports((res.data || []).map((item: RawExpenseReport) => ({
          id: String(item.id ?? ''),
          expenseNumber: item.expenseNumber as string | undefined,
          employeeName: item.employeeName as string | undefined,
          description: item.description as string | undefined,
          status: item.status as string | undefined,
          totalAmount: Number(item.totalAmount ?? 0),
          submittedAt: item.submittedAt as string | undefined,
        })))
      })
      .catch(() => { setError('Failed to load expense reports'); setToast('Failed to load expense reports') })
      .finally(() => setLoading(false))
  }, [companyId])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3000)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return reports
      .filter((report) => statusFilter === 'ALL' || report.status === statusFilter)
      .filter((report) =>
        report.expenseNumber?.toLowerCase().includes(q) ||
        report.employeeName?.toLowerCase().includes(q) ||
        report.description?.toLowerCase().includes(q),
      )
  }, [reports, search, statusFilter])

  const sorted = useMemo(() => {
    const next = [...filtered]
    next.sort((a, b) => {
      if (sortKey === 'totalAmount') {
        const d = a.totalAmount - b.totalAmount
        return sortDir === 'asc' ? d : -d
      }
      const av = String(a[sortKey] ?? '').toLowerCase()
      const bv = String(b[sortKey] ?? '').toLowerCase()
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return next
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageItems = useMemo(() => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sorted, currentPage])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleRefresh = () => {
    if (!companyId) return
    setLoading(true)
    expensesService.listExpenseReports(companyId, { limit: 100 })
      .then((res) => {
        interface RawExpenseReport2 { id?: unknown; expenseNumber?: unknown; employeeName?: unknown; description?: unknown; status?: unknown; totalAmount?: unknown; submittedAt?: unknown }
        setReports((res.data || []).map((item: RawExpenseReport2) => ({
          id: String(item.id ?? ''),
          expenseNumber: item.expenseNumber as string | undefined,
          employeeName: item.employeeName as string | undefined,
          description: item.description as string | undefined,
          status: item.status as string | undefined,
          totalAmount: Number(item.totalAmount ?? 0),
          submittedAt: item.submittedAt as string | undefined,
        })))
      })
      .catch(() => showToast('Failed to load expense reports'))
      .finally(() => setLoading(false))
  }

  const handleNewReportSaved = () => {
    showToast('Expense report created')
    handleRefresh()
  }

  const fmt = (amount: number) => formatCurrency(amount, currency)

  const columns: ResizableColumn<ExpenseReport>[] = [
    { key: 'expenseNumber', header: 'Expense', width: 180, sortable: true, render: (_value, row) => <span className="font-semibold text-slate-900">{row.expenseNumber ?? '—'}</span> },
    { key: 'employeeName', header: 'Employee', width: 180, sortable: true, render: (_value, row) => <span className="text-slate-700">{row.employeeName ?? '—'}</span> },
    { key: 'submittedAt', header: 'Submitted', width: 140, sortable: true, render: (_value, row) => <span className="text-slate-500">{fmtDate(row.submittedAt)}</span> },
    { key: 'status', header: 'Status', width: 120, sortable: true, render: (_value, row) => <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{row.status ?? 'DRAFT'}</span> },
    { key: 'totalAmount', header: 'Total', width: 120, sortable: true, align: 'right', render: (_value, row) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(row.totalAmount)}</span> },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Expense Reports</h1>
          <p className="mt-2 text-sm text-slate-600">Create and manage employee expense reports.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => router.push('/expenses/new')} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> New Expense</button>
          <button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download size={16} /> Refresh</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        {error && <div className="col-span-full rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="Search expense reports" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <button key={status} onClick={() => { setStatusFilter(status); setCurrentPage(1) }} className={`rounded-2xl px-3 py-2 text-xs font-semibold ${statusFilter === status ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              {status === 'ALL' ? 'All' : status}
            </button>
          ))}
          <button onClick={() => { setStatusFilter('ALL'); setSearch(''); setCurrentPage(1) }} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Clear</button>
        </div>
      </div>

      <ResizableTable
        columns={columns}
        data={pageItems}
        onSort={toggleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        emptyMessage={loading ? 'Loading expense reports…' : 'No expense reports found'}
        onRowClick={(row) => router.push(`/expenses/${row.id}/edit`)}
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{filtered.length} expense reports</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">Next</button>
        </div>
      </div>

      <div className="mt-6">
        <ExpenseActivityWidget tableName="ExpenseReport" entityLabel="Expense Reports" pageSize={8} />
      </div>

      {toast && <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
    </div>
  )
}
