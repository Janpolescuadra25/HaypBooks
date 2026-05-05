'use client'

import { useState, useCallback } from 'react'
import { Loader2, X } from 'lucide-react'
import { ModalPortal } from './ModalPortal'
import { accountingService } from '@/services/accounting.service'
import { useToast } from '@/components/ToastProvider'

export interface NewAccountResult {
  id: string
  code?: string
  name: string
}

interface NewAccountModalProps {
  open: boolean
  companyId: string
  onClose: () => void
  onCreated: (account: NewAccountResult) => void
}

const ACCOUNT_TYPES = [
  'EXPENSE',
  'COST_OF_GOODS_SOLD',
  'OTHER_EXPENSE',
  'ASSET',
  'CURRENT_ASSET',
  'FIXED_ASSET',
  'LIABILITY',
  'CURRENT_LIABILITY',
  'EQUITY',
  'INCOME',
  'OTHER_INCOME',
]

export function NewAccountModal({ open, companyId, onClose, onCreated }: NewAccountModalProps) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState('EXPENSE')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setName('')
    setCode('')
    setType('EXPENSE')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSave = useCallback(async () => {
    if (!name.trim()) { setError('Account name is required'); return }
    setSaving(true)
    try {
      const response = await accountingService.createAccount(companyId, {
        name: name.trim(),
        code: code.trim() || undefined,
        type,
      })
      const saved = response.data ?? response
      onCreated({ id: saved.id, code: saved.code, name: saved.name ?? name.trim() })
      toast.success('Account created')
      reset()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Unable to create account'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }, [companyId, name, code, type, onCreated, onClose, toast])

  if (!open) return null

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
        <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">New Account</h2>
              <p className="text-sm text-slate-500">Add a chart of accounts entry and select it automatically.</p>
            </div>
            <button type="button" aria-label="Close account modal" onClick={handleClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-4 px-6 py-6">
            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
            <div>
              <label htmlFor="nam-name" className="block text-sm font-medium text-slate-700 mb-1">Account Name <span className="text-rose-500">*</span></label>
              <input
                id="nam-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                placeholder="e.g. Travel Expenses"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nam-code" className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                <input
                  id="nam-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                  placeholder="e.g. 6100"
                />
              </div>
              <div>
                <label htmlFor="nam-type" className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  id="nam-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={handleClose} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Account'}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
