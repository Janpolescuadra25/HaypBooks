'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { X, Save, AlertCircle, Loader2, Upload } from 'lucide-react'
import type { InvoiceTemplate, LayoutStyle, BorderStyle, LogoPosition, LogoSize } from '@/lib/invoice-templates/types'
import { saveTemplate, updateTemplate } from '@/lib/invoice-templates/templateStorage'
import { EMPTY_TEMPLATE_DEFAULTS } from '@/lib/invoice-templates/defaultTemplates'

interface Props {
  template: InvoiceTemplate | null
  onClose: () => void
  onSaved: () => void
}

type Tab = 'appearance' | 'content'

const FAKE_INVOICE = {
  number: 'INV-2026-0042',
  date: 'Apr 5, 2026',
  dueDate: 'May 5, 2026',
  from: { name: 'Acme Corporation', address: '123 Business St., Manila, PH', email: 'billing@acme.ph' },
  to: { name: 'Sample Customer Inc.', address: '456 Client Ave., Quezon City', email: 'accounts@sampleco.ph' },
  items: [
    { description: 'Web Design Services', quantity: 1, unitPrice: 25000, amount: 25000 },
    { description: 'Monthly Maintenance', quantity: 3, unitPrice: 5000, amount: 15000 },
    { description: 'Domain & Hosting', quantity: 1, unitPrice: 3500, amount: 3500 },
  ],
  subtotal: 43500, tax: 5220, total: 48720,
  terms: 'Net 30',
  notes: 'BDO Unibank · 00123-456-789',
}

