'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Loader2, AlertCircle, UserPlus } from 'lucide-react'
import apiClient from '@/lib/api-client'

interface NewCustomer {
  contactId: string
  name: string
  email: string
  phone: string
  balance: number
  billingAddress?: { line1?: string; city?: string; state?: string; zip?: string }
}

interface Props {
  companyId: string
  onClose: () => void
  onCreated: (customer: NewCustomer) => void
}

export default function QuickAddCustomerModal({ companyId, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
      }
      const { data } = await apiClient.post(`/companies/${companyId}/customers`, payload)
      onCreated({
        contactId: data.contactId ?? data.id,
        name: data.name ?? data.displayName ?? form.name,
        email: data.email ?? form.email,
        phone: data.phone ?? form.phone,
        balance: Number(data.balance ?? 0),
        billingAddress: (form.address || form.city) ? {
          line1: form.address || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zip: form.zip || undefined,
        } : undefined,
      })
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}>
        <motion.div
          initial={{ scale: 0.96, y: 8 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 8 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <UserPlus size={15} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">New Customer</h2>
                <p className="text-xs text-gray-400">Quick add — fill in details later</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name <span className="text-red-400">*</span></label>
              <input
                autoFocus
                value={form.name}
                onChange={e => set('name', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="Full name or business name"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="customer@email.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Billing Address <span className="font-normal text-gray-400">(optional)</span></label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="Street address"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    placeholder="City"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => set('state', e.target.value)}
                    placeholder="State"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                  <input
                    type="text"
                    value={form.zip}
                    onChange={e => set('zip', e.target.value)}
                    placeholder="ZIP"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Create &amp; Select
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
