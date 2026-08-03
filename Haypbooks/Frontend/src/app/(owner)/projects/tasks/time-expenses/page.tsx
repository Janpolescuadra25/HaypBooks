'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Clock, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { projectsService } from '@/services/projects.service'

export default function Page() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')

  useEffect(() => {
    if (!companyId) return

    projectsService.listProjects(companyId, { status: 'ACTIVE' })
      .then((res: any) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        setProjects(data)
      })
      .catch((err: any) => setError(err?.message || 'Failed to load projects'))
  }, [companyId])

  const fetchData = useCallback(async () => {
    if (!companyId || !selectedProjectId) return

    setLoading(true)
    setError('')

    try {
      const [timeRes, expenseRes] = await Promise.all([
        projectsService.listProjectTimeEntries(companyId, selectedProjectId),
        projectsService.listProjectExpenses(companyId, selectedProjectId),
      ])

      const timeData = Array.isArray(timeRes.data) ? timeRes.data : (timeRes.data?.data ?? [])
      const expenseData = Array.isArray(expenseRes.data) ? expenseRes.data : (expenseRes.data?.data ?? [])

      setTimeEntries(timeData)
      setExpenses(expenseData)
    } catch (err: any) {
      setError(err?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedProjectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (companyLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Time & Expenses</h2>
        </div>
        <button
          type="button"
          title="Refresh"
          disabled={loading}
          onClick={() => fetchData()}
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <select
        value={selectedProjectId}
        onChange={(e) => setSelectedProjectId(e.target.value)}
        className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <option value="">Select a project...</option>
        {projects.map((project: any) => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-base font-semibold text-slate-800">
            Time Entries
            <span className="ml-2 text-sm font-normal text-slate-400">({timeEntries.length})</span>
          </h3>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Hours</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!selectedProjectId ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">Select a project to view time entries</td>
                  </tr>
                ) : timeEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">No time entries found</td>
                  </tr>
                ) : (
                  timeEntries.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-700">{item.user?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{format(new Date(item.date), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{Number(item.hours).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{item.description ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-base font-semibold text-slate-800">
            Expenses
            <span className="ml-2 text-sm font-normal text-slate-400">({expenses.length})</span>
          </h3>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Billable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!selectedProjectId ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">Select a project to view expenses</td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No expenses found</td>
                  </tr>
                ) : (
                  expenses.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-500">{format(new Date(item.date), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.description ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{item.category ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.amount != null ? formatCurrency(Number(item.amount), currency) : '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        {item.billable != null ? (
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.billable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {item.billable ? 'Yes' : 'No'}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
