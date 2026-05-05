'use client'

import { useState, useCallback } from 'react'
import { Loader2, X } from 'lucide-react'
import { ModalPortal } from './ModalPortal'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'

export interface NewVendorResult {
  id: string
  displayName: string
  email?: string
  phone?: string
}

interface NewVendorModalProps {
  open: boolean
  companyId: string
  onClose: () => void
  onCreated: (vendor: NewVendorResult) => void
}

export function NewVendorModal({ open, companyId, onClose, onCreated }: NewVendorModalProps) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setName('')
    setEmail('')
    setPhone('')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSave = useCallback(async () => {
    if (!name.trim()) { setError('Vendor name is required'); return }
    setSaving(true)
    try {
      const response = await expensesService.createVendor(companyId, {
        name: name.trim(),
        displayName: name.trim(),
        status: 'ACTIVE',
        email: email || undefined,
        phone: phone || undefined,
      })
      const saved = response.data ?? response
      onCreated({ id: saved.id, displayName: saved.displayName ?? saved.name ?? name.trim(), email: saved.email, phone: saved.phone })
      toast.success('Vendor created')
      reset()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Unable to create vendor'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }, [companyId, name, email, phone, onCreated, onClose, toast])

  if (!open) return null

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
        <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">New Vendor</h2>
              <p className="text-sm text-slate-500">Create a vendor and select it automatically.</p>
            </div>
            <button type="button" aria-label="Close vendor modal" onClick={handleClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-4 px-6 py-6">
            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
            <div>
              <label htmlFor="nvm-name" className="block text-sm font-medium text-slate-700 mb-1">Vendor Name <span className="text-rose-500">*</span></label>
              <input
                id="nvm-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                placeholder="Vendor name"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nvm-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  id="nvm-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label htmlFor="nvm-phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  id="nvm-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={handleClose} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Vendor'}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
