'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X, Plus, Trash2, Loader2, AlertCircle, ChevronDown, Save,
  Send, LayoutTemplate, Search, UserPlus, Check,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { getAllTemplates, getDefaultTemplate, recordTemplateUsage } from '@/lib/invoice-templates/templateStorage'
import type { InvoiceTemplate } from '@/lib/invoice-templates/types'
import TemplateGallery from './invoice-templates/TemplateGallery'

interface Customer { id: string; name: string; email: string }
interface LineItem { description: string; quantity: number; unitPrice: number; taxRate: number }

interface Props {
  companyId: string
  onClose: () => void
  onSaved: () => void
}

export default function InvoiceFormModal({ companyId, onClose, onSaved }: Props) {
  const { currency } = useCompanyCurrency()

  // Template
  const [template, setTemplate] = useState<InvoiceTemplate>(getDefaultTemplate)
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)

  // Customer
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  // Invoice fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]
  })
  const [memo, setMemo] = useState(template.defaultMessage)
  const [internalNotes, setInternalNotes] = useState('')
  const [terms, setTerms] = useState(template.defaultTerms ?? '')
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: 1, unitPrice: 0, taxRate: template.defaults.defaultTaxRate }])

  // State
  const [saving, setSaving] = useState(false)
  const [saveAction, setSaveAction] = useState<'draft' | 'send'>('draft')
  const [error, setError] = useState('')
  const customerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiClient.get(`/companies/${companyId}/customers`)
      .then(({ data }) => {
        const raw: Array<{ contactId?: string; id?: string; name: string; email?: string }> =
          Array.isArray(data) ? data : data.items ?? data.customers ?? []
        setCustomers(raw.map(c => ({ id: c.contactId ?? c.id ?? '', name: c.name, email: c.email ?? '' })))
      })
      .catch(() => {})
  }, [companyId])

  // Update memo/terms when template changes
  useEffect(() => {
    setMemo(template.defaultMessage)
    setTerms(template.defaultTerms ?? '')
    setItems(p => p.map(it => ({ ...it, taxRate: template.defaults.defaultTaxRate })))
  }, [template])

  const selectedCustomer = customers.find(c => c.id === customerId)
  const filteredCustomers = customerSearch
    ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || (c.email ?? '').toLowerCase().includes(customerSearch.toLowerCase()))
    : customers

  const addItem = () => setItems(p => [...p, { description: '', quantity: 1, unitPrice: 0, taxRate: template.defaults.defaultTaxRate }])
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i))
  const updateItem = (i: number, f: keyof LineItem, v: string | number) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [f]: v } : item))

  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unitPrice)), 0)
  const taxAmount = template.defaults.taxTreatment !== 'none'
    ? items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unitPrice) * Number(it.taxRate) / 100), 0)
    : 0
  const total = template.defaults.taxTreatment === 'inclusive' ? subtotal : subtotal + taxAmount
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const handleSave = async (action: 'draft' | 'send') => {
    if (!customerId) { setError('Please select a customer.'); return }
    const validItems = items.filter(it => it.description.trim())
    if (validItems.length === 0) { setError('Add at least one line item.'); return }
    setSaving(true); setSaveAction(action); setError('')
    try {
      const { data: inv } = await apiClient.post(`/companies/${companyId}/ar/invoices`, {
        customerId, date, dueDate, memo, internalNotes, terms,
        items: validItems.map(it => ({
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          amount: Number(it.quantity) * Number(it.unitPrice),
          taxRate: Number(it.taxRate),
        })),
      })
      if (action === 'send' && inv?.id) {
        await apiClient.post(`/companies/${companyId}/ar/invoices/${inv.id}/send`)
      }
      recordTemplateUsage(template.id)
      onSaved()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-emerald-900">New Invoice</h2>
              <p className="text-xs text-emerald-500 mt-0.5">All fields marked * are required</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Template Selector */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <p className="text-xs text-emerald-600/60 font-medium">Using template</p>
                    <p className="text-sm font-semibold text-emerald-900">{template.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowTemplateGallery(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 bg-white rounded-lg hover:bg-emerald-50 transition-colors">
                  <LayoutTemplate size={13} /> Change Template
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {/* Customer + Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Customer picker */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-emerald-700 mb-1.5">Customer *</label>
                  <div ref={customerRef} className="relative">
                    <button type="button"
                      onClick={() => setShowCustomerDropdown(p => !p)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:border-emerald-300 transition-colors text-left">
                      <span className={selectedCustomer ? 'text-emerald-900 font-medium' : 'text-gray-400'}>
                        {selectedCustomer?.name ?? 'Select customer…'}
                      </span>
                      <ChevronDown size={14} className="text-emerald-400 flex-shrink-0" />
                    </button>
                    <AnimatePresence>
                      {showCustomerDropdown && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-gray-50">
                            <div className="relative">
                              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input autoFocus value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                                placeholder="Search customers…"
                                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-100 rounded-lg focus:outline-none" />
                            </div>
                          </div>
                          <div className="max-h-44 overflow-y-auto">
                            {filteredCustomers.length === 0 ? (
                              <p className="px-3 py-3 text-xs text-gray-400 text-center">No customers found</p>
                            ) : filteredCustomers.map(c => (
                              <button key={c.id} onClick={() => { setCustomerId(c.id); setCustomerSearch(''); setShowCustomerDropdown(false) }}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-emerald-50 transition-colors text-left">
                                <div>
                                  <p className="font-semibold text-gray-900">{c.name}</p>
                                  {c.email && <p className="text-gray-400">{c.email}</p>}
                                </div>
                                {customerId === c.id && <Check size={12} className="text-emerald-500" />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 mb-1.5">Invoice Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 mb-1.5">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-emerald-700">Line Items *</label>
                  <button onClick={addItem}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                    <Plus size={13} /> Add Item
                  </button>
                </div>
                <div className="border border-emerald-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-emerald-50/70">
                        <th className="text-left px-3 py-2 text-xs font-medium text-emerald-700">Description</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-emerald-700 w-16">Qty</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-emerald-700 w-28">Unit Price</th>
                        {template.defaults.taxTreatment !== 'none' && (
                          <th className="text-right px-3 py-2 text-xs font-medium text-emerald-700 w-20">Tax %</th>
                        )}
                        <th className="text-right px-3 py-2 text-xs font-medium text-emerald-700 w-28">Amount</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, i) => (
                        <tr key={i} className="border-t border-emerald-50">
                          <td className="px-3 py-1.5">
                            <input value={it.description} onChange={e => updateItem(i, 'description', e.target.value)}
                              placeholder="Item or service description"
                              className="w-full px-2 py-1.5 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                          </td>
                          <td className="px-3 py-1.5">
                            <input type="number" min="0.01" step="0.01" value={it.quantity}
                              onChange={e => updateItem(i, 'quantity', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm text-right border border-emerald-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                          </td>
                          <td className="px-3 py-1.5">
                            <input type="number" min="0" step="0.01" value={it.unitPrice}
                              onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm text-right border border-emerald-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                          </td>
                          {template.defaults.taxTreatment !== 'none' && (
                            <td className="px-3 py-1.5">
                              <input type="number" min="0" max="100" step="0.5" value={it.taxRate}
                                onChange={e => updateItem(i, 'taxRate', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm text-right border border-emerald-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400/50" />
                            </td>
                          )}
                          <td className="px-3 py-1.5 text-right text-sm font-semibold text-emerald-800 tabular-nums">
                            {fmt(Number(it.quantity) * Number(it.unitPrice))}
                          </td>
                          <td className="px-1.5 py-1.5">
                            {items.length > 1 && (
                              <button onClick={() => removeItem(i)}
                                className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mt-3">
                  <div className="w-56 space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="tabular-nums font-medium">{fmt(subtotal)}</span>
                    </div>
                    {template.defaults.taxTreatment !== 'none' && (
                      <div className="flex justify-between text-gray-500">
                        <span>Tax ({template.defaults.defaultTaxRate}% {template.defaults.taxTreatment})</span>
                        <span className="tabular-nums">{fmt(taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-emerald-900 text-base pt-1 border-t border-emerald-100">
                      <span>Total</span>
                      <span className="tabular-nums">{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message + Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 mb-1.5">Message to Customer</label>
                  <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3}
                    placeholder="Thank you for your business!"
                    className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Internal Notes (not shown to customer)</label>
                  <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={3}
                    placeholder="Private notes…"
                    className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200/50 resize-none text-gray-600" />
                </div>
              </div>

              {/* Terms */}
              {template.sections.termsAndConditions && (
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 mb-1.5">Terms & Conditions</label>
                  <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={2}
                    placeholder="Payment terms, late fees, etc."
                    className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-emerald-100 flex items-center justify-between gap-3 flex-shrink-0 bg-gray-50/50">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => handleSave('draft')} disabled={saving && saveAction === 'draft'}
                className="flex items-center gap-1.5 px-4 py-2 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50">
                {saving && saveAction === 'draft' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save as Draft
              </button>
              <button onClick={() => handleSave('send')} disabled={saving && saveAction === 'send'}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {saving && saveAction === 'send' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Create & Send
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Template Gallery picker */}
      <AnimatePresence>
        {showTemplateGallery && (
          <TemplateGallery modal
            onClose={() => setShowTemplateGallery(false)}
            onSelect={t => { setTemplate(t); setShowTemplateGallery(false) }}
          />
        )}
      </AnimatePresence>

      {showCustomerDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowCustomerDropdown(false)} />
      )}
    </>
  )
}
