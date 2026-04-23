'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'

interface Reimbursement {
  id: string
  reimbursementNumber?: string
  employeeName?: string
  submittedAt?: string
  totalAmount: number
  status?: string
}

const STATUSES = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REIMBURSED', 'REJECTED']

function fmtDate(dateString?: string) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ReimbursementsPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const pageSize = 25

  useEffect(() => {
    if (!companyId) return
    setLoading(true)
    expensesService.listReimbursements(companyId, { limit: 100 })
      .then((res) => {
        setReimbursements((res.data || []).map((item: any) => ({
          id: item.id,
          reimbursementNumber: item.reimbursementNumber ?? item.id,
          employeeName: item.employeeName,
          submittedAt: item.submittedAt,
          totalAmount: Number(item.totalAmount ?? 0),
          status: item.status,
        })))
      })
      .catch(() => setToast('Failed to load reimbursements'))
      .finally(() => setLoading(false))
  }, [companyId])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3000)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return reimbursements
      .filter((item) => statusFilter === 'ALL' || item.status === statusFilter)
      .filter((item) =>
        item.reimbursementNumber?.toLowerCase().includes(q) ||
        item.employeeName?.toLowerCase().includes(q),
      )
  }, [reimbursements, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage])

  const handleRefresh = () => {
    if (!companyId) return
    setLoading(true)
    expensesService.listReimbursements(companyId, { limit: 100 })
      .then((res) => {
        setReimbursements((res.data || []).map((item: any) => ({
          id: item.id,
          reimbursementNumber: item.reimbursementNumber ?? item.id,
          employeeName: item.employeeName,
          submittedAt: item.submittedAt,
          totalAmount: Number(item.totalAmount ?? 0),
          status: item.status,
        })))
      })
      .catch(() => showToast('Failed to load reimbursements'))
      .finally(() => setLoading(false))
  }

  const openNewReimbursement = () => {
    router.push('/expenses/expense-capture/reimbursements/new')
  }

  const openEditReimbursement = (id: string) => {
    router.push(`/expenses/expense-capture/reimbursements/${id}/edit`)
  }

  const fmt = (amount: number) => formatCurrency(amount, currency)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Reimbursements</h1>
          <p className="mt-2 text-sm text-slate-600">Manage employee reimbursements and payments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download size={16} /> Refresh</button>
          <button onClick={openNewReimbursement} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> New Reimbursement</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-emerald-100 p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="Search reimbursements" />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <button key={status} onClick={() => { setStatusFilter(status); setCurrentPage(1) }} className={`rounded-2xl px-3 py-2 text-xs font-semibold ${statusFilter === status ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3">Reimbursement</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-16 text-center text-sm text-slate-500">Loading reimbursements…</td></tr>
            ) : pageItems.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-16 text-center text-sm text-slate-500">No reimbursements found</td></tr>
            ) : (
              pageItems.map((item) => (
                <tr key={item.id} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50" onClick={() => openEditReimbursement(item.id)}>
                  <td className="px-4 py-4 font-semibold text-slate-900">{item.reimbursementNumber ?? '—'}</td>
                  <td className="px-4 py-4 text-slate-700">{item.employeeName ?? '—'}</td>
                  <td className="px-4 py-4 text-slate-500">{fmtDate(item.submittedAt)}</td>
                  <td className="px-4 py-4 text-right font-semibold text-emerald-800">{fmt(item.totalAmount)}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.status ?? 'PENDING'}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{filtered.length} reimbursements</span>
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
