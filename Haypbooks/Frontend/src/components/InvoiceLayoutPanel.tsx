"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { CompanyInfo, InvoiceLayout } from '@/types/invoiceLayout'
import HelpPopover from '@/components/HelpPopover'
import { DEFAULT_COMPANY, DEFAULT_LAYOUT } from '@/types/invoiceLayout'

// Local storage keys & simple helpers
const COMPANY_KEY = 'hb.company'
const LAYOUT_KEY = 'hb.invoice.layout'
const FONTS = ['Inter','Avenir','Roboto','System UI','Arial','Helvetica','Times New Roman','Georgia']
const TEMPLATE_STYLES: InvoiceLayout['templateStyle'][] = ['modern','classic','minimal']

function loadCompanyFromLocal(): CompanyInfo {
  if (typeof window === 'undefined') return DEFAULT_COMPANY
  try { const raw = localStorage.getItem(COMPANY_KEY); if (raw) return { ...DEFAULT_COMPANY, ...JSON.parse(raw) } } catch {}
  return DEFAULT_COMPANY
}
function loadLayoutFromLocal(): InvoiceLayout {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT
  try { const raw = localStorage.getItem(LAYOUT_KEY); if (raw) return { ...DEFAULT_LAYOUT, ...JSON.parse(raw) } } catch {}
  return DEFAULT_LAYOUT
}
function saveCompanyLocal(c: CompanyInfo) { try { localStorage.setItem(COMPANY_KEY, JSON.stringify(c)) } catch {} }
function saveLayoutLocal(l: InvoiceLayout) { try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(l)) } catch {} }

const Toggle: React.FC<{label: string; checked: boolean; onChange: (v:boolean)=>void; disabled?: boolean}> = ({label, checked, onChange, disabled}) => (
  <label className="flex items-center justify-between py-1">
    <span className={disabled? 'text-neutral-400':'text-sm'}>{label}</span>
    <input aria-label={label} type="checkbox" className="toggle" disabled={disabled} checked={checked} onChange={e=>onChange(e.target.checked)} />
  </label>
)

const TogglePair: React.FC<{ label: string; editorChecked: boolean; customerChecked: boolean; onEditorChange: (v:boolean)=>void; onCustomerChange: (v:boolean)=>void; editorDisabled?: boolean; customerDisabled?: boolean }> = ({ label, editorChecked, customerChecked, onEditorChange, onCustomerChange, editorDisabled, customerDisabled }) => (
  <div className="py-1 border-b last:border-b-0">
    <div className="flex items-center justify-between">
      <div className="text-sm">{label}</div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs"><span>Editor view</span><input aria-label={`${label} editor view`} type="checkbox" className="toggle" checked={!!editorChecked} disabled={editorDisabled} onChange={e=> onEditorChange(e.target.checked)} /></label>
        <label className={`flex items-center gap-2 text-xs ${customerDisabled ? 'opacity-40' : ''}`}><span>Customer view</span><input aria-label={`${label} customer view`} type="checkbox" className="toggle" checked={!!customerChecked} disabled={customerDisabled} onChange={e=> onCustomerChange(e.target.checked)} /></label>
      </div>
    </div>
  </div>
)

type PreviewItem = { name: string; qty: number; rate: number; sku?: string; date?: string }
type PreviewInvoice = {
  number?: string
  terms?: string
  invoiceDate?: string
  dueDate?: string
  tags?: string[]
  billTo?: string
  shipTo?: string
  items?: PreviewItem[]
  discountAmount?: number
  shipping?: number
  paymentsReceived?: number
}

