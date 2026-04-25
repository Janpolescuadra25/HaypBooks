'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import ResizableTable, { type Column as ResizableColumn } from '@/components/shared/ResizableTable'
import ExpenseActivityWidget from './ExpenseActivityWidget'

interface Reimbursement {
  id: string
  reimbursementNumber?: string
  employeeName?: string
  submittedAt?: string
  totalAmount: number
  status?: string
}

type SortKey = 'reimbursementNumber' | 'employeeName' | 'submittedAt' | 'totalAmount' | 'status'

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
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const pageSize = 25

  useEffect(() => {
    if (!companyId) return
    setLoading(true)
    expensesService.listReimbursements(companyId, { limit: 100 })
      .then((res) => {
        interface RawReimbursement { id?: unknown; reimbursementNumber?: unknown; employeeName?: unknown; submittedAt?: unknown; totalAmount?: unknown; status?: unknown }
        setReimbursements((res.data || []).map((item: RawReimbursement) => ({
          id: String(item.id ?? ''),
          reimbursementNumber: String(item.reimbursementNumber ?? item.id ?? ''),
          employeeName: item.employeeName as string | undefined,
          submittedAt: item.submittedAt as string | undefined,
          totalAmount: Number(item.totalAmount ?? 0),
          status: item.status as string | undefined,
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
    expensesService.listReimbursements(companyId, { limit: 100 })
      .then((res) => {
        interface RawReimbursement2 { id?: unknown; reimbursementNumber?: unknown; employeeName?: unknown; submittedAt?: unknown; totalAmount?: unknown; status?: unknown }
        setReimbursements((res.data || []).map((item: RawReimbursement2) => ({
          id: String(item.id ?? ''),
          reimbursementNumber: String(item.reimbursementNumber ?? item.id ?? ''),
          employeeName: item.employeeName as string | undefined,
          submittedAt: item.submittedAt as string | undefined,
          totalAmount: Number(item.totalAmount ?? 0),
          status: item.status as string | undefined,
        })))
      })
      .catch(() => showToast('Failed to load reimbursements'))
      .finally(() => setLoading(false))
  }

  const openNewReimbursement = () => {
    router.push('/expenses/employee-expenses/reimbursements/new')
  }

  const openEditReimbursement = (id: string) => {
    router.push(`/expenses/employee-expenses/reimbursements/${id}/edit`)
  }

  const fmt = (amount: number) => formatCurrency(amount, currency)

  const columns: ResizableColumn<Reimbursement>[] = [
    { key: 'reimbursementNumber', header: 'Reimbursement', width: 180, sortable: true, render: (_value, row) => <span className="font-semibold text-slate-900">{row.reimbursementNumber ?? '—'}</span> },
    { key: 'employeeName', header: 'Employee', width: 180, sortable: true, render: (_value, row) => <span className="text-slate-700">{row.employeeName ?? '—'}</span> },
    { key: 'submittedAt', header: 'Submitted', width: 140, sortable: true, render: (_value, row) => <span className="text-slate-500">{fmtDate(row.submittedAt)}</span> },
    { key: 'totalAmount', header: 'Total', width: 120, sortable: true, align: 'right', render: (_value, row) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(row.totalAmount)}</span> },
    { key: 'status', header: 'Status', width: 120, sortable: true, render: (_value, row) => <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{row.status ?? 'PENDING'}</span> },
  ]

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

      <ResizableTable
        columns={columns}
        data={pageItems}
        onSort={toggleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        emptyMessage={loading ? 'Loading reimbursements…' : 'No reimbursements found'}
        onRowClick={(row) => openEditReimbursement(row.id)}
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{filtered.length} reimbursements</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">Next</button>
        </div>
      </div>

      <div className="mt-6">
        <ExpenseActivityWidget tableName="Reimbursement" entityLabel="Reimbursements" pageSize={8} />
      </div>

      {toast && <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
    </div>
  )
}
