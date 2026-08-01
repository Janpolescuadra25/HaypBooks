'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Copy, Trash2, Plus, FileText, RefreshCw } from 'lucide-react'
import { budgetService, type Budget } from '@/services/budget.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'

const scenarioClasses: Record<string, string> = {
  ACTUAL: 'bg-blue-100 text-blue-700',
  BUDGET: 'bg-emerald-100 text-emerald-700',
  FORECAST: 'bg-amber-100 text-amber-700',
  WHAT_IF: 'bg-purple-100 text-purple-700',
}

const statusClasses: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  LOCKED: 'bg-orange-100 text-orange-700',
}

export default function BudgetListPage() {
  const router = useRouter()
  const toast = useToast()
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const response = await budgetService.list(companyId)
      setBudgets(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error(err)
      setError('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  useEffect(() => {
    if (!companyLoading && !companyId) setLoading(false)
  }, [companyLoading, companyId])

  const handleView = (budgetId: string) => {
    router.push(`/budgeting/budgets/${budgetId}`)
  }

  const handleCopy = async (budget: Budget) => {
    if (!companyId) return
    const defaultYear = new Date().getFullYear() + 1
    const yearStr = prompt(`Copy "${budget.name}" to fiscal year:`, String(defaultYear))
    if (!yearStr) return
    const fiscalYear = parseInt(yearStr, 10)
    if (Number.isNaN(fiscalYear)) {
      toast.error('Invalid fiscal year')
      return
    }

    try {
      await budgetService.copy(companyId, budget.id, fiscalYear)
      toast.success('Budget duplicated successfully')
      fetchBudgets()
    } catch (err) {
      console.error(err)
      toast.error('Failed to copy budget')
    }
  }

  const handleDelete = async (budget: Budget) => {
    if (!companyId) return
    const confirmed = confirm('Are you sure you want to delete this budget? This action cannot be undone.')
    if (!confirmed) return

    try {
      await budgetService.delete(companyId, budget.id)
      toast.success('Budget deleted')
      fetchBudgets()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete budget')
    }
  }

  const handleNewBudget = () => {
    router.push('/budgeting/budgets/new')
  }

  const renderBody = () => {
    if (companyError) {
      return (
        <div className="px-4 py-16 text-center">
          <p className="text-sm font-semibold text-slate-900">{companyError}</p>
          <p className="mt-2 text-sm text-slate-500">Please select a company to continue.</p>
        </div>
      )
    }

    if (loading) {
      return (
        <tr>
          <td colSpan={7} className="px-4 py-16 text-center">
            <RefreshCw size={24} className="text-slate-300 mx-auto mb-2 animate-spin" />
            <p className="text-sm text-slate-400">Loading budgets…</p>
          </td>
        </tr>
      )
    }

    if (error) {
      return (
        <tr>
          <td colSpan={7} className="px-4 py-16 text-center">
            <p className="text-sm font-semibold text-slate-900">{error}</p>
            <button
              onClick={fetchBudgets}
              className="mt-3 inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Retry
            </button>
          </td>
        </tr>
      )
    }

    if (budgets.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="px-4 py-16 text-center">
            <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-slate-500">
              <FileText size={36} className="text-slate-300" />
              <p className="text-lg font-semibold text-slate-900">No budgets yet</p>
              <p className="text-sm">Create your first budget plan to track spending and forecast future periods.</p>
              <button
                onClick={handleNewBudget}
                className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                New Budget
              </button>
            </div>
          </td>
        </tr>
      )
    }

    return budgets.map((budget) => {
      const amount = Number(budget.totalAmount ?? 0)
      return (
        <tr key={budget.id} className="hover:bg-slate-50 transition-colors even:bg-slate-50/60">
          <td className="px-4 py-3 text-sm text-slate-700">{budget.name}</td>
          <td className="px-4 py-3 text-sm">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${scenarioClasses[budget.scenario] ?? 'bg-slate-100 text-slate-600'}`}>
              {budget.scenario}
            </span>
          </td>
          <td className="px-4 py-3 text-sm">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[budget.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {budget.status}
            </span>
          </td>
          <td className="px-4 py-3 text-sm text-slate-700">FY {budget.fiscalYear}</td>
          <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(amount, currency)}</td>
          <td className="px-4 py-3 text-sm text-slate-700">{budget._count?.lines ?? 0}</td>
          <td className="px-4 py-3 text-right text-slate-700">
            <div className="inline-flex items-center gap-1">
              <button
                onClick={() => handleView(budget.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="View budget"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleCopy(budget)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Copy budget"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => handleDelete(budget)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Delete budget"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and track your budget plans</p>
        </div>
        <button
          onClick={handleNewBudget}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} className="mr-2" /> New Budget
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50/80">
            <tr className="sticky top-0 z-10 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Budget Name</th>
              <th className="px-4 py-3">Scenario</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Fiscal Year</th>
              <th className="px-4 py-3">Total Amount</th>
              <th className="px-4 py-3">Lines</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderBody()}
          </tbody>
        </table>
      </div>
    </div>
  )
}