export const InvoiceLayoutPanel: React.FC<{ initialTab?: 'design'|'content'|'payment'|'emails'; onBack?: () => void; previewData?: { invoice?: PreviewInvoice; company?: Partial<CompanyInfo> }; onLayoutChange?: (layout: InvoiceLayout) => void }> = ({ initialTab, onBack, previewData, onLayoutChange }) => {
  const [company, setCompany] = useState<CompanyInfo>(() => loadCompanyFromLocal())
  const [layout, setLayout] = useState<InvoiceLayout>(() => loadLayoutFromLocal())
  const [activeTab, setActiveTab] = useState<'design'|'content'|'payment'|'emails'>(initialTab || 'design')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState<{ template: boolean; logo: boolean; colors: boolean; font: boolean; print: boolean }>({ template: true, logo: false, colors: false, font: false, print: false })
  // Baseline snapshots for dirty tracking
  const [baselineCompany, setBaselineCompany] = useState<CompanyInfo>(() => loadCompanyFromLocal())
  const [baselineLayout, setBaselineLayout] = useState<InvoiceLayout>(() => loadLayoutFromLocal())

  const computeDirty = useCallback((nextCompany: CompanyInfo, nextLayout: InvoiceLayout) => {
    try {
      return JSON.stringify(nextCompany) !== JSON.stringify(baselineCompany) || JSON.stringify(nextLayout) !== JSON.stringify(baselineLayout)
    } catch { return true }
  }, [baselineCompany, baselineLayout])

  function updateLayout(patch: Partial<InvoiceLayout>) {
    setLayout(l => {
      const next = { ...l, ...patch }
      try { onLayoutChange?.(next) } catch {}
      return next
    })
  }
  function updateCompany(patch: Partial<CompanyInfo>) {
    setCompany(c => {
      const next = { ...c, ...patch }
      return next
    })
  }

  // Auto-update dirty state when company or layout changes
  useEffect(() => {
    setDirty(computeDirty(company, layout))
  }, [company, layout, computeDirty])

  // Emit initial layout to listeners once mounted
  useEffect(() => {
    try { onLayoutChange?.(layout) } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveAll() {
    if (!dirty) return
    setSaving(true)
    try {
      saveCompanyLocal(company)
      saveLayoutLocal(layout)
      // Update baselines on successful save
      setBaselineCompany(company)
      setBaselineLayout(layout)
      setDirty(false)
    } finally { setSaving(false) }
  }
  function resetDefaults() {
    const nextCompany = DEFAULT_COMPANY
    const nextLayout = DEFAULT_LAYOUT
    setCompany(nextCompany)
    setLayout(nextLayout)
    // Dirty will be auto-computed by useEffect
  }

  // Initial load: use mock/local only (no network) and set baselines
  useEffect(() => {
    const c = loadCompanyFromLocal()
    const l = loadLayoutFromLocal()
    // Migration: normalize saved layouts to match the new toggle matrix
    if (l) {
      // Editor-visible (no toggle) fields must always be true for Editor; Customer may vary per matrix
      if (l.showInvoiceNumberEditor === false) l.showInvoiceNumberEditor = true
      if (l.showInvoiceDateEditor === false) l.showInvoiceDateEditor = true
      if (l.showInvoiceDateCustomer === false) l.showInvoiceDateCustomer = true
      if (l.showDueDateEditor === false) l.showDueDateEditor = true
      if (l.showDueDateCustomer === false) l.showDueDateCustomer = true
      if (l.showTermsEditor === false) l.showTermsEditor = true
      // Service date is now toggleable (editor/customer). Keep persisted value as-is.
      if (l.showTaxSummaryEditor === false) l.showTaxSummaryEditor = true
      if (l.showTaxSummaryCustomer === false) l.showTaxSummaryCustomer = true
      if (l.showDiscountEditor === false) l.showDiscountEditor = true
      // Tags: customer view removed => ensure it's false
      if (l.showTagsCustomer) l.showTagsCustomer = false
    }
    setCompany(c)
    setLayout(l)
    setBaselineCompany(c)
    setBaselineLayout(l)
    // Dirty will be auto-computed by useEffect
  }, [])

  // Enforce dependent flags
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // If discount editor is off, ensure applyDiscountAfterTax is false
    if (!layout.showDiscountEditor && layout.applyDiscountAfterTax) updateLayout({ applyDiscountAfterTax: false })
    // Due date is always visible in the Editor; Terms only affects Customer toggles
    if (!layout.showTermsCustomer && layout.showDueDateCustomer) updateLayout({ showDueDateCustomer: false })

    // If an editor visibility is turned off, ensure the customer visibility is also off
    // Note: many newer fields have Editor set to always-visible; only keep pairs where both toggles can be changed.
    const editorCustomerPairs: Array<[keyof InvoiceLayout, keyof InvoiceLayout]> = [
      ['showSKUEditor','showSKUCustomer'],
      ['showServiceDateEditor','showServiceDateCustomer'],
      ['showShippingAddressEditor','showShippingAddressCustomer'],
      ['showShippingEditor','showShippingCustomer']
    ]
    editorCustomerPairs.forEach(([ed, cu]) => {
      // @ts-ignore
      if (layout[ed] === false && layout[cu] === true) updateLayout({ [cu]: false } as any)
    })
  }, [layout.showDiscountEditor, layout.applyDiscountAfterTax, layout.showTermsEditor, layout.showDueDateEditor, layout.showTermsCustomer, layout.showDueDateCustomer, layout.showShippingAddressEditor, layout.showShippingAddressCustomer, layout.showInvoiceNumberEditor, layout.showInvoiceNumberCustomer, layout.showInvoiceDateEditor, layout.showInvoiceDateCustomer, layout.showServiceDateEditor, layout.showServiceDateCustomer, layout.showSKUEditor, layout.showSKUCustomer, layout.showTaxSummaryEditor, layout.showTaxSummaryCustomer, layout.showTagsEditor, layout.showTagsCustomer, layout.showDiscountCustomer])

  const fontClass = useMemo(()=> ['Times New Roman','Georgia'].includes(layout.fontFamily)?'font-serif':'font-sans',[layout.fontFamily])
  const emailPreview = layout.emailBodyTemplate
    .replace(/{{companyName}}/g, company.name || 'Your Company')
    .replace(/{{invoiceNumber}}/g,'INV-1001')
    .replace(/{{amountDue}}/g,'$1,245.00')
    .replace(/{{dueDate}}/g,'2025-12-01')
    .replace(/{{payUrl}}/g,'https://pay.example.test/inv/INV-1001')
  const atLeastOnePaymentEnabled = layout.paymentMethods?.card || layout.paymentMethods?.bankTransfer || layout.paymentMethods?.paypal
  function togglePayment(method: keyof NonNullable<InvoiceLayout['paymentMethods']>) {
    const pm={ card:false, bankTransfer:false, paypal:false, ...(layout.paymentMethods||{}) }
    pm[method]=!pm[method]
    updateLayout({ paymentMethods: pm })
  }

  function renderInvoicePreview() {
    // Prefer live preview data if provided, else use mock
    const items: PreviewItem[] = previewData?.invoice?.items && previewData.invoice.items.length
      ? previewData.invoice.items
      : [
          { name: 'Consulting', qty: 10, rate: 100, sku: 'CNSLT-01', date: '2025-11-16' },
          { name: 'Hardware', qty: 5, rate: 250, sku: 'LPTP-13', date: '2025-11-16' },
        ]
    const money = (n: number) => `$${n.toFixed(2)}`
    const subtotal = items.reduce((s, it) => s + it.qty * it.rate, 0)
    const discountAmount = layout.showDiscountCustomer ? (previewData?.invoice?.discountAmount ?? 100) : 0
    // If the Shipping/others line is hidden for customers, treat shipping as zero in the customer preview (so totals match what the customer sees)
    const shipping = layout.showShippingCustomer ? (previewData?.invoice?.shipping ?? 50) : 0
    // Tax summary is always visible to customers and included in preview calculations
    const taxRate = 0.05
    // Taxable subtotal depends on discount timing
    const taxableSubtotal = layout.applyDiscountAfterTax ? subtotal : Math.max(0, subtotal - discountAmount)
    const tax = +(taxableSubtotal * taxRate).toFixed(2)
    const total = layout.applyDiscountAfterTax
      ? subtotal + tax + shipping - discountAmount
      : (subtotal - discountAmount) + tax + shipping
    const paymentsReceived = previewData?.invoice?.paymentsReceived ?? 0
    const balanceDue = +(total - paymentsReceived).toFixed(2)

    const rawStyle = layout.templateStyle
    const style = (rawStyle === 'compact' ? 'modern' : rawStyle) as 'modern'|'classic'|'minimal'
    const isModern = style === 'modern'
    const isClassic = style === 'classic'
    const isMinimal = style === 'minimal'

    // Modern: gradient background, rounded corners, shadow, accent border
    // Classic: traditional bordered box with gray header
    // Minimal: clean border, simple lines, no background
    const cardPadding = isModern ? 'p-8' : isClassic ? 'p-6' : 'p-6'
    const cardRounded = isModern ? 'rounded-xl' : isClassic ? 'rounded-lg' : 'rounded-md'
    const cardShadow = isModern ? 'shadow-lg' : isClassic ? 'shadow-sm' : ''
    const cardBorder = isModern
      ? `border-2`
      : isClassic
        ? 'border-2'
        : 'border'
    const cardBg = isModern ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-white'

    const headerRowBg = isModern ? 'bg-transparent' : isClassic ? 'bg-gray-100' : 'bg-white'
    const styleVariant = isModern ? 'is-modern' : isClassic ? 'is-classic' : 'is-minimal'
    
    const headerBorderBottom = isModern ? 'border-b-4' : isClassic ? 'border-b-2 border-gray-400' : 'border-b border-gray-300'

    const cellPadY = 'py-1'
    const cellPadX = 'px-2'

    // Helper for styled-jsx tint
    const toRGBA = (hex: string, alpha: number) => {
      const h = hex.replace('#','')
      const bigint = h.length===3
        ? parseInt(h.split('').map(c=>c+c).join(''),16)
        : parseInt(h,16)
      const r = (bigint >> 16) & 255
      const g = (bigint >> 8) & 255
      const b = bigint & 255
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    return (
      <div className="border rounded p-4 text-sm space-y-2">
        <h2 className="font-semibold">Invoice Preview</h2>
        <div className={`hb-preview ${styleVariant} ${fontClass} ${cardPadding} ${cardRounded} ${cardShadow} ${cardBorder} ${cardBg} hb-card`}>
          {/* Header */}
          <div className={`mb-2 flex ${layout.logoPlacement==='center'?'justify-center': layout.logoPlacement==='right'?'justify-end':'justify-start'} items-start`}>
            <div className={`flex items-center gap-2`}>
              {(() => {
                const invoiceLogo = layout.useCustomInvoiceLogo && layout.logoUrl ? layout.logoUrl : company.logoUrl
                return invoiceLogo ? (
                  <img src={invoiceLogo} alt="Preview logo" className={`rounded border object-contain bg-white ${layout.logoSize==='lg'?'h-10 w-10': layout.logoSize==='sm'?'h-5 w-5':'h-7 w-7'}`} />
                ) : null
              })()}
              <span className={`font-medium text-sky-600 hb-primary`}>{company.name || 'Your Company'}</span>
            </div>
          </div>
          {/* Company/Seller info */}
          <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 mb-1">
            <div className="space-y-0.5">
              <div className="font-medium text-slate-700 hb-accent-text">From</div>
              <div>{company.name || 'Your Company'}</div>
              <div>{company.address?.street || '123 Business Ave'}</div>
              <div>{[company.address?.city, company.address?.state, company.address?.zip].filter(Boolean).join(', ') || 'City, ST 00000'}</div>
              <div className="flex gap-3"><span>{company.email || 'billing@company.test'}</span><span>{company.phone || '(000) 000-0000'}</span></div>
              {company.website && <div>{company.website}</div>}
            </div>
            <div className="text-right space-y-0.5">
              {layout.showInvoiceNumberCustomer && <div>Invoice: {previewData?.invoice?.number || 'INV-1001'}</div>}
              {layout.showTermsCustomer && <div>Terms: {previewData?.invoice?.terms || 'Net 30'}</div>}
              {/* Invoice date & Due date are always visible to customers per the toggle matrix */}
              <div>Invoice Date: {previewData?.invoice?.invoiceDate || '2025-11-16'}</div>
              <div>Due: {previewData?.invoice?.dueDate || '2025-12-16'}</div>
              {layout.showTagsCustomer && <div>Tags: {(previewData?.invoice?.tags || ['Design','Priority']).join(', ')}</div>}
            </div>
          </div>
          {/* Meta lines removed to avoid redundancy */}
          {/* Addresses */}
          <div className="mt-2 grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <div className="font-medium text-slate-700 hb-accent-text">Bill To</div>
              <div>{previewData?.invoice?.billTo || 'Client Co.\n123 Market St.\nDenver, CO'}</div>
            </div>
            {layout.showShippingAddressCustomer && (
              <div>
                <div className="font-medium text-slate-700 hb-accent-text">Ship To</div>
                <div>{previewData?.invoice?.shipTo || 'Client Co. Warehouse\n45 Industrial Way\nDenver, CO'}</div>
              </div>
            )}
          </div>
          {/* Items */}
          <table className={`w-full text-[11px] mt-3 ${isClassic ? 'border' : ''} hb-table`}>
            <thead>
              <tr className={`${headerBorderBottom} ${headerRowBg} hb-header`}>
                <th className={`text-left ${cellPadY} pr-2`}>Item</th>
                {layout.showServiceDateCustomer && <th className={`text-left ${cellPadY} pr-2`}>Date</th>}
                {layout.showSKUCustomer && <th className={`text-left ${cellPadY} pr-2`}>SKU</th>}
                <th className={`text-right ${cellPadY} ${cellPadX}`}>Qty</th>
                <th className={`text-right ${cellPadY} ${cellPadX}`}>Rate</th>
                <th className={`text-right ${cellPadY} pl-2`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr className="border-b" key={idx}>
                  <td className={`${cellPadY} pr-2`}>{it.name}</td>
                  {layout.showServiceDateCustomer && <td className={`${cellPadY} pr-2`}>{it.date}</td>}
                  {layout.showSKUCustomer && <td className={`${cellPadY} pr-2`}>{it.sku}</td>}
                  <td className={`${cellPadY} ${cellPadX} text-right`}>{it.qty}</td>
                  <td className={`${cellPadY} ${cellPadX} text-right`}>{money(it.rate)}</td>
                  <td className={`${cellPadY} pl-2 text-right`}>{money(it.qty * it.rate)}</td>
                </tr>
              ))}
              {layout.wrapDescriptions && (
                <tr className="border-b">
                  <td colSpan={(layout.showServiceDateCustomer?1:0)+(layout.showSKUCustomer?1:0)+4} className={`${cellPadY} text-[10px] text-slate-500`}>Description wraps to multiple lines when enabled.</td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Totals with auto positioning based on discount timing */}
          <div className="mt-2 space-y-0.5 text-[11px]">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            {!layout.applyDiscountAfterTax && layout.showDiscountCustomer && (
              <div className="flex justify-between"><span>Discount</span><span>-{money(discountAmount)}</span></div>
            )}
            <div className="flex justify-between"><span>Taxable Subtotal</span><span>{money(taxableSubtotal)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{money(tax)}</span></div>
            {layout.applyDiscountAfterTax && layout.showDiscountCustomer && (
              <div className="flex justify-between"><span>Discount</span><span>-{money(discountAmount)}</span></div>
            )}
            {layout.showShippingCustomer && (<div className="flex justify-between"><span>Shipping/others</span><span>{money(shipping)}</span></div>)}
            <div className="flex justify-between font-medium"><span>Total</span><span>{money(total)}</span></div>
            <div className="flex justify-between"><span>Payments Received</span><span>{money(paymentsReceived)}</span></div>
            <div className="flex justify-between font-semibold"><span>Balance Due</span><span className="hb-balance">{money(balanceDue)}</span></div>
          </div>
          <div className="mt-2 text-[10px] border-t pt-2"><div className="font-medium">Tax Summary</div><div className="flex justify-between"><span>5.0% Standard</span><span>{money(tax)}</span></div></div>
          {layout.showTermsCustomer && layout.terms && <div className="mt-3 text-[10px]"><span className="font-medium">Terms:</span> {layout.terms.slice(0,160) || 'Payment due within 30 days.'}</div>}
          {layout.footerMarkdown && <div className="mt-2 text-[10px]" dangerouslySetInnerHTML={{ __html: (layout.footerMarkdown||'').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/_(.+?)_/g,'<em>$1</em>') }} />}
          <div className="mt-3 text-[10px]">
            <div className="font-medium">Payment Options</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {layout.paymentMethods?.card && <span className="px-2 py-1 rounded bg-slate-100 border text-slate-700">Card</span>}
              {layout.paymentMethods?.bankTransfer && <span className="px-2 py-1 rounded bg-slate-100 border text-slate-700">Bank Transfer</span>}
              {layout.paymentMethods?.paypal && <span className="px-2 py-1 rounded bg-slate-100 border text-slate-700">PayPal</span>}
              {!atLeastOnePaymentEnabled && <span className="text-slate-400">(None enabled)</span>}
            </div>
            {atLeastOnePaymentEnabled && <button type="button" className="btn-sm btn-primary mt-2 hb-pay">Pay Now</button>}
            {layout.paymentMethods?.bankTransfer && (
              <div className="mt-2">
                <div>Bank: ACME Bank</div>
                <div>Account: •••• 1234</div>
                <div>SWIFT/IBAN: ACMEUS00XXX</div>
              </div>
            )}
          </div>
        </div>
        <div className="text-[10px] text-neutral-500">Print: {layout.printPageSize||'Letter'} · Margins (mm): {String(layout.printMarginTop??12.7)}/{String(layout.printMarginRight??12.7)}/{String(layout.printMarginBottom??12.7)}/{String(layout.printMarginLeft??12.7)}</div>
        <style>{`
          .hb-preview { 
            --hb-primary: ${layout.primaryColor || 'var(--hb-primary)'};
            --hb-accent: ${layout.accentColor || 'var(--hb-accent)'};
            --hb-accent-10: ${layout.accentColor ? toRGBA(layout.accentColor, 0.1) : 'transparent'};
          }
          .hb-preview .hb-card { border-color: var(--hb-accent); }
          .hb-preview .hb-primary { color: var(--hb-primary); }
          .hb-preview .hb-accent-text { color: var(--hb-accent); }
          .hb-preview.is-classic .hb-table { border-color: var(--hb-accent); }
          .hb-preview.is-modern .hb-header { background-color: var(--hb-accent-10); }
          .hb-preview .hb-table tr { border-bottom-color: var(--hb-accent-10); }
          .hb-preview .hb-balance { color: var(--hb-accent); font-weight: 700; }
          .hb-preview .hb-pay { background-color: var(--hb-primary) !important; border-color: var(--hb-primary) !important; color: #fff !important; }
          .hb-preview .hb-pay:hover { filter: brightness(0.95); }
        `}</style>
      </div>
    )
  }

  return (
    <div className={`glass-card p-4 space-y-4 ${fontClass}`}>
      <div className="sticky top-0 z-30 -mx-4 -mt-4 mb-4 px-4 pt-3 pb-3 bg-white/95 backdrop-blur border border-hb-primary-300 rounded-2xl shadow-sm flex items-center flex-wrap gap-3">
        {/* Heading removed per request; tab buttons form left cluster */}
        <div className="flex items-center gap-3">
          {['design','content','payment','emails'].map(t => (
            <button key={t} className={"btn-sm "+(activeTab===t?'btn-primary':'btn-secondary')} onClick={()=>setActiveTab(t as any)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-3 items-center">
          <div className="text-xs text-neutral-500 min-w-[110px]">{dirty ? 'Unsaved changes' : 'No changes'}</div>
          <button className="btn-secondary" onClick={resetDefaults} disabled={saving}>Reset</button>
          <button className="btn-primary" onClick={saveAll} disabled={saving || !dirty} title={!dirty ? 'Make a change to enable saving' : ''}>{saving ? 'Saving…' : 'Save'}</button>
          {onBack && (
            <button className="btn-secondary" onClick={onBack} disabled={saving}>Back</button>
          )}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {activeTab==='design' && (
            <>
              <section className="rounded-lg border border-slate-200 bg-white">
                <button type="button" className="w-full text-left px-4 py-3 flex items-start justify-between gap-2" onClick={()=> setOpen(o=> ({ ...o, template: !o.template }))} aria-controls="sec-template">
                  <div><div className="font-medium">Template style</div><div className="text-xs text-slate-600">Swap among clean templates tailored for clarity.</div></div>
                  <span className="text-slate-400" aria-hidden>{open.template ? '▾' : '▸'}</span>
                </button>
                {open.template && (
                  <div id="sec-template" className="px-4 pb-4">
                    <div className="flex gap-2 flex-wrap">
                      {TEMPLATE_STYLES.map(s => (
                        <button
                          key={s}
                          type="button"
                          className={`btn-sm ${layout.templateStyle===s ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={()=>updateLayout({ templateStyle: s })}
                        >
                          {s.charAt(0).toUpperCase()+s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
              <section className="rounded-lg border border-slate-200 bg-white">
                <button type="button" className="w-full text-left px-4 py-3 flex items-start justify-between gap-2" onClick={()=> setOpen(o=> ({ ...o, logo: !o.logo }))} aria-controls="sec-logo">
                  <div><div className="font-medium">Logo placement</div><div className="text-xs text-slate-600">Edit placement & size. Use custom logo or default company logo.</div></div>
                  <span className="text-slate-400" aria-hidden>{open.logo ? '▾' : '▸'}</span>
                </button>
                {open.logo && <div id="sec-logo" className="px-4 pb-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const invoiceLogo = layout.useCustomInvoiceLogo && layout.logoUrl ? layout.logoUrl : company.logoUrl
                      return invoiceLogo ? <img src={invoiceLogo} alt="Invoice logo" className="h-12 w-12 rounded border object-contain bg-white" /> : <div className="h-12 w-12 rounded border bg-slate-100 flex items-center justify-center text-slate-400" aria-hidden>🖼️</div>
                    })()}
                    <div className="text-xs text-slate-600">{layout.useCustomInvoiceLogo ? 'Using custom invoice logo' : 'Using company logo'}</div>
                  </div>
                  <Toggle 
                    label="Use custom logo for invoices" 
                    checked={!!layout.useCustomInvoiceLogo} 
                    onChange={(v) => {
                      if (v) {
                        updateLayout({ useCustomInvoiceLogo: true })
                      } else {
                        updateLayout({ useCustomInvoiceLogo: false, logoUrl: undefined })
                      }
                    }}
                  />
                  {layout.useCustomInvoiceLogo && (
                    <div className="space-y-2 pt-2 border-t">
                      <label className="block text-sm">
                        <span className="text-slate-600">Upload custom invoice logo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="text-sm mt-1 block" 
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (ev) => {
                                updateLayout({ logoUrl: ev.target?.result as string })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                      <button 
                        className="btn-sm btn-secondary" 
                        onClick={() => {
                          if (layout.logoUrl) {
                            updateCompany({ logoUrl: layout.logoUrl })
                          }
                        }}
                      >
                        Set as default company logo
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">{(['left','center','right'] as const).map(p => <button key={p} className={`btn-sm ${layout.logoPlacement===p?'btn-primary':'btn-secondary'}`} onClick={()=>updateLayout({ logoPlacement: p })}>{p}</button>)}
                    <div className="flex items-center gap-2 ml-2 text-sm"><span>Size</span><select className="input" aria-label="Logo size" value={layout.logoSize||'md'} onChange={e=>updateLayout({ logoSize: e.target.value as any })}><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option></select></div>
                  </div>
                </div>}
              </section>
              <section className="rounded-lg border border-slate-200 bg-white">
                <button type="button" className="w-full text-left px-4 py-3 flex items-start justify-between gap-2" onClick={()=> setOpen(o=> ({ ...o, colors: !o.colors }))} aria-controls="sec-colors">
                  <div><div className="font-medium">Colours</div><div className="text-xs text-slate-600">Primary & accent for headings and borders.</div></div>
                  <span className="text-slate-400" aria-hidden>{open.colors ? '▾' : '▸'}</span>
                </button>
                {open.colors && <div id="sec-colors" className="px-4 pb-4 space-y-3">
                  {/* Presets dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm">Primary preset<select className="input mt-1" value={layout.primaryColor} onChange={e=>updateLayout({ primaryColor: e.target.value })}>
                      <option value="#1463ff">Corporate Blue</option>
                      <option value="#16a34a">Eco Green</option>
                      <option value="#ef4444">Bold Red</option>
                      <option value="#1f2937">Slate</option>
                      <option value="#f59e0b">Amber</option>
                    </select></label>
                    <label className="text-sm">Accent preset<select className="input mt-1" value={layout.accentColor} onChange={e=>updateLayout({ accentColor: e.target.value })}>
                      <option value="#1f2937">Slate</option>
                      <option value="#0ea5e9">Sky</option>
                      <option value="#10b981">Emerald</option>
                      <option value="#ef4444">Red</option>
                      <option value="#8b5cf6">Violet</option>
                    </select></label>
                  </div>
                  {/* Color pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <label className="text-sm">Pick primary color
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-8 w-10 border rounded" value={layout.primaryColor} onChange={e=>updateLayout({ primaryColor: e.target.value })} />
                        <input className="input w-32" value={layout.primaryColor} onChange={e=>updateLayout({ primaryColor: e.target.value })} aria-label="Primary color hex" />
                      </div>
                    </label>
                    <label className="text-sm">Pick accent color
                      <div className="mt-1 flex items-center gap-2">
                        <input type="color" className="h-8 w-10 border rounded" value={layout.accentColor} onChange={e=>updateLayout({ accentColor: e.target.value })} />
                        <input className="input w-32" value={layout.accentColor} onChange={e=>updateLayout({ accentColor: e.target.value })} aria-label="Accent color hex" />
                      </div>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      className="btn-sm btn-secondary"
                      onClick={()=>updateLayout({ primaryColor: '#1463ff', accentColor: '#1f2937' })}
                    >
                      Reset colours
                    </button>
                  </div>
                </div>}
              </section>
              <section className="rounded-lg border border-slate-200 bg-white">
                <button type="button" className="w-full text-left px-4 py-3 flex items-start justify-between gap-2" onClick={()=> setOpen(o=> ({ ...o, font: !o.font }))} aria-controls="sec-font">
                  <div><div className="font-medium">Font</div><div className="text-xs text-slate-600">Choose a readable professional font.</div></div>
                  <span className="text-slate-400" aria-hidden>{open.font ? '▾':'▸'}</span>
                </button>
                {open.font && <div id="sec-font" className="px-4 pb-4"><label className="text-sm">Invoice font<select className="input mt-1" aria-label="Invoice font" value={layout.fontFamily} onChange={e=>updateLayout({ fontFamily:e.target.value })}>{FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select></label></div>}
              </section>
              <section className="rounded-lg border border-slate-200 bg-white">
                <button type="button" className="w-full text-left px-4 py-3 flex items-start justify-between gap-2" onClick={()=> setOpen(o=> ({ ...o, print: !o.print }))} aria-controls="sec-print">
                  <div><div className="font-medium">Print settings</div><div className="text-xs text-slate-600">Page size & margins.</div></div>
                  <span className="text-slate-400" aria-hidden>{open.print ? '▾':'▸'}</span>
                </button>
                {open.print && <div id="sec-print" className="px-4 pb-4"><div className="grid grid-cols-2 gap-2 items-end">
                  <label className="text-sm">Page size<select className="input mt-1" value={layout.printPageSize||'Letter'} onChange={e=>updateLayout({ printPageSize:e.target.value as any })}><option>Letter</option><option>A4</option></select></label>
                  <div className="text-xs text-neutral-500">Units in millimeters</div>
                  <label className="text-sm">Top<input aria-label="Margin top" type="number" className="input mt-1" value={layout.printMarginTop??12.7} onChange={e=>updateLayout({ printMarginTop:Number(e.target.value) })} /></label>
                  <label className="text-sm">Right<input aria-label="Margin right" type="number" className="input mt-1" value={layout.printMarginRight??12.7} onChange={e=>updateLayout({ printMarginRight:Number(e.target.value) })} /></label>
                  <label className="text-sm">Bottom<input aria-label="Margin bottom" type="number" className="input mt-1" value={layout.printMarginBottom??12.7} onChange={e=>updateLayout({ printMarginBottom:Number(e.target.value) })} /></label>
                  <label className="text-sm">Left<input aria-label="Margin left" type="number" className="input mt-1" value={layout.printMarginLeft??12.7} onChange={e=>updateLayout({ printMarginLeft:Number(e.target.value) })} /></label>
                </div></div>}
              </section>
            </>
          )}
          {activeTab==='content' && (
            <>
              <div className="flex items-start gap-2">
                <h2 className="font-medium">Field visibility</h2>
                <div className="text-xs text-neutral-500 mt-1">—</div>
                <div className="ml-auto">
                  <HelpPopover ariaLabel="Invoice field visibility help" buttonAriaLabel="Show visibility help" storageKey="invoice-layout-visibility">
                    <div>
                      <div className="font-semibold mb-2">Editor vs Customer visibility</div>
                      <div className="text-xs text-slate-700 space-y-2">
                        <div><strong>Editor view:</strong> controls visibility in the New Invoice form (what you see when editing).</div>
                        <div><strong>Customer view:</strong> controls what customers see in the invoice preview and sent invoices.</div>
                        <div className="text-neutral-500">Customer toggles depend on Editor toggles where both are configurable. Some fields are always visible in the Editor and only expose Customer visibility.</div>
                      </div>
                    </div>
                  </HelpPopover>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Transaction details</h3>
                <div className="mt-2 border rounded-sm bg-white p-2">
                  <TogglePair
                    label="Ship to"
                    editorChecked={!!layout.showShippingAddressEditor}
                    customerChecked={!!layout.showShippingAddressCustomer}
                    onEditorChange={(v)=> updateLayout({ showShippingAddressEditor: v, ...(v ? {} : { showShippingAddressCustomer: false }) })}
                    onCustomerChange={(v)=> updateLayout({ showShippingAddressCustomer: v, ...(v && !layout.showShippingAddressEditor ? { showShippingAddressEditor: true } : {}) })}
                  />
                  <div className="py-1 border-b last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Invoice no.</div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-neutral-500">Editor view: always visible</div>
                        <label className="flex items-center gap-2 text-xs"><span>Customer view</span><input aria-label={`Invoice no. customer view`} type="checkbox" className="toggle" checked={!!layout.showInvoiceNumberCustomer} onChange={e=> updateLayout({ showInvoiceNumberCustomer: e.target.checked })} /></label>
                      </div>
                    </div>
                  </div>
                  <TogglePair
                    label="Shipping/others"
                    editorChecked={!!layout.showShippingEditor}
                    customerChecked={!!layout.showShippingCustomer}
                    onEditorChange={(v)=> updateLayout({ showShippingEditor: v, ...(v ? {} : { showShippingCustomer: false }) })}
                    onCustomerChange={(v)=> updateLayout({ showShippingCustomer: v, ...(v && !layout.showShippingEditor ? { showShippingEditor: true } : {}) })}
                  />
                  <div className="py-1 border-b last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Terms</div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-neutral-500">Editor view: always visible</div>
                        <label className={`flex items-center gap-2 text-xs ${!layout.showTermsEditor ? 'opacity-40' : ''}`}><span>Customer view</span><input aria-label={`Terms customer view`} type="checkbox" className="toggle" checked={!!layout.showTermsCustomer} disabled={!layout.showTermsEditor} onChange={e=> updateLayout({ showTermsCustomer: e.target.checked })} /></label>
                      </div>
                    </div>
                  </div>
                  <TogglePair
                    label="Service date"
                    editorChecked={!!layout.showServiceDateEditor}
                    customerChecked={!!layout.showServiceDateCustomer}
                    onEditorChange={(v)=> updateLayout({ showServiceDateEditor: v, ...(v ? {} : { showServiceDateCustomer: false }) })}
                    onCustomerChange={(v)=> updateLayout({ showServiceDateCustomer: v, ...(v && !layout.showServiceDateEditor ? { showServiceDateEditor: true } : {}) })}
                  />
                </div>

                <h3 className="text-sm font-semibold mt-3">Item details</h3>
                <div className="mt-2 border rounded-sm bg-white p-2">
                  <TogglePair
                    label="SKU"
                    editorChecked={!!layout.showSKUEditor}
                    customerChecked={!!layout.showSKUCustomer}
                    onEditorChange={(v)=> updateLayout({ showSKUEditor: v, ...(v ? {} : { showSKUCustomer: false }) })}
                    onCustomerChange={(v)=> updateLayout({ showSKUCustomer: v, ...(v && !layout.showSKUEditor ? { showSKUEditor: true } : {}) })}
                  />
                  {/* Invoice date and Due date removed from visibility panel: always visible in both Editor & Customer views */}
                </div>

                <h3 className="text-sm font-semibold mt-3">Additional options</h3>
                <div className="mt-2 border rounded-sm bg-white p-2">
                  <div className="flex items-center justify-between py-1"><div className="text-sm flex items-center gap-2"><span>Tags</span><a className="link text-xs" href="/tags">Manage tags</a></div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs">Editor view<input aria-label="Tags editor view" type="checkbox" className="toggle" checked={!!layout.showTagsEditor} onChange={e=>updateLayout({ showTagsEditor: e.target.checked, ...(e.target.checked ? {} : { showTagsCustomer: false }) })} /></label>
                    </div>
                  </div>
                  <div className="py-1 border-b last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Discount</div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-neutral-500">Editor view: always visible</div>
                        <label className="flex items-center gap-2 text-xs"><span>Customer view</span><input aria-label={`Discount customer view`} type="checkbox" className="toggle" checked={!!layout.showDiscountCustomer} onChange={e=> updateLayout({ showDiscountCustomer: e.target.checked })} /></label>
                      </div>
                    </div>
                  </div>
                  {layout.showDiscountEditor && <label className="flex items-center gap-2 text-xs pl-4"><input type="checkbox" checked={layout.applyDiscountAfterTax} onChange={e=>updateLayout({ applyDiscountAfterTax:e.target.checked })} /> Apply discount after sales tax</label>}
                </div>
              </div>
              {/* Tags & Discount already rendered above in 'Additional options' group */}
              <label className="block text-sm font-medium mt-4">Footer markdown<textarea className="input mt-1 h-24" value={layout.footerMarkdown||''} onChange={e=>updateLayout({ footerMarkdown:e.target.value })} /></label>
              <label className="block text-sm font-medium">Terms & conditions<textarea className="input mt-1 h-24" value={layout.terms||''} onChange={e=>updateLayout({ terms:e.target.value })} /></label>
              <div className="grid grid-cols-2 gap-3 mt-2"><Toggle label="Avoid page break in items" checked={!!layout.pageBreakAvoidItems} onChange={v=>updateLayout({ pageBreakAvoidItems:v })} /><Toggle label="Wrap long descriptions" checked={!!layout.wrapDescriptions} onChange={v=>updateLayout({ wrapDescriptions:v })} /></div>
            </>
          )}
          {activeTab==='payment' && (
            <>
              <h2 className="font-medium mb-2">Accepted payment methods</h2>
              <Toggle label="Credit card (2.9% + 25¢)" checked={!!layout.paymentMethods?.card} onChange={()=>togglePayment('card')} />
              <Toggle label="Bank transfer (1%, max $10)" checked={!!layout.paymentMethods?.bankTransfer} onChange={()=>togglePayment('bankTransfer')} />
              <Toggle label="PayPal (2.9% + 25¢)" checked={!!layout.paymentMethods?.paypal} onChange={()=>togglePayment('paypal')} />
              {!atLeastOnePaymentEnabled && <div className="text-xs text-amber-500 mt-1">Enable at least one method.</div>}
              <p className="text-xs mt-2">By enabling PayPal, you agree to PayPal terms and conditions.</p>
              <h2 className="font-medium mt-6 mb-2">Discounts & fees</h2>
              <Toggle label="Sales tax" checked={true} onChange={()=>{}} disabled />
              <div className="py-1 border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Discount</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-neutral-500">Editor view: always visible</div>
                    <label className="flex items-center gap-2 text-xs"><span>Customer view</span><input aria-label={`Discount customer view`} type="checkbox" className="toggle" checked={!!layout.showDiscountCustomer} onChange={e=> updateLayout({ showDiscountCustomer: e.target.checked })} /></label>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs pl-4"><input type="checkbox" checked={layout.applyDiscountAfterTax} onChange={e=>updateLayout({ applyDiscountAfterTax:e.target.checked })} /> Apply discount after sales tax</label>
              <Toggle label="Shipping fee" checked={true} onChange={()=>{}} disabled />
            </>
          )}
          {activeTab==='emails' && (
            <>
              <label className="block text-sm font-medium">Subject template<input className="input mt-1" value={layout.emailSubjectTemplate} onChange={e=>updateLayout({ emailSubjectTemplate:e.target.value })} /></label>
              <label className="block text-sm font-medium">Body template<textarea className="input mt-1 h-40" value={layout.emailBodyTemplate} onChange={e=>updateLayout({ emailBodyTemplate:e.target.value })} /></label>
              <div className="text-xs text-neutral-500">Tokens: {'{{invoiceNumber}}'}, {'{{companyName}}'}, {'{{amountDue}}'}, {'{{dueDate}}'}, {'{{payUrl}}'}</div>
              <div className="border rounded p-4 text-xs space-y-2 mt-4"><h2 className="font-medium">Email preview</h2><div className="p-2 bg-neutral-50 rounded border"><div className="font-semibold mb-1">{layout.emailSubjectTemplate.replace(/{{invoiceNumber}}/,'INV-1001').replace(/{{companyName}}/, company.name || 'Your Company')}</div><div className="whitespace-pre-wrap leading-relaxed">{emailPreview}</div></div></div>
            </>
          )}
        </div>
        {renderInvoicePreview()}
      </div>
      <div className="pt-4 border-t text-xs text-neutral-400">Unsaved changes are lost if you navigate away without saving.</div>
    </div>
  )
}

