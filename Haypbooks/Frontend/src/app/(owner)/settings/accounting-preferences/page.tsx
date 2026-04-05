'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Settings, Save, RotateCcw, DollarSign, Calendar, Hash,
  AlertTriangle, Bell, ChevronRight, Lock, CheckCircle, Loader2,
} from 'lucide-react'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AccountingPreferences {
  // Financial
  defaultTaxTreatment: 'inclusive' | 'exclusive' | 'none'
  defaultTaxRate: number
  defaultPaymentTerms: string
  // Formatting
  dateFormat: string
  numberFormat: string
  decimalPlaces: number
  // Late Fees
  lateFeeEnabled: boolean
  lateFeeType: 'percentage' | 'flat'
  lateFeeRate: number
  lateFeeGracePeriod: number
  lateFeeMaxCap: number | null
  // Reminders
  reminderEnabled: boolean
  reminderDaysBefore: number
  reminderDaysAfter: number
  reminderRepeatDays: number
  // Read-only from Company model
  baseCurrency?: string
}

const DEFAULTS: AccountingPreferences = {
  defaultTaxTreatment: 'exclusive',
  defaultTaxRate: 12,
  defaultPaymentTerms: 'net-30',
  dateFormat: 'MMM DD, YYYY',
  numberFormat: '1,234.56',
  decimalPlaces: 2,
  lateFeeEnabled: false,
  lateFeeType: 'percentage',
  lateFeeRate: 5,
  lateFeeGracePeriod: 7,
  lateFeeMaxCap: null,
  reminderEnabled: false,
  reminderDaysBefore: 3,
  reminderDaysAfter: 7,
  reminderRepeatDays: 7,
}

const PAYMENT_TERMS_OPTIONS = [
  { value: 'due-on-receipt', label: 'Due on Receipt' },
  { value: 'net-15', label: 'Net 15' },
  { value: 'net-30', label: 'Net 30 (Recommended)' },
  { value: 'net-45', label: 'Net 45' },
  { value: 'net-60', label: 'Net 60' },
  { value: 'end-of-month', label: 'End of Month' },
  { value: 'custom', label: 'Custom' },
]

const DATE_FORMAT_OPTIONS = [
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'YYYY-MM-DD',
  'MMM DD, YYYY',
  'DDD, MMM DD, YYYY',
]