export default function TemplateEditor({ template, onClose, onSaved }: Props) {
  const isNew = template === null
  const [tab, setTab] = useState<Tab>('appearance')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(template?.name ?? '')
  const [icon, setIcon] = useState(template?.icon ?? '📄')
  const [description, setDescription] = useState(template?.description ?? '')
  const [colors, setColors] = useState(template?.colors ?? EMPTY_TEMPLATE_DEFAULTS.colors)
  const [typography, setTypography] = useState(template?.typography ?? EMPTY_TEMPLATE_DEFAULTS.typography)
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>(template?.layoutStyle ?? 'modern')
  const [borderStyle, setBorderStyle] = useState<BorderStyle>(template?.borderStyle ?? 'solid')
  const [logoPosition, setLogoPosition] = useState<LogoPosition>(template?.logoPosition ?? 'top-left')
  const [logoBase64, setLogoBase64] = useState<string | undefined>(template?.logoBase64)
  const [logoSize, setLogoSize] = useState<LogoSize>(template?.logoSize ?? 'medium')
  const [logoShowOnPrint, setLogoShowOnPrint] = useState(template?.logoShowOnPrint ?? true)
  const [logoShowOnEmail, setLogoShowOnEmail] = useState(template?.logoShowOnEmail ?? true)
  const [logoShowOnPayor, setLogoShowOnPayor] = useState(template?.logoShowOnPayor ?? true)
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
      const data = {
        name: name.trim(), icon, description, colors, typography, layoutStyle, borderStyle,
        logoPosition, logoBase64, logoSize, logoShowOnPrint, logoShowOnEmail, logoShowOnPayor,
        defaults, sections, defaultMessage, defaultTerms, footerText, isDefault, isDraft: false,
      }
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

  const handleLogoUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) { setError('Logo must be under 2 MB.'); return }
    const reader = new FileReader()
    reader.onload = e => setLogoBase64(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleLogoUpload(file)
  }, [handleLogoUpload])

  const c = colors

  const borderClass = {
    solid: 'border border-gray-200',
    dashed: 'border border-dashed border-gray-300',
    none: '',
    double: 'border-4 border-double border-gray-300',
    rounded: 'border border-gray-200 rounded-2xl',
  }[borderStyle] ?? 'border border-gray-200'

  const tableClass = {
    classic: 'border border-gray-200',
    modern: 'rounded-xl overflow-hidden',
    compact: 'border border-gray-100 text-xs',
    minimal: '',
    bold: 'border-2 border-gray-800',
    elegant: 'border border-gray-100 rounded-lg',
  }[layoutStyle] ?? ''

  const logoHeightPx = { small: 40, medium: 64, large: 90 }[logoSize] ?? 64

  const ICONS = ['📄', '⚪', '🎨', '◆', '🏢', '✒', '📜', '🌟', '🔷', '🟢', '🔴', '⭐']
  const LAYOUT_OPTIONS: { value: LayoutStyle; label: string; desc: string }[] = [
    { value: 'classic', label: 'Classic', desc: 'Traditional table' },
    { value: 'modern', label: 'Modern', desc: 'Clean, spacious' },
    { value: 'compact', label: 'Compact', desc: 'Info-packed' },
    { value: 'minimal', label: 'Minimal', desc: 'Ultra-clean' },
    { value: 'bold', label: 'Bold', desc: 'Strong borders' },
    { value: 'elegant', label: 'Elegant', desc: 'Light, airy' },
  ]
  const BORDER_OPTIONS: { value: BorderStyle; label: string }[] = [
    { value: 'solid', label: 'Solid lines' }, { value: 'dashed', label: 'Dashed lines' },
    { value: 'none', label: 'No borders' }, { value: 'double', label: 'Double line' },
    { value: 'rounded', label: 'Rounded corners' },
  ]
  const LOGO_POS_OPTIONS: { value: LogoPosition; label: string }[] = [
    { value: 'top-left', label: 'Top Left' }, { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' }, { value: 'none', label: 'No Logo' },
  ]
  const LOGO_SIZE_OPTIONS: { value: LogoSize; label: string; px: string }[] = [
    { value: 'small', label: 'Small', px: '60px' },
    { value: 'medium', label: 'Medium', px: '100px' },
    { value: 'large', label: 'Large', px: '140px' },
  ]
  const SECTION_LABELS: Record<keyof typeof sections, string> = {
    companyLogo: 'Company logo', customerAddress: 'Customer address',
    shippingAddress: 'Shipping address', paymentTermsText: 'Payment terms',
    notesField: 'Notes field', bankDetails: 'Bank details',
    thankYouMessage: 'Thank you message', termsAndConditions: 'Terms & Conditions',
    footerNotes: 'Footer notes', qrCode: 'QR Code',
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">{isNew ? 'Create Template' : `Edit: ${template?.name}`}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0">

          {/* LEFT: Editor panel (42%) */}
          <div className="w-[42%] flex flex-col border-r border-gray-100 min-h-0">
            <div className="flex border-b border-gray-100 flex-shrink-0">
              {([['appearance', 'Appearance'], ['content', 'Content & Display']] as [Tab, string][]).map(([t, label]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2.5 text-xs font-semibold transition-colors border-b-2 ${tab === t ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">

              {/* ── APPEARANCE ── */}
              {tab === 'appearance' && (
                <div className="p-4 space-y-5">
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
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                      <label className="block text-xs font-medium text-gray-700 mb-1 mt-2.5">Description</label>
                      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description…"
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Company Logo</p>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f) }} />

                    {logoBase64 ? (
                      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50">
                        <img src={logoBase64} alt="Logo preview" className="object-contain rounded" style={{ height: 44, maxWidth: 110 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700">Logo uploaded</p>
                          <p className="text-xs text-gray-400">PNG / JPG / SVG / WEBP</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => fileInputRef.current?.click()}
                            className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">Replace</button>
                          <button onClick={() => setLogoBase64(undefined)}
                            className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors text-gray-600">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                        className="border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 rounded-xl p-5 text-center cursor-pointer transition-colors">
                        <Upload size={20} className="mx-auto mb-1.5 text-gray-300" />
                        <p className="text-xs font-medium text-gray-500">Click to upload logo</p>
                        <p className="text-xs text-gray-400 mt-0.5">or drag and drop here</p>
                        <p className="text-xs text-gray-300 mt-1.5">PNG, JPG, SVG, WEBP · Max 2 MB</p>
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Position</label>
                        <select value={logoPosition} onChange={e => setLogoPosition(e.target.value as LogoPosition)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none">
                          {LOGO_POS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Size</label>
                        <select value={logoSize} onChange={e => setLogoSize(e.target.value as LogoSize)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none">
                          {LOGO_SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} ({o.px})</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      {([
                        ['Show on printed / PDF invoice', logoShowOnPrint, setLogoShowOnPrint] as [string, boolean, (v: boolean) => void],
                        ['Show in email preview', logoShowOnEmail, setLogoShowOnEmail] as [string, boolean, (v: boolean) => void],
                        ['Show in online payor view', logoShowOnPayor, setLogoShowOnPayor] as [string, boolean, (v: boolean) => void],
                      ]).map(([label, val, set]) => (
                        <label key={label} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="rounded text-emerald-600" />
                          <span className="text-xs text-gray-600">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Color Scheme</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {([['primary', 'Primary'], ['accent', 'Accent'], ['background', 'Background'], ['text', 'Text']] as const).map(([k, label]) => (
                        <div key={k} className="flex items-center gap-2">
                          <input type="color" value={colors[k]} onChange={e => setColors(p => ({ ...p, [k]: e.target.value }))}
                            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0" />
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
                    <div className="grid grid-cols-3 gap-1.5">
                      {LAYOUT_OPTIONS.map(o => (
                        <button key={o.value} onClick={() => setLayoutStyle(o.value)}
                          className={`border rounded-lg p-2 text-left transition-colors ${layoutStyle === o.value ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}>
                          <p className="text-xs font-semibold text-gray-800">{o.label}</p>
                          <p className="text-xs text-gray-400">{o.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Border Style</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {BORDER_OPTIONS.map(o => (
                        <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={borderStyle === o.value} onChange={() => setBorderStyle(o.value)} className="text-emerald-600" />
                          <span className="text-xs text-gray-700">{o.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── CONTENT & DISPLAY ── */}
              {tab === 'content' && (
                <div className="p-4 space-y-4">
                  {/* Global settings redirect banner */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                    <p className="font-semibold text-blue-800 mb-1">📝 Template-Specific Content</p>
                    <p className="text-blue-600 leading-relaxed">
                      These settings control <strong>visual appearance and print text for this template only</strong>.
                    </p>
                    <p className="text-blue-600 mt-1 leading-relaxed">
                      Global defaults (currency, tax, payment terms, date format) are in:{' '}
                      <strong>Settings → Preferences → Accounting</strong>
                    </p>
                  </div>

                  {/* Sections to Show */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Sections Visibility</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(sections) as Array<keyof typeof sections>).map(key => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={sections[key]} onChange={e => setSections(p => ({ ...p, [key]: e.target.checked }))}
                            className="rounded text-emerald-600" />
                          <span className="text-xs text-gray-700">{SECTION_LABELS[key]}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Print/PDF content */}
                  <div className="pt-1 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                      <span className="w-4 h-px bg-gray-300 inline-block" />
                      Print &amp; PDF Content (this template only)
                      <span className="w-4 h-px bg-gray-300 inline-block" />
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Print Footer Message</label>
                        <textarea value={defaultMessage} onChange={e => setDefaultMessage(e.target.value)} rows={3}
                          placeholder="Thank you for your business! Use {terms} for payment terms."
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y" />
                        <p className="text-xs text-gray-400 mt-1">Appears as a thank-you note at the bottom of the printed PDF.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Terms & Conditions</label>
                        <textarea value={defaultTerms} onChange={e => setDefaultTerms(e.target.value)} rows={4}
                          placeholder="e.g. Late payments subject to 1.5% monthly interest…"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Footer Note</label>
                        <input value={footerText} onChange={e => setFooterText(e.target.value)}
                          placeholder="e.g. Registered business · VAT Reg No. 123-456-789"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        <p className="text-xs text-gray-400 mt-1">Shows in the very bottom footer of the printed invoice.</p>
                      </div>
                    </div>
                  </div>

                  {/* Set as default */}
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="rounded text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-800">Set as default template</p>
                      <p className="text-xs text-emerald-600/70">New invoices use this automatically</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
              {error ? (
                <div className="flex items-center gap-1.5 text-xs text-red-600"><AlertCircle size={13} />{error}</div>
              ) : <div />}
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {isNew ? 'Create Template' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview (58%) */}
          <div className="flex-1 flex flex-col min-h-0 bg-gray-100">
            <div className="px-4 py-2 bg-white border-b border-gray-100 flex-shrink-0 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Preview</span>
              <span className="text-xs text-gray-400 ml-auto">Updates as you edit</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className={`mx-auto max-w-lg bg-white shadow-lg p-6 ${borderClass}`}
                style={{ background: c.background, color: c.text }}>

                {/* Invoice header */}
                <div className={`flex items-start justify-between mb-6 ${logoPosition === 'top-center' ? 'flex-col items-center text-center gap-3' : ''}`}>
                  {sections.companyLogo && logoPosition !== 'none' && (
                    <div className={logoPosition === 'top-right' ? 'order-2' : ''}>
                      {logoBase64 ? (
                        <img src={logoBase64} alt="Logo" className="object-contain rounded"
                          style={{ height: logoHeightPx, maxWidth: logoHeightPx * 2 }} />
                      ) : (
                        <div className="rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: c.primary, width: Math.round(logoHeightPx * 1.6), height: logoHeightPx }}>
                          LOGO
                        </div>
                      )}
                      <p className="text-xs font-semibold mt-1" style={{ color: c.primary }}>{FAKE_INVOICE.from.name}</p>
                      <p className="text-xs opacity-60">{FAKE_INVOICE.from.address}</p>
                    </div>
                  )}
                  <div className={`${logoPosition === 'top-right' ? 'order-1 text-left' : ''} ${logoPosition === 'top-center' ? 'text-center' : 'text-right'}`}>
                    <h1 className="text-xl font-bold tracking-wide" style={{ color: c.primary }}>INVOICE</h1>
                    <p className="text-xs font-semibold opacity-70 mt-0.5">{FAKE_INVOICE.number}</p>
                  </div>
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-3 gap-3 mb-5 text-xs">
                  <div>
                    <p className="font-semibold opacity-50 uppercase tracking-wider mb-1">Bill To</p>
                    <p className="font-semibold">{FAKE_INVOICE.to.name}</p>
                    <p className="opacity-60">{FAKE_INVOICE.to.address}</p>
                  </div>
                  <div>
                    <p className="font-semibold opacity-50 uppercase tracking-wider mb-1">Invoice Date</p>
                    <p>{FAKE_INVOICE.date}</p>
                    <p className="mt-1.5 font-semibold opacity-50 uppercase tracking-wider">Due Date</p>
                    <p>{FAKE_INVOICE.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold opacity-50 uppercase tracking-wider mb-1">Amount Due</p>
                    <p className="text-base font-bold" style={{ color: c.primary }}>₱{FAKE_INVOICE.total.toLocaleString()}</p>
                    <p className="mt-1 opacity-60">Terms: {FAKE_INVOICE.terms}</p>
                  </div>
                </div>

                <div className="mb-3 h-px" style={{ background: c.primary + '30' }} />

                {/* Line items */}
                <table className={`w-full text-xs mb-3 ${tableClass}`}>
                  <thead>
                    <tr style={{ background: c.primary }}>
                      {['Description', 'Qty', 'Price', 'Total'].map(h => (
                        <th key={h} className={`px-2 py-1.5 font-semibold text-white ${h !== 'Description' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FAKE_INVOICE.items.map((item, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? c.background : c.accent + '10' }}>
                        <td className="px-2 py-1.5">{item.description}</td>
                        <td className="px-2 py-1.5 text-right">{item.quantity}</td>
                        <td className="px-2 py-1.5 text-right">₱{item.unitPrice.toLocaleString()}</td>
                        <td className="px-2 py-1.5 text-right font-semibold">₱{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-4">
                  <div className="w-36 space-y-1 text-xs">
                    <div className="flex justify-between"><span className="opacity-60">Subtotal</span><span>₱{FAKE_INVOICE.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="opacity-60">Tax 12%</span><span>₱{FAKE_INVOICE.tax.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold text-sm pt-1 border-t" style={{ borderColor: c.primary + '40', color: c.primary }}>
                      <span>Total</span><span>₱{FAKE_INVOICE.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {sections.thankYouMessage && defaultMessage && (
                  <div className="rounded-lg p-2.5 text-xs text-center opacity-70 mb-2" style={{ background: c.accent + '15' }}>
                    {defaultMessage}
                  </div>
                )}

                {sections.termsAndConditions && defaultTerms && (
                  <div className="text-xs opacity-50 mt-2 border-t pt-2" style={{ borderColor: c.primary + '20' }}>
                    <p className="font-semibold mb-0.5">Terms & Conditions</p>
                    <p className="leading-relaxed">{defaultTerms}</p>
                  </div>
                )}

                {sections.footerNotes && footerText && (
                  <p className="text-xs opacity-40 text-center mt-2">{footerText}</p>
                )}

                {sections.bankDetails && (
                  <div className="text-xs opacity-50 text-center mt-2">{FAKE_INVOICE.notes}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}