'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { X, Save, Eye, AlertCircle, Loader2, Check } from 'lucide-react'
import type { InvoiceTemplate, LayoutStyle, BorderStyle, LogoPosition, PaymentTerms, TaxTreatment, DateFormat, FontSize } from '@/lib/invoice-templates/types'
import { saveTemplate, updateTemplate } from '@/lib/invoice-templates/templateStorage'
import { EMPTY_TEMPLATE_DEFAULTS } from '@/lib/invoice-templates/defaultTemplates'
import TemplatePreview from './TemplatePreview'

interface Props {
  template: InvoiceTemplate | null   // null = create new
  onClose: () => void
  onSaved: () => void
}

type Tab = 'appearance' | 'settings' | 'content'

export default function TemplateEditor({ template, onClose, onSaved }: Props) {
  const isNew = template === null
  const [tab, setTab] = useState<Tab>('appearance')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  // Form state
  const [name, setName] = useState(template?.name ?? '')
  const [icon, setIcon] = useState(template?.icon ?? '📄')
  const [description, setDescription] = useState(template?.description ?? '')
  const [colors, setColors] = useState(template?.colors ?? EMPTY_TEMPLATE_DEFAULTS.colors)
  const [typography, setTypography] = useState(template?.typography ?? EMPTY_TEMPLATE_DEFAULTS.typography)
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>(template?.layoutStyle ?? 'modern')
  const [borderStyle, setBorderStyle] = useState<BorderStyle>(template?.borderStyle ?? 'solid')
  const [logoPosition, setLogoPosition] = useState<LogoPosition>(template?.logoPosition ?? 'top-left')
  const [defaults, setDefaults] = useState(template?.defaults ?? EMPTY_TEMPLATE_DEFAULTS.defaults)
  const [sections, setSections] = useState(template?.sections ?? EMPTY_TEMPLATE_DEFAULTS.sections)
  const [defaultMessage, setDefaultMessage] = useState(template?.defaultMessage ?? 'Thank you for your business!')
  const [defaultTerms, setDefaultTerms] = useState(template?.defaultTerms ?? '')
  const [footerText, setFooterText] = useState(template?.footerText ?? '')
  const [isDefault, setIsDefault] = useState(template?.isDefault ?? false)

  const handleSave = async () => {
    if (!name.trim()) { setError('Template name is required.'); return }
    setSaving(true); setError('')
    try {
      const data = { name: name.trim(), icon, description, colors, typography, layoutStyle, borderStyle, logoPosition, defaults, sections, defaultMessage, defaultTerms, footerText, isDefault, isDraft: false }
      if (!isNew && template) {
        updateTemplate(template.id, data)
      } else {
        saveTemplate(data)
      }
      onSaved()
    } catch {
      setError('Failed to save template.')
    } finally {
      setSaving(false)
    }
  }

  const currentTemplate: InvoiceTemplate = {
    id: template?.id ?? 'preview', name: name || 'Preview', icon, description, isBuiltIn: false,
    isDefault, isDraft: false, colors, typography, layoutStyle, borderStyle, logoPosition,
    defaults, sections, defaultMessage, defaultTerms, footerText,
    createdAt: '', updatedAt: '', usageCount: 0,
  }

  const ICONS = ['📄', '⚪', '🎨', '◆', '🏢', '✒', '📜', '🌟', '🔷', '🟢', '🔴', '⭐']
  const LAYOUT_OPTIONS: { value: LayoutStyle; label: string; desc: string }[] = [
    { value: 'classic', label: 'Classic', desc: 'Traditional table layout' },
    { value: 'modern', label: 'Modern', desc: 'Clean, spacious design' },
    { value: 'compact', label: 'Compact', desc: 'Dense, info-packed' },
    { value: 'minimal', label: 'Minimal', desc: 'Ultra-clean, no clutter' },
    { value: 'bold', label: 'Bold', desc: 'Heavy borders, strong' },
    { value: 'elegant', label: 'Elegant', desc: 'Light, airy feel' },
  ]
  const BORDER_OPTIONS: { value: BorderStyle; label: string }[] = [
    { value: 'solid', label: 'Solid lines' }, { value: 'dashed', label: 'Dashed lines' },
    { value: 'none', label: 'No borders' }, { value: 'double', label: 'Double line (formal)' },
    { value: 'rounded', label: 'Rounded corners' },
  ]
  const LOGO_OPTIONS: { value: LogoPosition; label: string }[] = [
    { value: 'top-left', label: 'Top Left' }, { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' }, { value: 'none', label: 'None' },
  ]
  const TERMS_OPTIONS: { value: PaymentTerms; label: string }[] = [
    { value: 'due-on-receipt', label: 'Due on Receipt' }, { value: 'net-15', label: 'Net 15' },
    { value: 'net-30', label: 'Net 30' }, { value: 'net-45', label: 'Net 45' },
    { value: 'net-60', label: 'Net 60' }, { value: 'eom', label: 'End of Month' },
    { value: 'custom', label: 'Custom' },
  ]
  const SECTION_LABELS: Record<keyof typeof sections, string> = {
    companyLogo: 'Company logo & header', customerAddress: 'Customer address',
    shippingAddress: 'Shipping address', paymentTermsText: 'Payment terms text',
    notesField: 'Notes / Message field', bankDetails: 'Bank payment details',
    thankYouMessage: 'Thank you message', termsAndConditions: 'Terms & Conditions',
    footerNotes: 'Footer notes', qrCode: 'QR Code (quick pay)',
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <h2 className="text-base font-bold text-gray-900">{isNew ? 'Create Template' : `Edit: ${template?.name}`}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setPreview(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Eye size={12} /> Preview
              </button>
              <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 flex-shrink-0">
            {(['appearance', 'settings', 'content'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 ${tab === t ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto">
            {/* ── APPEARANCE ── */}
            {tab === 'appearance' && (
              <div className="p-5 space-y-5">
                {/* Name + Icon */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Icon</label>
                    <div className="flex flex-wrap gap-1.5">
                      {ICONS.map(ic => (
                        <button key={ic} onClick={() => setIcon(ic)}
                          className={`w-8 h-8 text-base rounded-lg transition-colors ${icon === ic ? 'bg-emerald-100 ring-2 ring-emerald-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Template Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Business Template"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                    <label className="block text-xs font-medium text-gray-700 mb-1 mt-3">Description</label>
                    <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description…"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Color Scheme</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([['primary', 'Primary Color'], ['accent', 'Accent Color'], ['background', 'Background'], ['text', 'Text Color']] as const).map(([k, label]) => (
                      <div key={k} className="flex items-center gap-2">
                        <input type="color" value={colors[k]} onChange={e => setColors(p => ({ ...p, [k]: e.target.value }))}
                          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">{label}</p>
                          <p className="text-xs text-gray-400 font-mono">{colors[k]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layout */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Layout Style</p>
                  <div className="grid grid-cols-3 gap-2">
                    {LAYOUT_OPTIONS.map(o => (
                      <button key={o.value} onClick={() => setLayoutStyle(o.value)}
                        className={`border rounded-lg p-2.5 text-left transition-colors ${layoutStyle === o.value ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <p className="text-xs font-semibold text-gray-800">{o.label}</p>
                        <p className="text-xs text-gray-400">{o.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border + Logo */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Border Style</p>
                    <div className="space-y-1.5">
                      {BORDER_OPTIONS.map(o => (
                        <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={borderStyle === o.value} onChange={() => setBorderStyle(o.value)} className="text-emerald-600" />
                          <span className="text-sm text-gray-700">{o.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Logo Position</p>
                    <div className="space-y-1.5">
                      {LOGO_OPTIONS.map(o => (
                        <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={logoPosition === o.value} onChange={() => setLogoPosition(o.value)} className="text-emerald-600" />
                          <span className="text-sm text-gray-700">{o.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SETTINGS ── */}
            {tab === 'settings' && (
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Payment Terms</p>
                    <div className="space-y-1.5">
                      {TERMS_OPTIONS.map(o => (
                        <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={defaults.paymentTerms === o.value} onChange={() => setDefaults(p => ({ ...p, paymentTerms: o.value }))} className="text-emerald-600" />
                          <span className="text-sm text-gray-700">{o.label}</span>
                        </label>
                      ))}
                    </div>
                    {defaults.paymentTerms === 'custom' && (
                      <div className="mt-2 flex items-center gap-2">
                        <input type="number" min={1} value={defaults.customPaymentDays ?? 30}
                          onChange={e => setDefaults(p => ({ ...p, customPaymentDays: Number(e.target.value) }))}
                          className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
                        <span className="text-sm text-gray-500">days</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Tax Treatment</p>
                    {([['inclusive', 'Tax inclusive (prices include tax)'], ['exclusive', 'Tax exclusive (add tax on top)'], ['none', 'No tax']] as const).map(([v, label]) => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer mb-1.5">
                        <input type="radio" checked={defaults.taxTreatment === v} onChange={() => setDefaults(p => ({ ...p, taxTreatment: v }))} className="text-emerald-600" />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                    {defaults.taxTreatment !== 'none' && (
                      <div className="mt-2">
                        <label className="block text-xs text-gray-600 mb-1">Default Tax Rate</label>
                        <div className="flex items-center gap-1">
                          <input type="number" min={0} max={100} step={0.5} value={defaults.defaultTaxRate}
                            onChange={e => setDefaults(p => ({ ...p, defaultTaxRate: Number(e.target.value) }))}
                            className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Currency</label>
                    <select value={defaults.currency} onChange={e => setDefaults(p => ({ ...p, currency: e.target.value }))}
                      className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
                      {['PHP', 'USD', 'EUR', 'GBP', 'SGD', 'AUD', 'JPY'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Decimal Places</label>
                    <select value={defaults.decimalPlaces} onChange={e => setDefaults(p => ({ ...p, decimalPlaces: Number(e.target.value) }))}
                      className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
                      {[0, 1, 2, 3].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Date Format</label>
                    <select value={defaults.dateFormat} onChange={e => setDefaults(p => ({ ...p, dateFormat: e.target.value as DateFormat }))}
                      className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
                      {(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MMM DD, YYYY'] as DateFormat[]).map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                {/* Sections */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Sections to Show</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(sections) as Array<keyof typeof sections>).map(key => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={sections[key]} onChange={e => setSections(p => ({ ...p, [key]: e.target.checked }))}
                          className="rounded text-emerald-600" />
                        <span className="text-sm text-gray-700">{SECTION_LABELS[key]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Is Default */}
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="rounded text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Set as default template</p>
                    <p className="text-xs text-emerald-600/70">New invoices will use this template automatically</p>
                  </div>
                </label>
              </div>
            )}

            {/* ── CONTENT ── */}
            {tab === 'content' && (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Message to Customer</label>
                  <textarea value={defaultMessage} onChange={e => setDefaultMessage(e.target.value)} rows={3}
                    placeholder="Thank you for your business! Use {terms} for payment terms placeholder."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y" />
                  <p className="text-xs text-gray-400 mt-1">Use <code className="bg-gray-100 px-1 rounded">{'{terms}'}</code> to insert payment terms (e.g. "Net 30")</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Terms & Conditions</label>
                  <textarea value={defaultTerms} onChange={e => setDefaultTerms(e.target.value)} rows={4}
                    placeholder="e.g. Late payments subject to 1.5% monthly interest…"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Footer Note</label>
                  <input value={footerText} onChange={e => setFooterText(e.target.value)}
                    placeholder="e.g. Registered business · VAT Reg No. 123-456-789"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600"><AlertCircle size={13} />{error}</div>
            )}
            {!error && <div />}
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isNew ? 'Create Template' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {preview && (
        <TemplatePreview template={currentTemplate} onClose={() => setPreview(false)} />
      )}
    </>
  )
}
