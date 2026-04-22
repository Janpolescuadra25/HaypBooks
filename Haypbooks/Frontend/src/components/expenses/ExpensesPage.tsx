'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, CheckSquare, Square, Eye, Send } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'

interface ExpenseReport {
  id: string
  expenseNumber?: string
  employeeName?: string
  description?: string
  status?: string
  totalAmount: number
  submittedAt?: string
}

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
        setReports((res.data || []).map((item: any) => ({
          id: item.id,
          expenseNumber: item.expenseNumber,
          employeeName: item.employeeName,
          description: item.description,
          status: item.status,
          totalAmount: Number(item.totalAmount ?? 0),
          submittedAt: item.submittedAt,
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage])

  const handleRefresh = () => {
    if (!companyId) return
    setLoading(true)
    expensesService.listExpenseReports(companyId, { limit: 100 })
      .then((res) => {
        setReports((res.data || []).map((item: any) => ({
          id: item.id,
          expenseNumber: item.expenseNumber,
          employeeName: item.employeeName,
          description: item.description,
          status: item.status,
          totalAmount: Number(item.totalAmount ?? 0),
          submittedAt: item.submittedAt,
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

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3">Expense</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-16 text-center text-sm text-slate-500">Loading expense reports…</td></tr>
            ) : pageItems.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-16 text-center text-sm text-slate-500">No expense reports found</td></tr>
            ) : (
              pageItems.map((report) => (
                <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => router.push(`/expenses/${report.id}/edit`)}>
                  <td className="px-4 py-4 font-semibold text-slate-900">{report.expenseNumber ?? '—'}</td>
                  <td className="px-4 py-4 text-slate-700">{report.employeeName ?? '—'}</td>
                  <td className="px-4 py-4 text-slate-500">{fmtDate(report.submittedAt)}</td>
                  <td className="px-4 py-4"><span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{report.status ?? 'DRAFT'}</span></td>
                  <td className="px-4 py-4 text-right font-semibold text-emerald-800">{fmt(report.totalAmount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{filtered.length} expense reports</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">Next</button>
        </div>
      </div>

      {toast && <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
    </div>
  )
}
