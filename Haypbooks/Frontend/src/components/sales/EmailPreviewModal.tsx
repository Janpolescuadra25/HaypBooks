'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X, Send, Clock, Download, Link2, Loader2, AlertCircle,
  Mail, User, FileText, Building2, ChevronDown, Check,
  Calendar, CreditCard, CheckCircle2, BookOpen, Settings2,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import type { Invoice } from './InvoicesPage'
import TemplateManagerModal, { type EmailTemplate } from './TemplateManagerModal'

// ─── Tone / Template options ─────────────────────────────────────────────────
const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly',     label: 'Friendly' },
  { id: 'brief',        label: 'Brief' },
]

function buildSubject(inv: Invoice, companyName: string) {
  const num = inv.invoiceNumber ?? `INV-${inv.id.slice(-6).toUpperCase()}`
  const due = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  return `Invoice ${num} from ${companyName} — Due ${due}`
}

function buildBody(inv: Invoice, companyName: string, tone: string): string {
  const num = inv.invoiceNumber ?? `INV-${inv.id.slice(-6).toUpperCase()}`
  const customer = inv.customerName ?? 'Valued Customer'
  const due = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'on receipt'

  if (tone === 'brief') {
    return `Hi ${customer},\n\nYour invoice ${num} is ready.\n\nTotal due: {amount}\nDue: ${due}\n\nPlease let me know if you have any questions.\n\n${companyName}`
  }
  if (tone === 'friendly') {
    return `Hi ${customer}! 👋\n\nHope you're doing great! Here's your invoice ${num} for {amount}, due by ${due}.\n\nWe truly appreciate your business — it means a lot to us!\n\nFeel free to reach out anytime with questions.\n\nWarm regards,\n${companyName}`
  }
  // professional (default)
  return `Dear ${customer},\n\nThank you for choosing ${companyName}. Please find your invoice details below:\n\n  Invoice #:     ${num}\n  Amount Due:    {amount}\n  Due Date:      ${due}\n\nIf you have any questions regarding this invoice, please don't hesitate to contact us and we'll be happy to assist.\n\nBest regards,\n${companyName}`
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  invoice: Invoice
  companyId: string
  companyName?: string
  onClose: () => void
  onSent?: () => void
}

type ActiveView = 'email' | 'pdf'
type ScheduleState = 'hidden' | 'open'

