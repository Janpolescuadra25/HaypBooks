'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X, Send, Ban, Clock, CheckCircle2, AlertTriangle,
  FileText, User, Calendar, CreditCard, Loader2, AlertCircle,
  MoreVertical, Printer, Download, ChevronRight,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import type { Invoice } from './InvoicesPage'
import EmailPreviewModal from './EmailPreviewModal'

interface Payment {
  id: string
  date: string
  amount: number
  method?: string
  reference?: string
}

interface Props {
  invoice: Invoice
  companyId: string
  onClose: () => void
  onRefresh: () => void
}

const STATUS_CONFIG: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
  DRAFT:           { label: 'Draft',          className: 'bg-gray-100 text-gray-600',         Icon: FileText },
  SENT:            { label: 'Sent',            className: 'bg-blue-100 text-blue-700',          Icon: Send },
  PARTIALLY_PAID:  { label: 'Partial',         className: 'bg-yellow-100 text-yellow-700',      Icon: CreditCard },
  PAID:            { label: 'Paid',            className: 'bg-emerald-100 text-emerald-700',    Icon: CheckCircle2 },
  OVERDUE:         { label: 'Overdue',         className: 'bg-red-100 text-red-700',            Icon: AlertTriangle },
  VOIDED:          { label: 'Voided',          className: 'bg-gray-100 text-gray-500 line-through', Icon: Ban },
}