const NUMBER_FORMAT_OPTIONS = [
  { value: '1234.56', label: '1234.56 (No separator)' },
  { value: '1,234.56', label: '1,234.56 (Comma thousands)' },
  { value: '1.234,56', label: '1.234,56 (European)' },
  { value: '1 234.56', label: '1 234.56 (Space thousands)' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPreviewDate(fmt: string): string {
  const now = new Date(2026, 3, 5) // Apr 05, 2026
  const pad = (n: number) => String(n).padStart(2, '0')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  switch (fmt) {
    case 'MM/DD/YYYY': return `${pad(now.getMonth()+1)}/${pad(now.getDate())}/${now.getFullYear()}`
    case 'DD/MM/YYYY': return `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`
    case 'YYYY-MM-DD': return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`
    case 'MMM DD, YYYY': return `${months[now.getMonth()]} ${pad(now.getDate())}, ${now.getFullYear()}`
    case 'DDD, MMM DD, YYYY': return `${days[now.getDay()]}, ${months[now.getMonth()]} ${pad(now.getDate())}, ${now.getFullYear()}`
    default: return fmt
  }
}

function formatPreviewNumber(fmt: string, decimals: number): string {
  const num = 1234.5678
  const fixed = num.toFixed(decimals)
  const [integer, decimal] = fixed.split('.')
  switch (fmt) {
    case '1234.56': return decimal !== undefined ? `${integer}.${decimal}` : integer
    case '1,234.56': return (decimal !== undefined ? `${parseInt(integer).toLocaleString('en-US')}.${decimal}` : parseInt(integer).toLocaleString('en-US'))
    case '1.234,56': return (decimal !== undefined ? `${parseInt(integer).toLocaleString('de-DE')},${decimal}` : parseInt(integer).toLocaleString('de-DE'))
    case '1 234.56': return (decimal !== undefined ? `${parseInt(integer).toLocaleString('fr-FR')}.${decimal}` : parseInt(integer).toLocaleString('fr-FR'))
    default: return fixed
  }
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AccountingPreferencesPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const toast = useToast()

  const [prefs, setPrefs] = useState<AccountingPreferences>(DEFAULTS)
  const [customPaymentDays, setCustomPaymentDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load on mount
  useEffect(() => {
    if (!companyId) return
    setLoading(true)
    Promise.all([
      fetch(`/api/companies/${companyId}/settings`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
      fetch(`/api/companies/${companyId}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null),
    ]).then(([settings, company]) => {
      if (settings) {
        setPrefs(p => ({
          ...p,
          defaultTaxTreatment: settings.defaultTaxTreatment ?? p.defaultTaxTreatment,
          defaultTaxRate: settings.defaultTaxRate ?? p.defaultTaxRate,
          defaultPaymentTerms: settings.defaultPaymentTerms ?? p.defaultPaymentTerms,
          dateFormat: settings.dateFormat ?? p.dateFormat,
          numberFormat: settings.numberFormat ?? p.numberFormat,
          decimalPlaces: settings.decimalPlaces ?? p.decimalPlaces,
          lateFeeEnabled: settings.lateFeeEnabled ?? p.lateFeeEnabled,
          lateFeeType: settings.lateFeeType ?? p.lateFeeType,
          lateFeeRate: settings.lateFeeRate ?? p.lateFeeRate,
          lateFeeGracePeriod: settings.lateFeeGracePeriod ?? p.lateFeeGracePeriod,
          lateFeeMaxCap: settings.lateFeeMaxCap ?? p.lateFeeMaxCap,
          reminderEnabled: settings.reminderEnabled ?? p.reminderEnabled,
          reminderDaysBefore: settings.reminderDaysBefore ?? p.reminderDaysBefore,
          reminderDaysAfter: settings.reminderDaysAfter ?? p.reminderDaysAfter,
          reminderRepeatDays: settings.reminderRepeatDays ?? p.reminderRepeatDays,
          baseCurrency: company?.currency ?? 'PHP',
        }))
        if (settings.defaultPaymentTerms === 'custom' && settings.customPaymentDays) {
          setCustomPaymentDays(settings.customPaymentDays)
        }
      } else if (company) {
        setPrefs(p => ({ ...p, baseCurrency: company.currency ?? 'PHP' }))
      }
    }).finally(() => setLoading(false))
  }, [companyId])

  const set = useCallback(<K extends keyof AccountingPreferences>(key: K, val: AccountingPreferences[K]) => {
    setPrefs(p => ({ ...p, [key]: val }))
    setDirty(true)
    setSaved(false)
  }, [])

  const handleSave = async () => {
    if (!companyId) return
    setSaving(true)
    try {
      const payload: any = { ...prefs }
      if (prefs.defaultPaymentTerms === 'custom') payload.customPaymentDays = customPaymentDays
      delete payload.baseCurrency // read-only
      const res = await fetch(`/api/companies/${companyId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save')
      setDirty(false)
      setSaved(true)
      toast.push({ type: 'success', message: 'Accounting preferences saved.' })
    } catch {
      toast.push({ type: 'error', message: 'Could not save preferences.' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setPrefs(p => ({ ...DEFAULTS, baseCurrency: p.baseCurrency }))
    setDirty(true)
    setSaved(false)
  }

  if (cidLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={22} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  const isCustomTerms = prefs.defaultPaymentTerms === 'custom'

  return (
    <div className="max-w-3xl mx-auto py-8 px-6 space-y-8">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Accounting Preferences</h1>
            <p className="text-sm text-gray-500 mt-0.5">Global defaults applied to all new invoices</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle size={13} /> Saved
            </span>
          )}
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RotateCcw size={13} /> Reset to Defaults
          </button>
          <button onClick={handleSave} disabled={saving || !dirty}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Architecture note */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
        <p className="font-semibold text-blue-800 mb-1">📐 Settings Hierarchy</p>
        <p>These are <strong>global defaults</strong> for all new invoices. Templates control visual appearance only.
        Per-invoice overrides can be set in the Invoice Settings modal when creating an invoice.</p>
        <div className="flex items-center gap-1 mt-2">
          <ChevronRight size={11} />
          <span>Currency is set in </span>
          <Link href="/settings/company-profile/base-currency" className="font-semibold underline">Company Profile → Base Currency</Link>
        </div>
      </div>

      {/* ── SECTION 1: Financial Defaults ─────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <SectionHeader
          icon={<DollarSign size={16} />}
          title="Financial Defaults"
          description="Tax treatment and base currency for all invoices"
        />

        {/* Base Currency (read-only) */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Base Currency</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 w-32">
              <Lock size={12} className="text-gray-400" />
              {prefs.baseCurrency ?? 'PHP'}
            </div>
            <span className="text-xs text-gray-400">
              Change in{' '}
              <Link href="/settings/company-profile/base-currency" className="text-emerald-600 hover:underline">
                Company Profile → Base Currency
              </Link>
            </span>
          </div>
        </div>

        {/* Tax Treatment */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-700 mb-2.5">Default Tax Treatment</label>
          <div className="grid grid-cols-3 gap-2.5">
            {([['exclusive', 'Tax Exclusive', 'Tax added on top of prices'], ['inclusive', 'Tax Inclusive', 'Prices already include tax'], ['none', 'No Tax', 'Invoices have no tax']] as const).map(([v, label, desc]) => (
              <label key={v} className={`flex flex-col gap-1 p-3 border rounded-xl cursor-pointer transition-all ${prefs.defaultTaxTreatment === v ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" name="taxTreatment" checked={prefs.defaultTaxTreatment === v} onChange={() => set('defaultTaxTreatment', v)} className="text-emerald-600" />
                  <span className="text-xs font-semibold text-gray-800">{label}</span>
                </div>
                <p className="text-xs text-gray-400 pl-5">{desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Default Tax Rate */}
        {prefs.defaultTaxTreatment !== 'none' && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Default Tax Rate</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min={0} max={100} step={0.5}
                value={prefs.defaultTaxRate}
                onChange={e => set('defaultTaxRate', Number(e.target.value))}
                className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <span className="text-sm text-gray-500">%</span>
              <span className="text-xs text-gray-400">Applied when tax treatment is not None</span>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 2: Formatting Defaults ────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <SectionHeader
          icon={<Calendar size={16} />}
          title="Formatting Defaults"
          description="How dates and numbers are displayed on invoices"
        />

        <div className="grid grid-cols-3 gap-6">
          {/* Date Format */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Date Format</label>
            <select
              value={prefs.dateFormat}
              onChange={e => set('dateFormat', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              {DATE_FORMAT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <p className="text-xs text-emerald-600 mt-1.5 font-medium">
              Preview: {formatPreviewDate(prefs.dateFormat)}
            </p>
          </div>

          {/* Number Format */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Number Format</label>
            <select
              value={prefs.numberFormat}
              onChange={e => set('numberFormat', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              {NUMBER_FORMAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="text-xs text-emerald-600 mt-1.5 font-medium">
              Preview: {formatPreviewNumber(prefs.numberFormat, prefs.decimalPlaces)}
            </p>
          </div>

          {/* Decimal Places */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Decimal Places</label>
            <select
              value={prefs.decimalPlaces}
              onChange={e => set('decimalPlaces', Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n} decimal{n !== 1 ? 's' : ''}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1.5">
              1234.5678 → {(1234.5678).toFixed(prefs.decimalPlaces)}
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Payment Terms Default ──────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <SectionHeader
          icon={<Hash size={16} />}
          title="Default Payment Terms"
          description="Applied to new invoices unless overridden per-invoice"
        />

        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_TERMS_OPTIONS.map(o => (
            <label key={o.value} className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all ${prefs.defaultPaymentTerms === o.value ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input
                type="radio"
                name="paymentTerms"
                checked={prefs.defaultPaymentTerms === o.value}
                onChange={() => set('defaultPaymentTerms', o.value)}
                className="text-emerald-600"
              />
              <span className="text-xs font-medium text-gray-800">{o.label}</span>
            </label>
          ))}
        </div>

        {isCustomTerms && (
          <div className="mt-4 flex items-center gap-3">
            <label className="text-xs font-medium text-gray-700">Custom days:</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min={1} max={365}
                value={customPaymentDays}
                onChange={e => { setCustomPaymentDays(Number(e.target.value)); setDirty(true) }}
                className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <span className="text-sm text-gray-500">days after invoice date</span>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 4: Late Fees ───────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <SectionHeader
          icon={<AlertTriangle size={16} />}
          title="Late Fees (Global Defaults)"
          description="Default late fee rules applied to new invoices. Can be overridden per-invoice."
        />

        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <div className={`relative w-10 h-5 rounded-full transition-colors ${prefs.lateFeeEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.lateFeeEnabled ? 'left-5' : 'left-0.5'}`} />
          </div>
          <input type="checkbox" checked={prefs.lateFeeEnabled} onChange={e => set('lateFeeEnabled', e.target.checked)} className="sr-only" />
          <span className="text-sm font-medium text-gray-700">Enable automatic late fees</span>
        </label>

        {prefs.lateFeeEnabled && (
          <div className="pl-4 border-l-2 border-emerald-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Fee Type</label>
                <div className="flex gap-3">
                  {([['percentage', '% of invoice total'], ['flat', 'Flat amount']] as const).map(([v, label]) => (
                    <label key={v} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer text-xs transition-all ${prefs.lateFeeType === v ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'}`}>
                      <input type="radio" name="lateFeeType" checked={prefs.lateFeeType === v} onChange={() => set('lateFeeType', v)} className="text-emerald-600" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  {prefs.lateFeeType === 'percentage' ? 'Rate (%)' : 'Amount'}
                </label>
                <div className="flex items-center gap-2">
                  {prefs.lateFeeType === 'flat' && <span className="text-sm text-gray-500">{prefs.baseCurrency ?? 'PHP'}</span>}
                  <input
                    type="number" min={0} step={0.5}
                    value={prefs.lateFeeRate}
                    onChange={e => set('lateFeeRate', Number(e.target.value))}
                    className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
                  />
                  {prefs.lateFeeType === 'percentage' && <span className="text-sm text-gray-500">%</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Grace Period</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={0}
                    value={prefs.lateFeeGracePeriod}
                    onChange={e => set('lateFeeGracePeriod', Number(e.target.value))}
                    className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
                  />
                  <span className="text-xs text-gray-500">days after due date before fee applies</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Maximum Cap</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{prefs.baseCurrency ?? 'PHP'}</span>
                  <input
                    type="number" min={0}
                    value={prefs.lateFeeMaxCap ?? 0}
                    onChange={e => set('lateFeeMaxCap', Number(e.target.value) === 0 ? null : Number(e.target.value))}
                    className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">0 = no cap</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 5: Reminders ──────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <SectionHeader
          icon={<Bell size={16} />}
          title="Payment Reminders (Global Defaults)"
          description="Automatic email reminders for open invoices. Overridable per-invoice."
        />

        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <div className={`relative w-10 h-5 rounded-full transition-colors ${prefs.reminderEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.reminderEnabled ? 'left-5' : 'left-0.5'}`} />
          </div>
          <input type="checkbox" checked={prefs.reminderEnabled} onChange={e => set('reminderEnabled', e.target.checked)} className="sr-only" />
          <span className="text-sm font-medium text-gray-700">Enable automatic payment reminders</span>
        </label>

        {prefs.reminderEnabled && (
          <div className="pl-4 border-l-2 border-emerald-100 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">First Reminder</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={0}
                    value={prefs.reminderDaysBefore}
                    onChange={e => set('reminderDaysBefore', Number(e.target.value))}
                    className="w-16 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
                  />
                  <span className="text-xs text-gray-500">days before due</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Overdue Notice</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={0}
                    value={prefs.reminderDaysAfter}
                    onChange={e => set('reminderDaysAfter', Number(e.target.value))}
                    className="w-16 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
                  />
                  <span className="text-xs text-gray-500">days after due</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Repeat Every</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={1}
                    value={prefs.reminderRepeatDays}
                    onChange={e => set('reminderRepeatDays', Number(e.target.value))}
                    className="w-16 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
                  />
                  <span className="text-xs text-gray-500">days while overdue</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom save bar */}
      {dirty && (
        <div className="sticky bottom-6 flex justify-end">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-lg">
            <span className="text-xs text-gray-500">You have unsaved changes</span>
            <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Discard
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
