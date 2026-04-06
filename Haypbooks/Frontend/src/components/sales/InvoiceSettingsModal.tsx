'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X, Settings, Calendar, CreditCard, Bell, ChevronDown, ChevronRight,
  Check, RefreshCw, Clock, Repeat, DollarSign, FileText, Eye, Type,
} from 'lucide-react'

export interface InvoiceSettings {
  // ── Scheduling & Recurrency ──────────────────
  makeRecurring: boolean
  recurringFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  recurringStartDate: string
  recurringEndDate: string        // '' means Never
  // ── Schedule Send ────────────────────────────
  scheduleSend: boolean
  scheduleSendDate: string
  scheduleSendTime: string
  scheduleSendTimezone: string
  // ── Payment Options ──────────────────────────
  enablePartialPayments: boolean
  partialMinAmt: number
  partialMinType: 'pct' | 'flat'
  enableDeposit: boolean
  depositAmt: number
  depositType: 'pct' | 'flat'
  requirePO: boolean
  poLabel: string
  // ── Late Fees ────────────────────────────────
  applyLateFee: boolean
  lateFeeType: 'pct' | 'flat'
  lateFeeRate: number
  lateFeeCap: number             // 0 = no cap
  lateFeeGraceDays: number
  // ── Reminders ────────────────────────────────
  autoReminders: boolean
  reminderDaysBefore: number
  reminderDaysAfter: number
  reminderFrequency: number
  // ── Advanced: Numbering ──────────────────────
  invoicePrefix: string
  invoiceStartNum: number
  invoiceSuffix: string
  // ── Advanced: Defaults ───────────────────────
  defaultPaymentTerms: string
  thankYouMessage: string
  footerTerms: string
  // ── Advanced: Display toggles ────────────────
  showQtyColumn: boolean
  showUnitPrice: boolean
  showTaxBreakdown: boolean
  showDiscount: boolean
  showPaymentTerms: boolean
  showThankYou: boolean
  includeLogo: boolean
  includePaymentInstructions: boolean
  // ── Advanced: Formatting ─────────────────────
  numberFormat: string
  dateFormatDisplay: string
  timeFormat: '12h' | '24h'
}

const todayStr = () => new Date().toISOString().split('T')[0]

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  makeRecurring: false,
  recurringFrequency: 'monthly',
  recurringStartDate: todayStr(),
  recurringEndDate: '',
  scheduleSend: false,
  scheduleSendDate: todayStr(),
  scheduleSendTime: '09:00',
  scheduleSendTimezone: (typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC'),
  enablePartialPayments: false,
  partialMinAmt: 50,
  partialMinType: 'pct',
  enableDeposit: false,
  depositAmt: 50,
  depositType: 'pct',
  requirePO: false,
  poLabel: 'PO #',
  applyLateFee: false,
  lateFeeType: 'pct',
  lateFeeRate: 1.5,
  lateFeeCap: 0,
  lateFeeGraceDays: 5,
  autoReminders: false,
  reminderDaysBefore: 3,
  reminderDaysAfter: 1,
  reminderFrequency: 7,
  invoicePrefix: 'INV-',
  invoiceStartNum: 1001,
  invoiceSuffix: '',
  defaultPaymentTerms: 'Net 30',
  thankYouMessage: 'Thank you for your business!',
  footerTerms: '',
  showQtyColumn: true,
  showUnitPrice: true,
  showTaxBreakdown: true,
  showDiscount: true,
  showPaymentTerms: true,
  showThankYou: true,
  includeLogo: true,
  includePaymentInstructions: true,
  numberFormat: '1,234.56',
  dateFormatDisplay: 'DD/MM/YYYY',
  timeFormat: '12h',
}

interface Props {
  initial: InvoiceSettings
  onApply: (s: InvoiceSettings) => void
  onClose: () => void
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? 'bg-emerald-500' : 'bg-gray-200'
      }`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-4.5' : 'translate-x-0.5'
      }`} />
    </button>
  )
}

