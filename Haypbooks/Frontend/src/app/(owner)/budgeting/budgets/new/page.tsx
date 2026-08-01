'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, RefreshCw } from 'lucide-react'
import AccountSelect from '@/components/accounting/AccountSelect'
import apiClient from '@/lib/api-client'
import { budgetService } from '@/services/budget.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

interface NewLine {
  accountId: string
  month: number | null
  amount: number
}

const EMPTY_LINE: NewLine = { accountId: '', month: null, amount: 0 }

export default function NewBudgetPage() {
  const router = useRouter()
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const toast = useToast()

  const [name, setName] = useState('')
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear() + 1)
  const [lines, setLines] = useState<NewLine[]>([EMPTY_LINE])
  const [accounts, setAccounts] = useState<{ id: string; code: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) return
    apiClient.get(`/companies/${companyId}/accounting/accounts`)
      .then(({ data }) => setAccounts(Array.isArray(data) ? data : data?.accounts ?? []))
      .catch(() => {})
  }, [companyId])

  useEffect(() => {
    if (!companyLoading && !companyId) {
      setError('Please select or create a company first.')
    }
  }, [companyLoading, companyId])

  const addLine = () => setLines(prev => [...prev, { ...EMPTY_LINE }])
  const removeLine = (idx: number) => setLines(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev)
  const updateLine = (idx: number, field: keyof NewLine, value: string | number | null) =>
    setLines(prev => prev.map((line, i) => i !== idx ? line : { ...line, [field]: value }))

  const totalAmount = useMemo(() => lines.reduce((sum, line) => sum + (line.amount || 0), 0), [lines])

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Budget name is required')
      return
    }
    if (!companyId) return

    setSaving(true)
    setError(null)

    try {
      const validLines = lines
        .filter(line => line.accountId && line.amount > 0)
        .map(line => ({ accountId: line.accountId, month: line.month, amount: line.amount }))

      const { data } = await budgetService.create(companyId, {
        name: name.trim(),
        fiscalYear,
        lines: validLines.length > 0 ? validLines : undefined,
      })

      toast.success('Budget created successfully')
      router.push(`/budgeting/budgets/${data.id}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create budget')
    } finally {
      setSaving(false)
    }
  }

  if (!companyLoading && !companyId) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-700">Please select or create a company before creating a budget.</p>
          {companyError && <p className="mt-2 text-xs text-red-500">{companyError}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
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
              <h1 className="text-2xl font-bold text-slate-900">New Budget</h1>
              <p className="text-sm text-slate-500">Create a new budget with optional budget lines.</p>
            </div>
          </div>
          <button
            disabled={saving}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Plus size={16} /> Create Budget
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Budget Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter budget name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Fiscal Year</label>
                <input
                  type="number"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Budget Lines</h2>
                <p className="text-sm text-slate-500">Add optional lines to this budget.</p>
              </div>
              <button
                type="button"
                onClick={addLine}
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
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index} className="border-t border-slate-100 bg-white">
                      <td className="px-4 py-3">
                        <AccountSelect
                          value={line.accountId}
                          accounts={accounts}
                          onChange={(value) => updateLine(index, 'accountId', value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={line.month === null ? '' : String(line.month)}
                          onChange={(e) => updateLine(index, 'month', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                        >
                          <option value="">Annual</option>
                          {MONTH_LABELS.map((label, monthIndex) => (
                            <option key={monthIndex} value={String(monthIndex + 1)}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.amount || ''}
                          onChange={(e) => updateLine(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                          aria-label="Remove line"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">Total</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white py-4 px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.push('/budgeting/budgets')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
            Create Budget
          </button>
        </div>
      </div>
    </div>
  )
}
