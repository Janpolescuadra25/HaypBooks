'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X, Send, Ban, Clock, CheckCircle2, AlertTriangle,
  FileText, User, Calendar, CreditCard, Loader2, AlertCircle,
  MoreVertical, Printer, Download, ChevronRight,
  Mail, Eye, Globe, ChevronDown, BookOpen, Settings2,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import type { Invoice } from './InvoicesPage'
import EmailPreviewModal from './EmailPreviewModal'
import TemplateManagerModal, { type EmailTemplate } from './TemplateManagerModal'

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
  PARTIAL:         { label: 'Partial',         className: 'bg-yellow-100 text-yellow-700',      Icon: CreditCard },
  PAID:            { label: 'Paid',            className: 'bg-emerald-100 text-emerald-700',    Icon: CheckCircle2 },
  OVERDUE:         { label: 'Overdue',         className: 'bg-red-100 text-red-700',            Icon: AlertTriangle },
  VOID:            { label: 'Voided',          className: 'bg-gray-100 text-gray-500 line-through', Icon: Ban },
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
  type ActiveDetailTab = 'edit' | 'email' | 'payor' | 'print'
  const [activeTab, setActiveTab] = useState<ActiveDetailTab>('edit')
  const [emailTone, setEmailTone] = useState('professional')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sendCopy, setSendCopy] = useState(false)
  const [showToneMenu, setShowToneMenu] = useState(false)
  const [payorTemplate, setPayorTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern')
  // Email template state
  const [emailTemplates, setEmailTemplates]         = useState<EmailTemplate[]>([])
  const [showTemplateMenu, setShowTemplateMenu]     = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  // Receive Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentSaving, setPaymentSaving] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    method: '',
    referenceNumber: '',
  })

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

  // Rebuild email subject+body when invoice details or tone changes
  useEffect(() => {
    const num = invoice.invoiceNumber ?? `INV-${invoice.id?.slice(-6).toUpperCase()}`
    const due = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : ''
    const dueLong = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'on receipt'
    const customer = invoice.customerName ?? 'Customer'
    const amt = `{amount}`
    setEmailSubject(`Invoice ${num} \u2014 Due ${due}`)
    if (emailTone === 'brief') {
      setEmailBody(`Hi ${customer},\n\nYour invoice ${num} is ready.\n\nAmount due: ${amt}\nDue: ${dueLong}\n\nThank you.`)
    } else if (emailTone === 'friendly') {
      setEmailBody(`Hi ${customer}! \uD83D\uDC4B\n\nHere\u2019s your invoice ${num} for ${amt}, due ${dueLong}.\n\nThank you for your business! We truly appreciate it.\n\nWarm regards`)
    } else {
      setEmailBody(`Dear ${customer},\n\nThank you for choosing our services. Please find your invoice details below:\n\n  Invoice #:   ${num}\n  Amount Due:  ${amt}\n  Due Date:    ${dueLong}\n\nIf you have any questions, please don\u2019t hesitate to reach out.\n\nBest regards`)
    }
  }, [invoice.id, invoice.invoiceNumber, invoice.customerName, invoice.dueDate, emailTone])

  // Load email templates when email tab becomes active
  useEffect(() => {
    if (activeTab !== 'email') return
    apiClient.get<EmailTemplate[]>(`/companies/${companyId}/email-templates`)
      .then(res => setEmailTemplates(res.data ?? []))
      .catch(() => {/* non-fatal */})
  }, [activeTab, companyId])

  const handleSendEmail = async (scheduledAt?: string) => {
    setSending(true); setError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/invoices/${invoice.id}/send`, {
        subject: emailSubject,
        body: emailBody.replace('{amount}', formatCurrency(invoice.total ?? 0, currency)),
        ...(scheduledAt ? { scheduledAt } : {}),
      })
      setInvoice(p => ({ ...p, status: 'SENT' }))
      onRefresh()
      setActiveTab('edit')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to send invoice')
    } finally {
      setSending(false)
    }
  }

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
      setInvoice(p => ({ ...p, status: 'VOID' }))
      onRefresh()
      setConfirmVoid(false)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to void invoice')
    } finally {
      setVoiding(false)
    }
  }

  const handleReceivePayment = async () => {
    const amount = Number(paymentForm.amount)
    if (!amount || amount <= 0) { setError('Enter a valid payment amount'); return }
    if (!paymentForm.paymentDate) { setError('Payment date is required'); return }
    setPaymentSaving(true); setError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/payments`, {
        invoiceId: invoice.id,
        amount,
        paymentDate: paymentForm.paymentDate,
        method: paymentForm.method || undefined,
        referenceNumber: paymentForm.referenceNumber || undefined,
      })
      onRefresh()
      setShowPaymentModal(false)
      setPaymentForm({ amount: '', paymentDate: new Date().toISOString().slice(0, 10), method: '', referenceNumber: '' })
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to record payment')
    } finally {
      setPaymentSaving(false)
    }
  }

  const items = invoice.items ?? []

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
          onClick={e => e.stopPropagation()}
          className={`bg-white rounded-2xl shadow-2xl w-full ${activeTab === 'email' ? 'max-w-4xl' : 'max-w-2xl'} max-h-[92vh] flex flex-col overflow-hidden`}>

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

          {/* View Tabs */}
          <div className="flex border-b border-gray-200 bg-white px-4 flex-shrink-0">
            {([
              { id: 'edit',  label: 'Edit',       Icon: FileText },
              { id: 'email', label: 'Email',      Icon: Mail },
              { id: 'payor', label: 'Payor View', Icon: Eye },
              { id: 'print', label: 'Print / PDF', Icon: Printer },
            ] as Array<{ id: ActiveDetailTab; label: string; Icon: React.ElementType }>).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {activeTab === 'edit' && <div className="px-6 py-5 space-y-5">
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
            </div>} {/* end edit tab */}

            {/* ── Email Tab ─────────────────────────────────────── */}
            {activeTab === 'email' && (
              <div className="flex h-full min-h-[420px]">
                {/* Compose panel */}
                <div className="w-1/2 border-r border-gray-200 p-5 space-y-4 overflow-y-auto">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">To</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{invoice.customerName ?? '—'}</p>
                  </div>

                  {/* Template picker */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {emailTemplates.length > 0 ? 'Load Template' : 'Templates'}
                      </p>
                      <button type="button" onClick={() => setShowTemplateManager(true)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                        <Settings2 size={10} /> Manage
                      </button>
                    </div>
                    {emailTemplates.length > 0 ? (
                      <div className="relative">
                        <button type="button" onClick={() => setShowTemplateMenu(p => !p)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:border-emerald-300 transition-colors">
                          <span className="flex items-center gap-2 text-gray-500 text-xs">
                            <BookOpen size={12} className="text-gray-400" /> Choose a saved template…
                          </span>
                          <ChevronDown size={12} className="text-gray-400" />
                        </button>
                        <AnimatePresence>
                          {showTemplateMenu && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                              className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg py-1 max-h-44 overflow-y-auto">
                              {emailTemplates.map(tpl => (
                                <button key={tpl.id} type="button"
                                  onClick={() => {
                                    setEmailSubject(tpl.subject)
                                    setEmailBody(tpl.body)
                                    setEmailTone(tpl.tone)
                                    setShowTemplateMenu(false)
                                  }}
                                  className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 transition-colors">
                                  <p className="text-xs font-semibold text-gray-800">{tpl.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{tpl.subject}</p>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {showTemplateMenu && (
                          <div className="fixed inset-0 z-[25]" onClick={() => setShowTemplateMenu(false)} />
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No saved templates. Click Manage to create one.</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject</p>
                    <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-400 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tone</p>
                    <div className="flex gap-2">
                      {(['professional', 'friendly', 'brief'] as const).map(t => (
                        <button key={t} onClick={() => setEmailTone(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                            emailTone === t ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Message</p>
                    <textarea value={emailBody.replace('{amount}', formatCurrency(invoice.total ?? 0, currency))}
                      onChange={e => setEmailBody(e.target.value)} rows={8}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-400 outline-none resize-none font-mono leading-relaxed" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sendCopy} onChange={e => setSendCopy(e.target.checked)} className="rounded accent-emerald-600" />
                    <span className="text-xs text-gray-600">Send me a copy</span>
                  </label>
                </div>
                {/* Live preview panel */}
                <div className="w-1/2 p-5 bg-gray-50 overflow-y-auto">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Preview</p>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-4 text-white">
                      <p className="text-xs opacity-75 mb-0.5">Invoice</p>
                      <p className="font-bold text-lg">{invoice.invoiceNumber ?? `INV-${invoice.id?.slice(-6).toUpperCase()}`}</p>
                      <p className="text-xs opacity-80 mt-1">Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</p>
                    </div>
                    <div className="px-5 py-3">
                      <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                        {emailBody.replace('{amount}', formatCurrency(invoice.total ?? 0, currency)).slice(0, 200)}
                        {emailBody.length > 200 ? '…' : ''}
                      </p>
                    </div>
                    <div className="px-5 pb-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-xs">
                        <div className="flex justify-between font-bold text-emerald-800">
                          <span>Amount Due</span>
                          <span>{fmt(invoice.amountDue ?? invoice.total ?? 0)}</span>
                        </div>
                      </div>
                      <button className="mt-3 w-full bg-emerald-600 text-white text-xs font-semibold py-2 rounded-lg">View &amp; Pay Invoice</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Payor View Tab ────────────────────────────────── */}
            {activeTab === 'payor' && (
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xs font-semibold text-gray-500">Template:</p>
                  {(['modern', 'classic', 'minimal'] as const).map(t => (
                    <button key={t} onClick={() => setPayorTemplate(t)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                        payorTemplate === t ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>{t}</button>
                  ))}
                </div>
                <div className={`border rounded-2xl overflow-hidden ${payorTemplate === 'minimal' ? 'border-gray-200' : 'border-emerald-100'}`}>
                  <div className={`px-6 py-5 ${
                    payorTemplate === 'modern' ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white' :
                    payorTemplate === 'classic' ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-white border-b border-gray-100'
                  }`}>
                    <p className={`text-xs font-semibold mb-1 ${payorTemplate === 'modern' ? 'opacity-75' : 'text-gray-400'}`}>Invoice</p>
                    <p className={`text-xl font-bold ${payorTemplate === 'modern' ? '' : 'text-gray-900'}`}>
                      {invoice.invoiceNumber ?? `INV-${invoice.id?.slice(-6).toUpperCase()}`}
                    </p>
                    <div className={`flex gap-4 mt-1 text-xs ${payorTemplate === 'modern' ? 'opacity-80' : 'text-gray-500'}`}>
                      <span>Issued: {invoice.date ? new Date(invoice.date).toLocaleDateString() : '—'}</span>
                      <span>Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-white">
                    <p className="text-xs font-semibold text-gray-400 mb-1">Bill To</p>
                    <p className="text-sm font-semibold text-gray-800">{invoice.customerName ?? '—'}</p>
                  </div>
                  {items.length > 0 && (
                    <div className="px-6 pb-4 bg-white">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100">
                          <th className="text-left py-2 text-xs font-semibold text-gray-500">Item</th>
                          <th className="text-right py-2 text-xs font-semibold text-gray-500 w-16">Qty</th>
                          <th className="text-right py-2 text-xs font-semibold text-gray-500 w-24">Amount</th>
                        </tr></thead>
                        <tbody>
                          {items.map((it: any, i: number) => (
                            <tr key={i} className="border-b border-gray-50">
                              <td className="py-2 text-gray-700">{it.description}</td>
                              <td className="py-2 text-right text-gray-600">{it.quantity}</td>
                              <td className="py-2 text-right font-semibold text-gray-800">{fmt(it.amount ?? it.quantity * it.unitPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
                        <div className="text-sm font-bold text-gray-900 flex gap-8">
                          <span>Total Due</span>
                          <span className="tabular-nums">{fmt(invoice.amountDue ?? invoice.total ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button className="w-full bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
                      Pay {fmt(invoice.amountDue ?? invoice.total ?? 0)}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-2">Secure payment powered by Haypbooks</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Print / PDF Tab ───────────────────────────────── */}
            {activeTab === 'print' && (
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500">Print-ready layout — use Ctrl+P or click Print below</p>
                  <button onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
                    <Printer size={13} /> Print
                  </button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <div className="px-8 pt-8 pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">INVOICE</p>
                        <p className="text-sm text-gray-500 mt-1">{invoice.invoiceNumber ?? `INV-${invoice.id?.slice(-6).toUpperCase()}`}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>Date: {invoice.date ? new Date(invoice.date).toLocaleDateString() : '—'}</p>
                        <p>Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 py-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Bill To</p>
                    <p className="font-semibold text-gray-900">{invoice.customerName ?? '—'}</p>
                  </div>
                  {items.length > 0 && (
                    <div className="px-8 py-4">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b-2 border-gray-200">
                          <th className="text-left py-2 text-xs font-bold text-gray-600 uppercase">Description</th>
                          <th className="text-right py-2 text-xs font-bold text-gray-600 uppercase w-16">Qty</th>
                          <th className="text-right py-2 text-xs font-bold text-gray-600 uppercase w-28">Unit Price</th>
                          <th className="text-right py-2 text-xs font-bold text-gray-600 uppercase w-28">Amount</th>
                        </tr></thead>
                        <tbody>
                          {items.map((it: any, i: number) => (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="py-2 text-gray-800">{it.description}</td>
                              <td className="py-2 text-right text-gray-600">{it.quantity}</td>
                              <td className="py-2 text-right text-gray-600">{fmt(it.unitPrice)}</td>
                              <td className="py-2 text-right font-semibold text-gray-800">{fmt(it.amount ?? it.quantity * it.unitPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
                        <div className="text-sm font-bold text-gray-900 flex gap-8">
                          <span>Total Due</span>
                          <span className="tabular-nums">{fmt(invoice.amountDue ?? invoice.total ?? 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {invoice.memo && (
                    <div className="px-8 py-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Notes</p>
                      <p className="text-sm text-gray-700">{invoice.memo}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer — tab-aware actions */}
          <div className="px-6 py-3.5 border-t border-emerald-100 flex items-center justify-between gap-3 flex-shrink-0 bg-gray-50/50">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
              Close
            </button>
            {activeTab === 'edit' && (invoice.status as string) !== 'VOID' && invoice.status !== 'PAID' && (
              <div className="flex items-center gap-2">
                {(invoice.status as string) !== 'VOID' && (
                  <button onClick={() => setConfirmVoid(true)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
                    <Ban size={13} /> Void
                  </button>
                )}
                {(invoice.status === 'SENT' || invoice.status === 'PARTIAL' || invoice.status === 'OVERDUE') && (
                  <button onClick={() => { setPaymentForm(p => ({ ...p, amount: String(invoice.amountDue ?? invoice.total ?? '') })); setShowPaymentModal(true) }}
                    className="flex items-center gap-1.5 px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors">
                    <CreditCard size={13} /> Receive Payment
                  </button>
                )}
                {(invoice.status === 'DRAFT' || invoice.status === 'SENT') && (
                  <button onClick={() => setActiveTab('email')}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
                    <Mail size={14} />
                    {invoice.status === 'SENT' ? 'Resend' : 'Send Invoice'}
                  </button>
                )}
              </div>
            )}
            {activeTab === 'email' && (
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab('edit')}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={() => handleSendEmail()} disabled={sending}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send Now
                </button>
              </div>
            )}
            {activeTab === 'print' && (
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
                <Printer size={14} /> Print Invoice
              </button>
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

      {/* Template Manager Modal */}
      <AnimatePresence>
        {showTemplateManager && (
          <TemplateManagerModal
            companyId={companyId}
            onClose={() => setShowTemplateManager(false)}
            onTemplatesChange={setEmailTemplates}
          />
        )}
      </AnimatePresence>

      {/* Receive Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg"><CreditCard size={18} className="text-emerald-600" /></div>
                <h3 className="text-base font-bold text-gray-900">Record Payment</h3>
              </div>
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Amount *</label>
                  <input type="number" min="0.01" step="0.01"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Date *</label>
                  <input type="date"
                    value={paymentForm.paymentDate}
                    onChange={e => setPaymentForm(p => ({ ...p, paymentDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.method}
                    onChange={e => setPaymentForm(p => ({ ...p, method: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <option value="">— Select —</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Reference #</label>
                  <input type="text"
                    value={paymentForm.referenceNumber}
                    onChange={e => setPaymentForm(p => ({ ...p, referenceNumber: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Check #, transaction ID, etc." />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-5">
                <button onClick={() => { setShowPaymentModal(false); setError('') }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={handleReceivePayment} disabled={paymentSaving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {paymentSaving ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                  Record Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