function Checkbox({ checked, onChange, label, sub }: {
  checked: boolean; onChange: () => void; label: string; sub?: string
}) {
  return (
    <button type="button" onClick={onChange} className="flex items-start gap-3 text-left w-full group">
      <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 group-hover:border-emerald-400'
      }`}>
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </button>
  )
}

function SectionHeader({ icon, title, color = 'text-emerald-600' }: {
  icon: React.ReactNode; title: string; color?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`${color}`}>{icon}</div>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
    </div>
  )
}

export default function InvoiceSettingsModal({ initial, onApply, onClose }: Props) {
  const [s, setS] = useState<InvoiceSettings>({ ...initial })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const set = <K extends keyof InvoiceSettings>(key: K, val: InvoiceSettings[K]) =>
    setS(prev => ({ ...prev, [key]: val }))

  const hasAnyActive = s.makeRecurring || s.scheduleSend || s.applyLateFee ||
    s.enablePartialPayments || s.requirePO || s.enableDeposit || s.autoReminders

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* ─── Modal Header ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <Settings size={16} className="text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Invoice Settings</h2>
              <p className="text-xs text-gray-400">Configure scheduling, payments, fees, and formatting</p>
            </div>
          </div>
          {hasAnyActive && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 mr-2">
              {[s.makeRecurring, s.scheduleSend, s.applyLateFee, s.enablePartialPayments, s.requirePO, s.enableDeposit, s.autoReminders].filter(Boolean).length} active
            </span>
          )}
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* ─── Scrollable Body ─── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

            {/* ════ LEFT COLUMN ════ */}
            <div className="p-6 space-y-8">

              {/* SECTION 1: SCHEDULING & RECURRENCY */}
              <section>
                <SectionHeader icon={<Repeat size={15} />} title="Scheduling & Recurrency" />

                <div className="space-y-4">
                  {/* Make Recurring */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Save as recurring template</p>
                        <p className="text-xs text-gray-400 mt-0.5">Auto-generate this invoice on a schedule</p>
                      </div>
                      <Toggle checked={s.makeRecurring} onChange={() => set('makeRecurring', !s.makeRecurring)} />
                    </div>
                    {s.makeRecurring && (
                      <div className="px-4 pb-4 pt-3 space-y-3 border-t border-gray-100">
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Frequency</label>
                          <select value={s.recurringFrequency}
                            onChange={e => set('recurringFrequency', e.target.value as any)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-gray-700">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Start Date</label>
                            <input type="date" value={s.recurringStartDate}
                              onChange={e => set('recurringStartDate', e.target.value)}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-gray-700" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">End Date</label>
                            <input type="date" value={s.recurringEndDate}
                              onChange={e => set('recurringEndDate', e.target.value)}
                              placeholder="Never"
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-gray-700" />
                            <p className="text-xs text-gray-400 mt-1">Leave blank = Never</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Schedule Send */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Schedule send for later</p>
                        <p className="text-xs text-gray-400 mt-0.5">Pick a specific date and time to send</p>
                      </div>
                      <Toggle checked={s.scheduleSend} onChange={() => set('scheduleSend', !s.scheduleSend)} />
                    </div>
                    {s.scheduleSend && (
                      <div className="px-4 pb-4 pt-3 space-y-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Send on</label>
                            <input type="date" value={s.scheduleSendDate}
                              onChange={e => set('scheduleSendDate', e.target.value)}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-gray-700" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Time</label>
                            <input type="time" value={s.scheduleSendTime}
                              onChange={e => set('scheduleSendTime', e.target.value)}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-gray-700" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Timezone</label>
                          <input type="text" value={s.scheduleSendTimezone}
                            onChange={e => set('scheduleSendTimezone', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-gray-700" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* SECTION 2: PAYMENT OPTIONS */}
              <section>
                <SectionHeader icon={<CreditCard size={15} />} title="Payment Options" color="text-blue-600" />

                <div className="space-y-4">
                  {/* Partial Payments */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Enable partial payments</p>
                        <p className="text-xs text-gray-400 mt-0.5">Allow customers to pay in installments</p>
                      </div>
                      <Toggle checked={s.enablePartialPayments} onChange={() => set('enablePartialPayments', !s.enablePartialPayments)} />
                    </div>
                    {s.enablePartialPayments && (
                      <div className="px-4 pb-4 pt-3 border-t border-gray-100">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Minimum payment amount</label>
                        <div className="flex items-center gap-2">
                          <select value={s.partialMinType} onChange={e => set('partialMinType', e.target.value as any)}
                            className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none text-gray-700 shrink-0">
                            <option value="pct">%</option>
                            <option value="flat">$</option>
                          </select>
                          <input type="number" min="0" step="0.01"
                            value={s.partialMinAmt}
                            onChange={e => set('partialMinAmt', Number(e.target.value))}
                            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-right tabular-nums text-gray-700" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deposit */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Require deposit before work begins</p>
                        <p className="text-xs text-gray-400 mt-0.5">Collect upfront before starting</p>
                      </div>
                      <Toggle checked={s.enableDeposit} onChange={() => set('enableDeposit', !s.enableDeposit)} />
                    </div>
                    {s.enableDeposit && (
                      <div className="px-4 pb-4 pt-3 border-t border-gray-100">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Deposit amount</label>
                        <div className="flex items-center gap-2">
                          <select value={s.depositType} onChange={e => set('depositType', e.target.value as any)}
                            className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none text-gray-700 shrink-0">
                            <option value="pct">%</option>
                            <option value="flat">$</option>
                          </select>
                          <input type="number" min="0" step="0.01"
                            value={s.depositAmt}
                            onChange={e => set('depositAmt', Number(e.target.value))}
                            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-right tabular-nums text-gray-700" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Require PO */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Require Purchase Order number</p>
                        <p className="text-xs text-gray-400 mt-0.5">Customer must provide PO before payment</p>
                      </div>
                      <Toggle checked={s.requirePO} onChange={() => set('requirePO', !s.requirePO)} />
                    </div>
                    {s.requirePO && (
                      <div className="px-4 pb-4 pt-3 border-t border-gray-100">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Custom PO label</label>
                        <input type="text" value={s.poLabel}
                          onChange={e => set('poLabel', e.target.value)}
                          placeholder="PO # / Reference # / Other"
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-gray-700" />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* ════ RIGHT COLUMN ════ */}
            <div className="p-6 space-y-8">

              {/* SECTION 3: LATE FEES & REMINDERS */}
              <section>
                <SectionHeader icon={<Bell size={15} />} title="Late Fees & Reminders" color="text-orange-500" />

                <div className="space-y-4">
                  {/* Late Fees */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Apply automatic late fees</p>
                        <p className="text-xs text-gray-400 mt-0.5">Charge overdue customers automatically</p>
                      </div>
                      <Toggle checked={s.applyLateFee} onChange={() => set('applyLateFee', !s.applyLateFee)} />
                    </div>
                    {s.applyLateFee && (
                      <div className="px-4 pb-4 pt-3 space-y-3 border-t border-gray-100">
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Fee calculation</label>
                          <div className="flex items-center gap-4">
                            {(['pct', 'flat'] as const).map(v => (
                              <button key={v} type="button" onClick={() => set('lateFeeType', v)}
                                className="flex items-center gap-1.5 text-sm text-gray-700">
                                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                  s.lateFeeType === v ? 'border-emerald-600' : 'border-gray-300'
                                }`}>
                                  {s.lateFeeType === v && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                                </div>
                                {v === 'pct' ? '% of invoice total' : 'Flat $ amount'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">
                              Rate {s.lateFeeType === 'pct' ? '(%)' : '($)'}
                            </label>
                            <input type="number" min="0" step="0.01"
                              value={s.lateFeeRate}
                              onChange={e => set('lateFeeRate', Number(e.target.value))}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-right tabular-nums text-gray-700" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Max cap ($, 0 = none)</label>
                            <input type="number" min="0" step="0.01"
                              value={s.lateFeeCap}
                              onChange={e => set('lateFeeCap', Number(e.target.value))}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-right tabular-nums text-gray-700" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Grace period (days after due date)
                          </label>
                          <input type="number" min="0" step="1"
                            value={s.lateFeeGraceDays}
                            onChange={e => set('lateFeeGraceDays', Number(e.target.value))}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-right tabular-nums text-gray-700" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Auto Reminders */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Automatic payment reminders</p>
                        <p className="text-xs text-gray-400 mt-0.5">Send reminders before & after due date</p>
                      </div>
                      <Toggle checked={s.autoReminders} onChange={() => set('autoReminders', !s.autoReminders)} />
                    </div>
                    {s.autoReminders && (
                      <div className="px-4 pb-4 pt-3 space-y-3 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Days before due</label>
                            <input type="number" min="0" step="1"
                              value={s.reminderDaysBefore}
                              onChange={e => set('reminderDaysBefore', Number(e.target.value))}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-right tabular-nums text-gray-700" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Days after overdue</label>
                            <input type="number" min="0" step="1"
                              value={s.reminderDaysAfter}
                              onChange={e => set('reminderDaysAfter', Number(e.target.value))}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-right tabular-nums text-gray-700" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Every X days after</label>
                            <input type="number" min="1" step="1"
                              value={s.reminderFrequency}
                              onChange={e => set('reminderFrequency', Number(e.target.value))}
                              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-right tabular-nums text-gray-700" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* SECTION 4: ADVANCED (collapsible) */}
              <section>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(p => !p)}
                  className="flex items-center gap-2 w-full group mb-4">
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    <FileText size={15} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 flex-1 text-left">Advanced Settings</h3>
                  <div className={`text-gray-400 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>
                    <ChevronRight size={14} />
                  </div>
                </button>

                {showAdvanced && (
                  <div className="space-y-5">
                    {/* Global settings note */}
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 leading-relaxed">
                      <p className="font-semibold text-blue-800 mb-0.5">Per-Invoice Overrides</p>
                      Changing settings here affects <strong>this invoice only</strong>. To update defaults for all future invoices, go to{' '}
                      <a href="/settings/accounting-preferences" className="font-semibold underline">Settings → Preferences → Accounting</a>.
                    </div>

                    {/* Invoice Numbering */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Invoice Numbering</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Prefix</label>
                          <input type="text" value={s.invoicePrefix}
                            onChange={e => set('invoicePrefix', e.target.value)}
                            placeholder="INV-"
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-gray-700" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Start #</label>
                          <input type="number" min="1" step="1"
                            value={s.invoiceStartNum}
                            onChange={e => set('invoiceStartNum', Number(e.target.value))}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-right tabular-nums text-gray-700" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Suffix</label>
                          <input type="text" value={s.invoiceSuffix}
                            onChange={e => set('invoiceSuffix', e.target.value)}
                            placeholder="-2026"
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-gray-700" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        Preview: <span className="font-mono text-gray-600">{s.invoicePrefix}{s.invoiceStartNum}{s.invoiceSuffix}</span>
                      </p>
                    </div>

                    {/* Print / PDF Footer Content */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🖨️ Print / PDF Footer Content</p>
                      <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg mb-3">
                        <FileText size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-snug">
                          These appear on <span className="font-semibold">printed or PDF invoices only</span>. Email subject and message are customized per-invoice in the <span className="font-semibold">Email Preview</span> tab when creating an invoice.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Default Print Thank You</label>
                          <textarea value={s.thankYouMessage}
                            onChange={e => set('thankYouMessage', e.target.value)}
                            rows={2}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 resize-none text-gray-700" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Default Print Footer / Terms</label>
                          <textarea value={s.footerTerms}
                            onChange={e => set('footerTerms', e.target.value)}
                            rows={2}
                            placeholder="Payment due within 30 days. Late fees apply."
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 resize-none text-gray-700" />
                        </div>
                      </div>
                    </div>

                    {/* Display Toggles */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display on Invoice</p>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { key: 'showQtyColumn' as const, label: 'Quantity column' },
                          { key: 'showUnitPrice' as const, label: 'Unit price' },
                          { key: 'showTaxBreakdown' as const, label: 'Tax breakdown' },
                          { key: 'showDiscount' as const, label: 'Discount line' },
                          { key: 'showPaymentTerms' as const, label: 'Payment terms' },
                          { key: 'showThankYou' as const, label: 'Thank you message' },
                          { key: 'includeLogo' as const, label: 'Company logo' },
                          { key: 'includePaymentInstructions' as const, label: 'Payment instructions' },
                        ]).map(({ key, label }) => (
                          <button key={key} type="button"
                            onClick={() => set(key, !s[key])}
                            className="flex items-center gap-2 text-left group">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              s[key] ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 group-hover:border-emerald-400'
                            }`}>
                              {s[key] && <Check size={9} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-sm text-gray-700">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Formatting */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Formatting</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Number format</label>
                          <select value={s.numberFormat} onChange={e => set('numberFormat', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none text-gray-700">
                            <option value="1,234.56">1,234.56</option>
                            <option value="1.234,56">1.234,56</option>
                            <option value="1 234.56">1 234.56</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Date format</label>
                          <select value={s.dateFormatDisplay} onChange={e => set('dateFormatDisplay', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none text-gray-700">
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            <option value="MMM DD, YYYY">MMM DD, YYYY</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Time format</label>
                          <select value={s.timeFormat} onChange={e => set('timeFormat', e.target.value as any)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none text-gray-700">
                            <option value="12h">12-hour (2:00 PM)</option>
                            <option value="24h">24-hour (14:00)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Default terms</label>
                          <select value={s.defaultPaymentTerms} onChange={e => set('defaultPaymentTerms', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none text-gray-700">
                            <option>Due on Receipt</option>
                            <option>Net 7</option>
                            <option>Net 15</option>
                            <option>Net 30</option>
                            <option>Net 60</option>
                            <option>Net 90</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* ─── Modal Footer ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => setS({ ...DEFAULT_INVOICE_SETTINGS })}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <RefreshCw size={13} /> Reset to Defaults
            </button>
            <button type="button"
              onClick={() => onApply(s)}
              className="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
              <Check size={14} /> Apply Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
