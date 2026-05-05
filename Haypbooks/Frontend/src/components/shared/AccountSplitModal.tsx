'use client'

import React, { useMemo } from 'react'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import HaypModal from './HaypModal'
import { formatCurrency } from '@/lib/format'

export interface AccountSplitRow {
  id: string
  accountId: string
  departmentId?: string
  amount: number
  memo?: string
}

interface AccountOption {
  id: string
  label: string
}

interface DepartmentOption {
  id: string
  label: string
}

interface AccountSplitModalProps {
  open: boolean
  onClose: () => void
  title: string
  totalAmount: number
  splits: AccountSplitRow[]
  accounts: AccountOption[]
  departments?: DepartmentOption[]
  onChange: (splits: AccountSplitRow[]) => void
  onSave: () => void
  saving?: boolean
}

const makeSplitId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`

export default function AccountSplitModal({
  open,
  onClose,
  title,
  totalAmount,
  splits,
  accounts,
  departments,
  onChange,
  onSave,
  saving = false,
}: AccountSplitModalProps) {
  const totalAllocated = useMemo(() => splits.reduce((sum, split) => sum + Number(split.amount || 0), 0), [splits])
  const remainingAmount = useMemo(() => Number((totalAmount - totalAllocated).toFixed(2)), [totalAmount, totalAllocated])
  const canSave = splits.length > 0 && remainingAmount === 0 && splits.every((split) => split.accountId && split.amount > 0)

  const updateSplit = (id: string, field: keyof AccountSplitRow, value: string | number) => {
    onChange(splits.map((split) => {
      if (split.id !== id) return split
      return {
        ...split,
        [field]: field === 'amount' ? Number(value) : String(value),
      }
    }))
  }

  const addSplit = () => {
    onChange([...splits, { id: makeSplitId(), accountId: '', amount: 0 }])
  }

  const removeSplit = (id: string) => {
    onChange(splits.filter((split) => split.id !== id))
  }

  return (
    <HaypModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle="Split this line across multiple accounts, departments, or cost centers."
      size="lg"
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center gap-2 font-semibold text-slate-900">Posting summary</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Source amount</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(totalAmount)}</div>
            </div>
            <div className="rounded-2xl bg-white p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Allocated</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(totalAllocated)}</div>
            </div>
            <div className={`rounded-2xl p-3 ${remainingAmount === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              <div className="text-[10px] uppercase tracking-[0.2em]">Remaining</div>
              <div className="mt-2 text-lg font-semibold">{formatCurrency(remainingAmount)}</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Split allocations</h3>
              <p className="text-sm text-slate-500">Allocate the line amount across multiple GL accounts and departments.</p>
            </div>
            <button
              type="button"
              onClick={addSplit}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={16} /> Add split
            </button>
          </div>

          {splits.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Add an allocation to begin splitting this line item.
            </div>
          ) : (
            <div className="space-y-4">
              {splits.map((split) => (
                <div key={split.id} className="grid gap-4 sm:grid-cols-[1.6fr_1.2fr_1.2fr_1fr_auto] items-end rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account</label>
                    <select
                      value={split.accountId}
                      onChange={(e) => updateSplit(split.id, 'accountId', e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="">Select account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>{account.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Department</label>
                    <select
                      value={split.departmentId ?? ''}
                      onChange={(e) => updateSplit(split.id, 'departmentId', e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="">None</option>
                      {departments?.map((department) => (
                        <option key={department.id} value={department.id}>{department.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={split.amount}
                      onChange={(e) => updateSplit(split.id, 'amount', Number(e.target.value))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Memo</label>
                    <input
                      type="text"
                      value={split.memo ?? ''}
                      onChange={(e) => updateSplit(split.id, 'memo', e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSplit(split.id)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                    aria-label="Remove split"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {remainingAmount !== 0 && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-start gap-3">
            <AlertTriangle size={18} />
            <div>
              <div className="font-semibold">Allocation mismatch</div>
              <div>Adjust split amounts so the total equals {formatCurrency(totalAmount)}.</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
        <button type="button" onClick={onSave} disabled={!canSave || saving} className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? 'Saving…' : 'Save split'}
        </button>
      </div>
    </HaypModal>
  )
}