// ─── Component ───────────────────────────────────────────────────────────────
export default function EmailPreviewModal({ invoice, companyId, companyName = 'Your Company', onClose, onSent }: Props) {
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n ?? 0, currency), [currency])

  const num = invoice.invoiceNumber ?? `INV-${invoice.id.slice(-6).toUpperCase()}`
  const amountStr = fmt(invoice.amountDue ?? invoice.total ?? 0)

  // ── Email fields ─────────────────────────────────────────────────────────
  const [tone, setTone]       = useState('professional')
  const [subject, setSubject] = useState(() => buildSubject(invoice, companyName))
  const [body, setBody]       = useState(() => buildBody(invoice, companyName, 'professional').replace('{amount}', fmt(invoice.amountDue ?? invoice.total ?? 0)))
  const [sendCopy, setSendCopy] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')

  // ── UI state ─────────────────────────────────────────────────────────────
  const [activeView, setActiveView]   = useState<ActiveView>('email')
  const [scheduleState, setScheduleState] = useState<ScheduleState>('hidden')
  const [sending, setSending]         = useState(false)
  const [sent, setSent]               = useState(false)
  const [error, setError]             = useState('')
  const [linkCopied, setLinkCopied]   = useState(false)
  const [toneMenu, setToneMenu]       = useState(false)

  // ── Email templates ───────────────────────────────────────────────────────
  const [templates, setTemplates]         = useState<EmailTemplate[]>([])
  const [templateMenu, setTemplateMenu]   = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)

  // Regenerate body when tone changes
  useEffect(() => {
    setBody(buildBody(invoice, companyName, tone).replace('{amount}', amountStr))
  }, [tone, invoice, companyName, amountStr])

  // Regenerate subject when invoice changes
  useEffect(() => {
    setSubject(buildSubject(invoice, companyName))
  }, [invoice, companyName])

  // Load saved email templates
  useEffect(() => {
    apiClient.get<EmailTemplate[]>(`/companies/${companyId}/email-templates`)
      .then(res => setTemplates(res.data ?? []))
      .catch(() => {/* non-fatal */})
  }, [companyId])

  const handleSendNow = async () => {
    setSending(true); setError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/invoices/${invoice.id}/send`, {
        subject,
        body,
        scheduledAt: scheduleState === 'open' && scheduledAt ? scheduledAt : undefined,
      })
      setSent(true)
      onSent?.()
      setTimeout(onClose, 2000)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to send invoice.')
    } finally {
      setSending(false)
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/invoices/${invoice.id}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const fmtDate = (d?: string) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return d }
  }

  const items = invoice.items ?? []
  const subtotal = items.reduce((s, it) => s + (it.amount ?? it.quantity * it.unitPrice), 0) || invoice.total || 0
  const balanceDue = invoice.amountDue ?? invoice.total ?? 0

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-stretch bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="m-auto w-full max-w-5xl max-h-[95vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top Bar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Mail size={17} className="text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Send Invoice</h2>
              <p className="text-xs text-slate-500">{num} · {invoice.customerName ?? 'Customer'} · {amountStr} due {fmtDate(invoice.dueDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs">
              {(['email', 'pdf'] as ActiveView[]).map(v => (
                <button key={v} onClick={() => setActiveView(v)}
                  className={`px-3 py-1.5 rounded-md font-semibold capitalize transition-colors ${activeView === v ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {v === 'email' ? '📧 Email' : '📄 PDF Preview'}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* ── LEFT: Composition Panel ───────────────────────────────────── */}
          <div className="w-full sm:w-[420px] flex-shrink-0 border-r border-slate-100 flex flex-col overflow-y-auto">
            <div className="p-5 space-y-4 flex-1">

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <AlertCircle size={14} className="shrink-0" /> {error}
                </div>
              )}

              {/* Sent success */}
              {sent && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                  <CheckCircle2 size={14} className="shrink-0" /> Invoice sent successfully!
                </div>
              )}

              {/* From */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">From</label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                  <Building2 size={13} className="text-slate-400 shrink-0" />
                  <span>{companyName}</span>
                </div>
              </div>

              {/* To */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">To</label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                  <User size={13} className="text-slate-400 shrink-0" />
                  <span>{invoice.customerName ?? 'Customer'}</span>
                </div>
              </div>

              {/* Load saved template */}
              {templates.length > 0 && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Load Template</label>
                    <button type="button" onClick={() => setShowTemplateManager(true)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                      <Settings2 size={10} /> Manage
                    </button>
                  </div>
                  <button type="button" onClick={() => setTemplateMenu(p => !p)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white hover:border-emerald-300 transition-colors">
                    <span className="flex items-center gap-2 text-slate-600"><BookOpen size={13} className="text-slate-400" /> Choose a saved template…</span>
                    <ChevronDown size={13} className="text-slate-400" />
                  </button>
                  <AnimatePresence>
                    {templateMenu && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto">
                        {templates.map(tpl => (
                          <button key={tpl.id} type="button"
                            onClick={() => {
                              setSubject(tpl.subject)
                              setBody(tpl.body.replace('{amount}', amountStr))
                              setTone(tpl.tone)
                              setTemplateMenu(false)
                            }}
                            className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 transition-colors">
                            <p className="text-sm font-semibold text-slate-800">{tpl.name}</p>
                            <p className="text-xs text-slate-500 truncate">{tpl.subject}</p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {templates.length === 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">No saved templates</span>
                  <button type="button" onClick={() => setShowTemplateManager(true)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                    <Settings2 size={10} /> Manage Templates
                  </button>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Subject</label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                />
              </div>

              {/* Tone selector */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Tone / Template</label>
                <button
                  type="button"
                  onClick={() => setToneMenu(p => !p)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white hover:border-slate-300 transition-colors"
                >
                  <span className="text-slate-700">{TONES.find(t => t.id === tone)?.label ?? 'Professional'}</span>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>
                <AnimatePresence>
                  {toneMenu && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1">
                      {TONES.map(t => (
                        <button key={t.id} type="button"
                          onClick={() => { setTone(t.id); setToneMenu(false) }}
                          className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-emerald-50 transition-colors ${tone === t.id ? 'text-emerald-700 font-semibold' : 'text-slate-700'}`}>
                          {tone === t.id && <Check size={12} />}{t.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Message body */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Message</label>
                <textarea
                  rows={9}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-none leading-relaxed"
                />
              </div>

              {/* Send me a copy */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={sendCopy} onChange={e => setSendCopy(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 accent-emerald-600" />
                <span className="text-sm text-slate-600">Send me a copy</span>
              </label>

              {/* Schedule send toggle */}
              {scheduleState === 'open' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Schedule Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                  />
                </div>
              )}
            </div>

            {/* ── Action footer ─────────────────────────────────────────── */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-col gap-2">
              {/* Primary: Send Now */}
              <button
                onClick={handleSendNow}
                disabled={sending || sent}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-sm"
              >
                {sending
                  ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
                  : sent
                    ? <><CheckCircle2 size={14} /> Sent!</>
                    : <><Send size={14} /> Send Now</>
                }
              </button>

              {/* Secondary row */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setScheduleState(p => p === 'open' ? 'hidden' : 'open')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${scheduleState === 'open' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  <Clock size={12} />
                  {scheduleState === 'open' ? 'Scheduled' : 'Schedule'}
                </button>
                <button
                  onClick={() => { window.print() }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Download size={12} /> PDF
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${linkCopied ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  <Link2 size={12} /> {linkCopied ? 'Copied!' : 'Link'}
                </button>
              </div>

              <button onClick={onClose}
                className="text-xs text-center text-slate-400 hover:text-slate-600 transition-colors py-1">
                Cancel
              </button>
            </div>
          </div>

          {/* ── RIGHT: Invoice Preview ────────────────────────────────────── */}
          <div className="flex-1 bg-slate-50 overflow-y-auto hidden sm:block">
            <div className="p-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 text-center">
                {activeView === 'email' ? 'Preview — What your customer will see' : 'PDF Preview'}
              </p>

              {/* Email shell */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-lg mx-auto">

                {/* Email header */}
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-5 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold opacity-90">{companyName}</span>
                  </div>
                  <h3 className="text-lg font-bold leading-tight mb-1">Your invoice is ready!</h3>
                  <p className="text-sm opacity-80">
                    Total {amountStr} &bull; Due {fmtDate(invoice.dueDate)}
                  </p>
                </div>

                {/* Email body preview */}
                <div className="px-6 py-5 space-y-4">

                  {/* Message text */}
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line border-l-2 border-emerald-200 pl-3">
                    {body.slice(0, 220)}{body.length > 220 ? '…' : ''}
                  </div>

                  {/* Invoice summary card */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {/* Invoice header */}
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-emerald-600" />
                        <span className="text-sm font-bold text-slate-800">INVOICE {num}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                        invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                        invoice.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>

                    {/* Meta/Details */}
                    <div className="px-4 py-3 space-y-2 border-b border-slate-100">
                      <DetailRow icon={<User size={11} />} label="Customer" value={invoice.customerName ?? '—'} />
                      <DetailRow icon={<Calendar size={11} />} label="Invoice Date" value={fmtDate(invoice.date)} />
                      <DetailRow icon={<Calendar size={11} />} label="Due Date" value={fmtDate(invoice.dueDate)} />
                    </div>

                    {/* Line items */}
                    {items.length > 0 && (
                      <div className="border-b border-slate-100">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="text-left px-4 py-2 font-semibold text-slate-500">Description</th>
                              <th className="text-right px-4 py-2 font-semibold text-slate-500 w-12">Qty</th>
                              <th className="text-right px-4 py-2 font-semibold text-slate-500 w-24">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((it, i) => (
                              <tr key={i} className="border-t border-slate-50">
                                <td className="px-4 py-2 text-slate-700">{it.description}</td>
                                <td className="px-4 py-2 text-right text-slate-500">{it.quantity}</td>
                                <td className="px-4 py-2 text-right text-slate-700 font-medium tabular-nums">
                                  {fmt(it.amount ?? it.quantity * it.unitPrice)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Totals */}
                    <div className="px-4 py-3 space-y-1.5">
                      {items.length > 0 && (
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Subtotal</span>
                          <span className="tabular-nums">{fmt(subtotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold text-emerald-800 pt-1 border-t border-slate-100">
                        <span>Total Due</span>
                        <span className="tabular-nums">{fmt(balanceDue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="bg-emerald-50 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-emerald-600 font-semibold mb-2">Review and pay</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {['Apple Pay', 'Visa', 'Mastercard', 'Bank Transfer'].map(m => (
                        <span key={m} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <p className="text-xs text-center text-slate-400">
                    Sent by {companyName} via <span className="font-semibold">Haypbooks</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>

    {/* Template Manager modal (nested portal) */}
    <AnimatePresence>
      {showTemplateManager && (
        <TemplateManagerModal
          companyId={companyId}
          onClose={() => setShowTemplateManager(false)}
          onTemplatesChange={setTemplates}
        />
      )}
    </AnimatePresence>

    {/* Dismiss template dropdown on outside click */}
    {templateMenu && (
      <div className="fixed inset-0 z-[25]" onClick={() => setTemplateMenu(false)} />
    )}
  </>
  )
}

// ─── helper ──────────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-slate-400">{icon}</span>
      <span className="text-slate-400 w-24">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  )
}