export default function InvoiceDetailPage({ invoice: initialInvoice, companyId, onClose, onRefresh }: Props) {
  const { currency } = useCompanyCurrency()
  const [invoice, setInvoice] = useState(initialInvoice)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [sending, setSending] = useState(false)
  const [voiding, setVoiding] = useState(false)
  const [error, setError] = useState('')
  const [confirmVoid, setConfirmVoid] = useState(false)
  const [showEmailPreview, setShowEmailPreview] = useState(false)

  const fmt = useCallback((n: number) => formatCurrency(n ?? 0, currency), [currency])

  const status = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.DRAFT
  const StatusIcon = status.Icon

  const amountPaid = (invoice.total ?? 0) - (invoice.amountDue ?? invoice.total ?? 0)
  const taxAmount = 0
  const subtotal = invoice.total ?? 0

  useEffect(() => {
    if (!invoice.id) return
    setLoadingPayments(true)
    apiClient.get(`/companies/${companyId}/ar/payments?invoiceId=${invoice.id}`)
      .then(({ data }) => setPayments(Array.isArray(data) ? data : data.items ?? data.payments ?? []))
      .catch(() => setPayments([]))
      .finally(() => setLoadingPayments(false))
  }, [invoice.id, companyId])

  const handleSend = async () => {
    if (invoice.status !== 'DRAFT' && invoice.status !== 'SENT') return
    setSending(true); setError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/invoices/${invoice.id}/send`)
      setInvoice(p => ({ ...p, status: 'SENT' }))
      onRefresh()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to send invoice')
    } finally {
      setSending(false)
    }
  }

  const handleVoid = async () => {
    setVoiding(true); setError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/invoices/${invoice.id}/void`)
      setInvoice(p => ({ ...p, status: 'VOIDED' }))
      onRefresh()
      setConfirmVoid(false)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to void invoice')
    } finally {
      setVoiding(false)
    }
  }

  const items = invoice.items ?? []

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-emerald-50/60 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileText size={18} className="text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-emerald-900">
                    {invoice.invoiceNumber ?? `INV-${invoice.id?.slice(-6).toUpperCase()}`}
                  </h2>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${status.className}`}>
                    <StatusIcon size={11} />{status.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{invoice.customerName ?? (invoice as any).customer?.name ?? '—'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="px-6 py-5 space-y-5">
              {/* Meta Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Customer', value: invoice.customerName ?? (invoice as any).customer?.name ?? '—', Icon: User },
                  { label: 'Invoice Date', value: invoice.date ? new Date(invoice.date).toLocaleDateString() : '—', Icon: Calendar },
                  { label: 'Due Date', value: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—', Icon: Clock },
                  { label: 'Amount Due', value: fmt(invoice.amountDue ?? invoice.total ?? 0), Icon: CreditCard },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      <Icon size={12} />
                      <span className="text-xs">{label}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Line Items */}
              {items.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Line Items</h3>
                  <div className="border border-emerald-100 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-emerald-50/60">
                          <th className="text-left px-3 py-2 text-xs font-medium text-emerald-700">Description</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-emerald-700 w-16">Qty</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-emerald-700 w-28">Unit Price</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-emerald-700 w-28">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it: any, i: number) => (
                          <tr key={i} className="border-t border-emerald-50">
                            <td className="px-3 py-2 text-gray-800">{it.description}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{it.quantity}</td>
                            <td className="px-3 py-2 text-right text-gray-600 tabular-nums">{fmt(it.unitPrice)}</td>
                            <td className="px-3 py-2 text-right font-semibold text-emerald-800 tabular-nums">{fmt(it.amount ?? it.quantity * it.unitPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end mt-3">
                    <div className="w-52 space-y-1.5 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="tabular-nums font-medium">{fmt(subtotal)}</span>
                      </div>
                      {taxAmount > 0 && (
                        <div className="flex justify-between text-gray-500">
                          <span>Tax</span><span className="tabular-nums">{fmt(taxAmount)}</span>
                        </div>
                      )}
                      {amountPaid > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Amount Paid</span><span className="tabular-nums">- {fmt(amountPaid)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-emerald-900 text-base pt-1.5 border-t border-emerald-100">
                        <span>Balance Due</span>
                        <span className="tabular-nums">{fmt(invoice.amountDue ?? invoice.total ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No items fallback */}
              {items.length === 0 && (
                <div className="flex justify-between items-center bg-emerald-50 rounded-xl p-4">
                  <span className="text-sm font-semibold text-emerald-700">Total Amount</span>
                  <span className="text-xl font-bold text-emerald-900 tabular-nums">{fmt(invoice.total ?? 0)}</span>
                </div>
              )}

              {/* Memo */}
              {invoice.memo && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Message</p>
                  <p className="text-sm text-gray-700">{invoice.memo}</p>
                </div>
              )}

              {/* Payment History */}
              <div>
                <h3 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Payment History</h3>
                {loadingPayments ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-gray-400"><Loader2 size={14} className="animate-spin" /> Loading…</div>
                ) : payments.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-400 text-center">No payments recorded</div>
                ) : (
                  <div className="space-y-2">
                    {payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-emerald-50/50 rounded-xl px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{new Date(p.date).toLocaleDateString()}</p>
                          {(p.method || p.reference) && (
                            <p className="text-xs text-gray-400">{[p.method, p.reference].filter(Boolean).join(' · ')}</p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-emerald-700 tabular-nums">{fmt(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-emerald-100 flex items-center justify-between gap-3 flex-shrink-0 bg-gray-50/50">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
              Close
            </button>
            {(invoice.status as string) !== 'VOIDED' && invoice.status !== 'PAID' && (
              <div className="flex items-center gap-2">
                {(invoice.status as string) !== 'VOIDED' && (
                  <button onClick={() => setConfirmVoid(true)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
                    <Ban size={13} /> Void
                  </button>
                )}
                {(invoice.status === 'DRAFT' || invoice.status === 'SENT') && (
                  <button onClick={() => setShowEmailPreview(true)} disabled={sending}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                    <Send size={14} />
                    {invoice.status === 'SENT' ? 'Resend' : 'Send Invoice'}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Void confirmation dialog */}
      <AnimatePresence>
        {confirmVoid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg"><Ban size={18} className="text-red-600" /></div>
                <h3 className="text-base font-bold text-gray-900">Void Invoice?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                This will permanently void the invoice and reverse any GL entries. This cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setConfirmVoid(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={handleVoid} disabled={voiding}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                  {voiding ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                  Void Invoice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Preview Modal */}
      <AnimatePresence>
        {showEmailPreview && (
          <EmailPreviewModal
            invoice={invoice}
            companyId={companyId}
            onClose={() => setShowEmailPreview(false)}
            onSent={() => { setInvoice(p => ({ ...p, status: 'SENT' })); onRefresh() }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
