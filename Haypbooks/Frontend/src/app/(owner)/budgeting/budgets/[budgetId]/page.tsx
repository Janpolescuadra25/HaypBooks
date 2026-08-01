'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Pencil, X, Check, Copy, Trash2, Plus, RefreshCw, BarChart3, FileText } from 'lucide-react'
import AccountSelect from '@/components/accounting/AccountSelect'
import apiClient from '@/lib/api-client'
import { budgetService, type BudgetDetail, type BudgetLine, type BudgetStatus } from '@/services/budget.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const formatMonth = (month: number | null) =>
  month === null ? 'Annual' : MONTH_LABELS[month - 1] ?? 'Annual'

const SCENARIO_STYLES: Record<string, string> = {
  ACTUAL: 'bg-blue-100 text-blue-700',
  BUDGET: 'bg-emerald-100 text-emerald-700',
  FORECAST: 'bg-amber-100 text-amber-700',
  WHAT_IF: 'bg-purple-100 text-purple-700',
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  LOCKED: 'bg-orange-100 text-orange-700',
}

export default function BudgetDetailPage() {
  const params = useParams<{ budgetId: string }>()
  const router = useRouter()
  const toast = useToast()
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [budget, setBudget] = useState<BudgetDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [editStatus, setEditStatus] = useState<"DRAFT" | "APPROVED" | "LOCKED">('DRAFT')
  const [saving, setSaving] = useState(false)

  const [accounts, setAccounts] = useState<{ id: string; code: string; name: string }[]>([])
  const [addingLine, setAddingLine] = useState(false)
  const [editingLineId, setEditingLineId] = useState<string | null>(null)
  const [lineForm, setLineForm] = useState({ accountId: '', month: null as number | null, amount: 0 })

  const fetchBudget = useCallback(async () => {
    if (!companyId || !params?.budgetId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await budgetService.getById(companyId, params.budgetId)
      setBudget(Array.isArray(data) ? data[0] : data)
    } catch (err) {
      console.error(err)
      setError('Budget not found')
    } finally {
      setLoading(false)
    }
  }, [companyId, params?.budgetId])

  useEffect(() => {
    fetchBudget()
  }, [fetchBudget])

  useEffect(() => {
    if (!companyId) return
    apiClient.get(`/companies/${companyId}/accounting/accounts`)
      .then(({ data }) => setAccounts(Array.isArray(data) ? data : data?.accounts ?? []))
      .catch(() => {})
  }, [companyId])

  useEffect(() => {
    if (!companyLoading && !companyId) setLoading(false)
  }, [companyLoading, companyId])

  const startEdit = () => {
    if (!budget) return
    setEditName(budget.name)
    setEditStatus(budget.status)
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
  }

  const saveEdit = async () => {
    if (!companyId || !budget) return
    setSaving(true)
    try {
      await budgetService.update(companyId, budget.id, { name: editName, status: editStatus })
      toast.success('Budget updated')
      setEditMode(false)
      fetchBudget()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update budget')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    if (!companyId || !budget) return
    const yearStr = prompt(`Copy "${budget.name}" to fiscal year:`, String(budget.fiscalYear + 1))
    if (!yearStr) return
    const fiscalYear = parseInt(yearStr, 10)
    if (Number.isNaN(fiscalYear)) {
      toast.error('Invalid fiscal year')
      return
    }

    try {
      await budgetService.copy(companyId, budget.id, fiscalYear)
      toast.success('Budget duplicated successfully')
      router.push('/budgeting/budgets')
    } catch (err) {
      console.error(err)
      toast.error('Failed to copy budget')
    }
  }

  const handleDelete = async () => {
    if (!companyId || !budget) return
    const confirmed = confirm('Are you sure you want to delete this budget? This action cannot be undone.')
    if (!confirmed) return

    try {
      await budgetService.delete(companyId, budget.id)
      toast.success('Budget deleted')
      router.push('/budgeting/budgets')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete budget')
    }
  }

  const startAddLine = () => {
    setLineForm({ accountId: '', month: null, amount: 0 })
    setAddingLine(true)
    setEditingLineId(null)
  }

  const cancelLineForm = () => {
    setAddingLine(false)
    setEditingLineId(null)
  }

  const handleSaveNewLine = async () => {
    if (!companyId || !budget) return
    if (!lineForm.accountId || lineForm.amount <= 0) {
      toast.error('Account and amount are required')
      return
    }

    try {
      await budgetService.addLine(companyId, budget.id, {
        accountId: lineForm.accountId,
        month: lineForm.month,
        amount: lineForm.amount,
      })
      toast.success('Line added')
      setAddingLine(false)
      fetchBudget()
    } catch (err) {
      console.error(err)
      toast.error('Failed to add line')
    }
  }

  const startEditLine = (line: BudgetLine) => {
    setLineForm({ accountId: line.accountId ?? '', month: line.month, amount: Number(line.amount) })
    setEditingLineId(line.id)
    setAddingLine(false)
  }

  const handleSaveEditLine = async () => {
    if (!companyId || !budget || !editingLineId) return
    if (!lineForm.accountId || lineForm.amount <= 0) {
      toast.error('Account and amount are required')
      return
    }

    try {
      await budgetService.updateLine(companyId, budget.id, editingLineId, {
        accountId: lineForm.accountId,
        month: lineForm.month,
        amount: lineForm.amount,
      })
      toast.success('Line updated')
      setEditingLineId(null)
      fetchBudget()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update line')
    }
  }

  const handleDeleteLine = async (lineId: string) => {
    if (!companyId || !budget) return
    const confirmed = confirm('Delete this budget line?')
    if (!confirmed) return

    try {
      await budgetService.deleteLine(companyId, budget.id, lineId)
      toast.success('Line deleted')
      fetchBudget()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete line')
    }
  }

  const lineFormField = (field: 'accountId' | 'month' | 'amount', value: string | number | null) =>
    setLineForm(prev => ({ ...prev, [field]: value }))

  const totalAmount = useMemo(
    () => Number(budget?.totalAmount ?? 0),
    [budget],
  )

  if (companyLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
      </div>
    )
  }

  if (!companyId) {
    return (
      <div className="p-6 text-center text-red-600">
        Please select or create a company to view this budget.
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.push('/budgeting/budgets')}
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to Budgets
        </button>
      </div>
    )
  }

  if (!budget) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/budgeting/budgets')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{budget.name}</h1>
              <p className="text-sm text-slate-500">Budget details and line management</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editMode ? (
              <>
                <button
                  onClick={cancelEdit}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={saveEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check size={16} /> Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push(`/budgeting/budgets/${budget!.id}/vs-actual`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  <BarChart3 size={16} /> View vs Actual
                </button>
                <button
                  onClick={startEdit}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Copy size={16} /> Copy
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Budget Name</p>
                {editMode ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  />
                ) : (
                  <p className="text-lg font-semibold text-slate-900">{budget.name}</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                {editMode ? (
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as BudgetStatus)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="LOCKED">LOCKED</option>
                  </select>
                ) : (
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[budget.status]}`}>
                    {budget.status}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scenario</p>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${SCENARIO_STYLES[budget.scenario]}`}>
                  {budget.scenario}
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fiscal Year</p>
                <p className="text-sm font-semibold text-slate-900">FY {budget.fiscalYear}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Amount</p>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(totalAmount, currency)}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created</p>
                <p className="text-sm text-slate-700">{new Date(budget.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Budget Lines</h2>
                <p className="text-sm text-slate-500">Manage budget line items for this plan.</p>
              </div>
              <button
                onClick={startAddLine}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Plus size={16} /> Add Line
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50/80">
                  <tr className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.lines.map((line) => {
                    const isEditing = editingLineId === line.id
                    return (
                      <tr key={line.id} className="border-t border-slate-100 bg-white">
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <AccountSelect
                              value={lineForm.accountId}
                              accounts={accounts}
                              onChange={(value) => lineFormField('accountId', value)}
                            />
                          ) : (
                            <span className="text-slate-700">
                              {line.account ? `${line.account.code} – ${line.account.name}` : '—'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={lineForm.month === null ? '' : String(lineForm.month)}
                              onChange={(e) => lineFormField('month', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                            >
                              <option value="">Annual</option>
                              {MONTH_LABELS.map((label, index) => (
                                <option key={index} value={String(index + 1)}>{label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-700">{formatMonth(line.month)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={lineForm.amount || ''}
                              onChange={(e) => lineFormField('amount', parseFloat(e.target.value) || 0)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                            />
                          ) : (
                            <span className="text-slate-700">{formatCurrency(Number(line.amount), currency)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={handleSaveEditLine}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                  aria-label="Save line"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={cancelLineForm}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                                  aria-label="Cancel edit"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditLine(line)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                                  aria-label="Edit line"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLine(line.id)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                                  aria-label="Delete line"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {!addingLine && budget.lines.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-slate-400">
                        <FileText className="mx-auto h-8 w-8 mb-2 text-slate-300" />
                        <p className="text-sm">No budget lines yet</p>
                        <p className="text-xs mt-1">Click "Add Line" to create your first budget entry</p>
                      </td>
                    </tr>
                  )}

                  {addingLine && (
                    <tr className="border-t border-slate-100 bg-slate-50">
                      <td className="px-4 py-3">
                        <AccountSelect
                          value={lineForm.accountId}
                          accounts={accounts}
                          onChange={(value) => lineFormField('accountId', value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lineForm.month === null ? '' : String(lineForm.month)}
                          onChange={(e) => lineFormField('month', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                        >
                          <option value="">Annual</option>
                          {MONTH_LABELS.map((label, index) => (
                            <option key={index} value={String(index + 1)}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={lineForm.amount || ''}
                          onChange={(e) => lineFormField('amount', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            onClick={handleSaveNewLine}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            aria-label="Save line"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelLineForm}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                            aria-label="Cancel add"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">Total</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{formatCurrency(totalAmount, currency)}</td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
