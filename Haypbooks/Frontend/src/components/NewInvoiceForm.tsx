"use client"
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition, useRef } from 'react'
import useRowReorder from '@/hooks/useRowReorder'
import { createPortal } from 'react-dom'
import { InvoiceLayoutPanel } from '@/components/InvoiceLayoutPanel'
import type { InvoiceLayout } from '@/types/invoiceLayout'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api'
import toHref from '@/lib/route'
import { calculateDueDate, TERMS_OPTIONS } from '@/lib/terms'
import { formatMMDDYYYY } from '@/lib/date'
import TagSelect from '@/components/TagSelect'
import CustomerDropdown from '@/components/CustomerDropdown'
import ProductDropdown from '@/components/ProductDropdown'
import ResizableBox from '@/components/ResizableBox'
import ColumnResizer from '@/components/ColumnResizer'
import ResizableColumn from '@/components/ResizableColumn'
import InlineWidthResizer from '@/components/InlineWidthResizer'

// Schema definitions
const lineSchema = z.object({
  item: z.string().optional(),
  sku: z.string().optional(),
  date: z.string().optional(),
  description: z.string().min(1,'Description required'),
  qty: z.coerce.number().min(0.01,'Qty > 0'),
  rate: z.coerce.number().min(0,'Rate >= 0'),
  class: z.string().optional(),
  taxable: z.boolean().optional(),
  amount: z.number().optional(),
})
const recurringSchema = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(['daily','weekly','monthly','yearly']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  occurrences: z.coerce.number().optional(),
}).refine(v => !v.enabled || (!!v.frequency && !!v.startDate), { message: 'Recurring requires frequency & start date' })
const schema = z.object({
  number: z.string().min(1, 'Invoice # is required'),
  customerId: z.string().min(1, 'Customer is required'),
  customerEmail: z.string().email().optional().or(z.literal('')).optional(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  terms: z.string().default('Net 30'),
  location: z.string().optional(),
  amountsMode: z.enum(['exclusive','inclusive']).default('exclusive').optional(),
  lines: z.array(lineSchema).min(1,'At least one line'),
  message: z.string().optional(),
  messageOnStatement: z.string().optional(),
  memo: z.string().optional(),
  discountPct: z.coerce.number().min(0).max(100).optional(),
  taxPct: z.coerce.number().min(0).max(100).optional(),
  deposit: z.coerce.number().min(0).optional(),
  shipping: z.coerce.number().min(0).optional(),
  applyDiscountAfterTax: z.boolean().optional(),
  makeRecurring: recurringSchema.optional(),
  brandLogo: z.string().optional(),
  brandColor: z.string().optional(),
  customFields: z.record(z.string()).optional(),
})
export type FormValues = z.infer<typeof schema>

import { bankersRound, toTwo } from '@/lib/math'

function deriveTotals(values: FormValues) {
  const lines = values.lines || []
  const r = Number(values.taxPct || 0) / 100
  // Interpret lines — support subtotal marker lines where description === 'Subtotal'
  const processed: Array<any> = []
  let pendingGroupSum = 0
  let netSubtotal = 0
  let taxableNet = 0

  for (const l of lines) {
    const isSubtotalMarker = (typeof l.description === 'string' && l.description.trim().toLowerCase() === 'subtotal')
    if (isSubtotalMarker) {
      // create a subtotal line that sums previous pendingGroupSum
      const amt = toTwo(pendingGroupSum)
      processed.push({ kind: 'subtotal', amount: amt })
      netSubtotal += amt
      // subtotal rows are not taxable
      pendingGroupSum = 0
      continue
    }

    const amount = toTwo(Number(l.qty || 0) * Number(l.rate || 0))
    processed.push({ ...l, kind: 'line', amount })
    pendingGroupSum += amount
    if (values.amountsMode === 'inclusive') {
      if (l.taxable) {
        // extract net when amounts are inclusive
        const net = r > 0 ? amount / (1 + r) : amount
        netSubtotal += net
        taxableNet += net
      } else {
        netSubtotal += amount
      }
    } else {
      netSubtotal += amount
      if (l.taxable) taxableNet += amount
    }
  }
  // if any remaining pending group items, they are already accounted in netSubtotal
  netSubtotal = toTwo(netSubtotal)
  taxableNet = toTwo(taxableNet)
  const discountPct = Number(values.discountPct || 0) / 100
  const shipping = Number(values.shipping || 0)
  const rawDiscountAmt = netSubtotal * discountPct
  const discountAmt = toTwo(rawDiscountAmt)
  let taxAmt = 0, total = 0
  if (values.applyDiscountAfterTax) {
    taxAmt = bankersRound(taxableNet * r, 2)
    const gross = netSubtotal + taxAmt
    total = Number((gross - discountAmt + shipping).toFixed(2))
  } else {
    const taxableShare = netSubtotal > 0 ? (taxableNet / netSubtotal) : 0
    const taxableDiscount = rawDiscountAmt * taxableShare
    const discountedTaxBase = Math.max(0, taxableNet - taxableDiscount)
    taxAmt = bankersRound(discountedTaxBase * r, 2)
    const netAfterDiscount = Math.max(0, netSubtotal - discountAmt)
    total = toTwo(netAfterDiscount + taxAmt + shipping)
  }
  // return processed lines so UI can reflect subtotals and line amounts
  return { withAmounts: processed, subtotal: netSubtotal, taxableSubtotal: taxableNet, discountAmt, taxAmt, total, shipping }
}

export default function NewInvoiceForm() {
  const router = useRouter()
  const defaultNumber = useMemo(() => `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`, [])
  const [error, setError] = useState<string | null>(null)
  const [depositTouched, setDepositTouched] = useState(false)
  const [isPending, startTransition] = useTransition()
  // Settings
  type InvoiceSettings = {
    sales: boolean; discount: boolean; deposit: boolean; customNumbers: boolean; tags: boolean;
    optCols: { date: boolean; productService: boolean; sku: boolean }
    header: { terms: boolean; dueDate: boolean; shipTo: boolean; invoiceNumber: boolean; invoiceDate: boolean }
    showTaxSummary: boolean
    showShipping: boolean
    customFieldNames: string[]
  }
  const defaultSettings = useMemo<InvoiceSettings>(() => ({ sales: true, discount: true, deposit: false, customNumbers: true, tags: true, optCols: { date: true, productService: true, sku: false }, header: { terms: true, dueDate: true, shipTo: true, invoiceNumber: true, invoiceDate: true }, showTaxSummary: true, showShipping: true, customFieldNames: [] }), [])
  const [settings, setSettings] = useState<InvoiceSettings>(defaultSettings)
  // column widths for table columns (header-controlled resizing)
  const [colWidths, setColWidths] = useState<Record<string, number>>({
    drag: 32,
    productService: 180,
    sku: 90,
    date: 120,
    description: 380,
    qty: 80,
    rate: 100,
    amount: 110,
    tax: 80,
    class: 120,
    actions: 80,
  })
  const [rowWidths, setRowWidths] = useState<Record<number, number>>({})
  const [productRowWidths, setProductRowWidths] = useState<Record<number, number>>({})
  const [dateRowWidths, setDateRowWidths] = useState<Record<number, number>>({})
  // persistence keys for widths (session-level; can be upgraded to per-invoice or server-side later)
  const ROW_WIDTHS_KEY = 'hb.invoice.rowWidths.v1'
  const PRODUCT_ROW_WIDTHS_KEY = 'hb.invoice.productRowWidths.v1'
  const DATE_ROW_WIDTHS_KEY = 'hb.invoice.dateRowWidths.v1'

  // rehydrate persisted widths on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ROW_WIDTHS_KEY)
      if (raw) setRowWidths(JSON.parse(raw))
    } catch {}
    try {
      const raw = localStorage.getItem(PRODUCT_ROW_WIDTHS_KEY)
      if (raw) setProductRowWidths(JSON.parse(raw))
    } catch {}
    try {
      const raw = localStorage.getItem(DATE_ROW_WIDTHS_KEY)
      if (raw) setDateRowWidths(JSON.parse(raw))
    } catch {}
  }, [])

  // persist whenever widths update
  useEffect(() => {
    try { localStorage.setItem(ROW_WIDTHS_KEY, JSON.stringify(rowWidths)) } catch {}
  }, [rowWidths])
  useEffect(() => {
    try { localStorage.setItem(PRODUCT_ROW_WIDTHS_KEY, JSON.stringify(productRowWidths)) } catch {}
  }, [productRowWidths])
  useEffect(() => {
    try { localStorage.setItem(DATE_ROW_WIDTHS_KEY, JSON.stringify(dateRowWidths)) } catch {}
  }, [dateRowWidths])

  function updateColWidth(colKey: string, next: number) {
    setColWidths(prev => ({ ...prev, [colKey]: next }))
  }
  const [activeTab, setActiveTab] = useState<'invoice'|'settings'|'customize'>('invoice')
  const [attachments, setAttachments] = useState<File[]>([])
  const [desiredLayoutTab] = useState<'design'|'content'|'payment'|'emails'>('design')
  const [currentLayout, setCurrentLayout] = useState<InvoiceLayout | null>(null)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  // Controlled mounting & visibility for smooth enter/exit animations
  const [isDiscardMounted, setIsDiscardMounted] = useState(false)
  const [isDiscardVisible, setIsDiscardVisible] = useState(false)
  const discardAnimTimer = useRef<number | null>(null)
  const DISCARD_ANIM_MS = 240

  async function loadLatestLayout(): Promise<InvoiceLayout | null> {
    try { const res = await fetch('/api/invoice-layout', { cache: 'no-store' }); if (res.ok) { const data = await res.json(); return data?.layout || null } } catch {}
    try { const raw = localStorage.getItem('hb.invoice.layout'); if (raw) return JSON.parse(raw) } catch {}
    return null
  }
  function applyLayoutToSettings(layout: InvoiceLayout) {
    setSettings(prev => {
      const next = {
        ...prev,
        // Editor-visible (no-toggle) fields are always present in the editor
        discount: true, // Editor always shows Discount
        deposit: !!layout.showDeposit,
        tags: !!layout.showTagsEditor,
        header: {
          terms: true,
          dueDate: true,
          shipTo: !!(layout.showShippingAddressEditor ?? layout.showShippingAddress ?? true),
          invoiceNumber: true,
          invoiceDate: true,
        },
        showShipping: !!(layout.showShippingEditor ?? true),
        // Date column in the editor follows the service date editor toggle in the layout
        optCols: { ...prev.optCols, date: !!(layout.showServiceDateEditor ?? true), productService: true, sku: !!layout.showSKUEditor },
        showTaxSummary: true,
      }
      try {
        if (JSON.stringify(prev) === JSON.stringify(next)) return prev
      } catch {
        // fallthrough: on any stringify error just apply
      }
      return next
    })
  }
  useEffect(() => {
    let alive = true
    ;(async () => {
      const latest = await loadLatestLayout()
      if (!alive || !latest) return
      try {
        // If we already have that layout loaded, skip applying to avoid no-op updates
        if (currentLayout && JSON.stringify(currentLayout) === JSON.stringify(latest)) return
      } catch {}
      startTransition(()=> { applyLayoutToSettings(latest); setCurrentLayout(latest) })
    })()
    return () => { alive = false }
  }, [startTransition])

  const { register, handleSubmit, watch, reset, setValue, control, formState: { errors, isSubmitting, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { number: defaultNumber, customerId: '', customerEmail: '', cc: '', bcc: '', date: new Date().toISOString().slice(0, 10), terms: 'Net 30', location: '', amountsMode: 'exclusive', lines: [ { description: '', qty: 1, rate: 0, taxable: false } ], discountPct: 0, taxPct: 0, deposit: 0, shipping: 0, applyDiscountAfterTax: false, makeRecurring: { enabled: false, frequency: 'monthly', startDate: new Date().toISOString().slice(0,10) }, customFields: {} },
  })
  const { fields, append, remove, replace, move } = useFieldArray({ control, name: 'lines' })
  // unify drag logic via shared hook
  const { draggingIdx, dragOverIdx, handleDragStart, handleDragOver, handleDrop, handleDragEnd, moveUp, moveDown } = useRowReorder((from:number, to:number) => move(from, to))
  const [liveMessage, setLiveMessage] = useState('')
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; terms?: string; email?: string; billingAddress?: string }>>([])
  const [closedThrough, setClosedThrough] = useState<string | null>(null)

  // Permissions guard
  useEffect(() => { let alive = true; (async () => { try { const r = await fetch('/api/user/profile', { cache: 'no-store' }); const p = r.ok ? await r.json() : null; const can = !!p?.permissions?.includes?.('invoices:write'); if (alive && !can) router.replace(toHref('/invoices')) } catch {} })(); return () => { alive = false } }, [router])
  // Closed-through date
  useEffect(() => { let alive = true; (async () => { try { const res = await fetch('/api/periods', { cache: 'no-store' }); if (res.ok) { const data = await res.json(); if (alive) setClosedThrough(data?.closedThrough || null) } } catch {} })(); return () => { alive = false } }, [])

  const date = watch('date'); const terms = watch('terms'); const customerId = watch('customerId'); const linesWatch = watch('lines'); const discountPct = watch('discountPct'); const taxPct = watch('taxPct'); const recurring = watch('makeRecurring'); const amountsMode = watch('amountsMode'); const deposit = watch('deposit'); const applyDiscountAfterTax = watch('applyDiscountAfterTax'); const shippingAmt = watch('shipping')
  const dueDatePreview = useMemo(() => calculateDueDate(date, terms), [date, terms])
  const totals = useMemo(()=> deriveTotals({ number: '', customerId: '', date, terms, lines: linesWatch||[], discountPct, taxPct, deposit, shipping: Number(shippingAmt||0), amountsMode, applyDiscountAfterTax, message: '', memo: '', makeRecurring: recurring }), [linesWatch, discountPct, taxPct, amountsMode, applyDiscountAfterTax, deposit, shippingAmt, date, terms, recurring])
  const isBlocked = useMemo(() => { if (!closedThrough) return false; const d = (date || '').slice(0,10); return d !== '' && d <= closedThrough }, [closedThrough, date])
  
  // Enhanced payment received behavior: clamp, validate, and derive balance due (memoized to prevent blinking)
  const depositValue = useMemo(() => Number(deposit || 0), [deposit])
  const clampedDeposit = useMemo(() => depositValue > totals.total ? totals.total : depositValue, [depositValue, totals.total])
  const depositTooHigh = useMemo(() => depositValue > totals.total && totals.total > 0, [depositValue, totals.total])
  const balanceDue = useMemo(() => Number((Math.max(0, totals.total - clampedDeposit)).toFixed(2)), [totals.total, clampedDeposit])
  // The preview should include shipping only when the editor field is visible
  const previewShipping = settings.showShipping ? totals.shipping : 0

  useEffect(() => { const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = prev } }, [])

  // Settings persistence & discount sync
  useEffect(() => { try { const raw = localStorage.getItem('invoiceSettings'); if (raw) setSettings({ ...defaultSettings, ...JSON.parse(raw) }) } catch {} }, [defaultSettings])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hb.invoice.layout')
      if (!raw) return
      const latest = JSON.parse(raw)
      const want = !!latest.applyDiscountAfterTax
      // Only set if the current form value differs to avoid unnecessary updates
      if (applyDiscountAfterTax === want) return
      setValue('applyDiscountAfterTax', want, { shouldDirty: true })
    } catch {}
  }, [setValue, applyDiscountAfterTax])
  useEffect(() => { try { localStorage.setItem('invoiceSettings', JSON.stringify(settings)) } catch {}; if (!settings.discount) setValue('discountPct', 0, { shouldDirty: true }) }, [settings, setValue])

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      const dueDate = calculateDueDate(values.date, values.terms)
      const t = deriveTotals(values)
      const lineItems = t.withAmounts.map(l => ({ description: l.description, amount: l.amount }))
      await api('/api/invoices', { method: 'POST', body: JSON.stringify({ number: values.number, customerId: values.customerId, date: values.date, terms: values.terms, dueDate, items: lineItems, shipping: Number(values.shipping || 0) }) })
      if (values.makeRecurring?.enabled) {
        const body = { kind: 'invoice', name: `Recurring: ${values.number}`, status: 'active', startDate: values.makeRecurring.startDate || values.date, endDate: values.makeRecurring.endDate || undefined, frequency: values.makeRecurring.frequency || 'monthly', mode: 'scheduled', remainingRuns: values.makeRecurring.occurrences, totalRuns: values.makeRecurring.occurrences, lines: lineItems.map(li => ({ description: li.description, amount: li.amount })), memo: '', currency: 'USD' }
        try { await fetch('/api/recurring-transactions', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) }) } catch {}
      }
      router.push(toHref('/invoices'))
    } catch (e: any) { setError(e.message || 'Failed to create invoice') }
  }

  useEffect(() => { function beforeUnload(e: BeforeUnloadEvent) { if (isDirty) { e.preventDefault(); e.returnValue = '' } } window.addEventListener('beforeunload', beforeUnload); return () => window.removeEventListener('beforeunload', beforeUnload) }, [isDirty])

  function handleClose() {
    if (isDirty) {
      // open confirmation modal instead of native confirm
      setShowDiscardConfirm(true)
      return
    }
    router.back()
  }

  function cancelDiscard() { setShowDiscardConfirm(false) }
  function confirmDiscard() {
    // start the exit transition first, then navigate after animation completes
    setShowDiscardConfirm(false)
    // ensure we wait long enough for exit animation to finish
    window.setTimeout(() => router.back(), DISCARD_ANIM_MS)
  }

  // Manage mount & visibility so animation plays on open & close
  useEffect(() => {
    if (showDiscardConfirm) {
      // mount and allow a tick for CSS transition
      if (discardAnimTimer.current) { window.clearTimeout(discardAnimTimer.current); discardAnimTimer.current = null }
      setIsDiscardMounted(true)
      // allow the DOM to update then show
      const t = window.setTimeout(() => setIsDiscardVisible(true), 10)
      discardAnimTimer.current = t
      return () => { window.clearTimeout(t); discardAnimTimer.current = null }
    }

    // Start hiding and unmount after animation duration
    setIsDiscardVisible(false)
    if (isDiscardMounted) {
      const t = window.setTimeout(() => { setIsDiscardMounted(false); discardAnimTimer.current = null }, DISCARD_ANIM_MS)
      discardAnimTimer.current = t
      return () => { window.clearTimeout(t); discardAnimTimer.current = null }
    }
  }, [showDiscardConfirm, isDiscardMounted])
  function onDialogKeyDown(e: React.KeyboardEvent<HTMLDivElement>) { if (e.key === 'Escape') { e.preventDefault(); handleClose(); return } if (e.key === 'Tab') { const root = e.currentTarget; const focusables = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')); if (!focusables.length) return; const first = focusables[0]; const last = focusables[focusables.length - 1]; if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus() } } else { if (document.activeElement === last) { e.preventDefault(); first.focus() } } } }

  // Opening animation state for the main dialog
  const [isDialogMounted, setIsDialogMounted] = useState(true)
  const [isDialogVisible, setIsDialogVisible] = useState(false)
  useEffect(() => {
    // animate in on mount
    const t = window.setTimeout(() => setIsDialogVisible(true), 10)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-hidden="true" onClick={handleClose} />
      <div
        role="dialog"
        data-testid="invoice-dialog"
        aria-modal="true"
        aria-labelledby="invoice-modal-title"
        aria-describedby="invoice-modal-desc"
        onKeyDown={onDialogKeyDown}
        className={`absolute flex flex-col !bg-white rounded-2xl border border-slate-200/60 p-4 md:p-6 shadow-[0_12px_24px_rgba(15,23,42,0.18),_0_36px_72px_rgba(15,23,42,0.20)] inset-0 m-2 md:m-4 w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] h-[calc(100%-1rem)] md:h-[calc(100%-2rem)] transition-all duration-300 ease-out transform ${isDialogVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'}`}>
        <div className="flex items-center justify-between mb-3 shrink-0 bg-white border-b border-slate-200 pb-2">
          <h1 id="invoice-modal-title" className="text-lg font-semibold text-slate-900">{activeTab === 'settings' ? 'Invoice Settings' : activeTab === 'invoice' ? 'New Invoice' : 'Customize Invoice Layout'}</h1>
          {activeTab === 'invoice' && (<button type="button" aria-label="Customize Invoice Layout" title="Customize Invoice Layout" className="btn-secondary" onClick={()=> setActiveTab('customize')}>Customize Invoice Layout</button>)}
        </div>

        {isDiscardMounted && typeof document !== 'undefined' && createPortal(
          <div role="dialog" aria-modal="true" aria-labelledby="discard-title" className="fixed left-1/2 top-[40%] z-[80] w-[min(520px,94%)] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div
              className={`bg-white rounded-xl shadow-[0_30px_80px_rgba(2,6,23,0.55),_0_16px_40px_rgba(2,6,23,0.36)] z-[90] w-full p-5 border border-slate-200 transition-all duration-240 ease-out transform ${isDiscardVisible ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95'}`}
            >
              <h2 id="discard-title" className="text-lg font-semibold">Discard unsaved invoice changes?</h2>
              <p className="text-sm text-slate-600 mt-2">You have unsaved changes on this invoice. If you discard, your edits will be lost.</p>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={cancelDiscard}>Cancel</button>
                <button type="button" className="btn-danger" onClick={confirmDiscard}>Discard changes</button>
              </div>
            </div>
          </div>,
          document.body
        )}
        {/* overlay covers the entire dialog area (including header/footer) so action buttons are blocked */}
      {/* discard-overlay mounted at top-level so it can truly be full-screen */}
      {isDiscardMounted && typeof document !== 'undefined' && createPortal(
        <div
          data-testid="discard-overlay"
          className={`fixed inset-0 z-[70] bg-black/40 transition-opacity duration-200 ${isDiscardVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={cancelDiscard}
        />,
        document.body
      )}
        <div className={`flex-1 min-h-0 ${isDiscardMounted ? 'overflow-hidden' : 'overflow-y-auto'} pr-1 relative`}>
          {closedThrough && (<div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" aria-live="polite">Closed through: <strong>{formatMMDDYYYY(closedThrough)}</strong>. Invoices dated on or before this date will be blocked.</div>)}
          {activeTab === 'invoice' ? (
            <form id="invoice-form" noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {settings.header.invoiceNumber && (
                <div className="relative">
                  <label htmlFor="inv-number" className="block text-sm font-medium text-slate-700">Invoice #</label>
                  <input id="inv-number" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" readOnly={!settings.customNumbers} aria-describedby={errors.number ? 'inv-number-error' : undefined} {...register('number')} />
                  {errors.number && <p className="text-red-600 text-sm mt-1" id="inv-number-error" role="alert">{errors.number.message}</p>}
                  {!settings.customNumbers && <p className="absolute -bottom-5 text-xs text-slate-500">Autogenerated</p>}
                </div>)}
                {settings.header.invoiceDate && (
                <div>
                  <label htmlFor="inv-date" className="block text-sm font-medium text-slate-700">Date</label>
                  <input id="inv-date" type="date" className="w-full rounded-xl bg-white text-slate-900 border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" aria-describedby={errors.date ? 'inv-date-error' : undefined} {...register('date')} />
                  {errors.date && <p className="text-red-600 text-sm mt-1" id="inv-date-error" role="alert">{errors.date.message}</p>}
                  {closedThrough && (<p className="text-amber-700 text-sm mt-1" role="status">{isBlocked ? 'Selected date is within a closed period. Choose a later date.' : 'Dates on or before the closed-through date are blocked.'}</p>)}
                </div>)}
                <div>
                  <label htmlFor="inv-location" className="block text-sm font-medium text-slate-700">Location</label>
                  <input id="inv-location" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" placeholder="Optional" {...register('location')} />
                </div>
                {settings.header.terms && (
                  <div>
                    <label htmlFor="inv-terms" className="block text-sm font-medium text-slate-700">Terms</label>
                    <select id="inv-terms" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400/50" {...register('terms')}>{TERMS_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  </div>
                )}
                {settings.header.dueDate && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Due Date</label>
                    <input aria-label="Due Date" readOnly value={dueDatePreview} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-700" />
                    <button type="button" className="mt-1 text-xs text-sky-600 hover:underline" onClick={()=>{ setValue('makeRecurring.enabled', true, { shouldDirty: true }) }}>Create recurring invoice</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="inv-customer" className="block text-sm font-medium text-slate-700">Customer</label>
                  {/* custom dropdown for customers */}
                  <div className="relative" ref={(el)=>{/* container ref not stored here */}}>
                    <CustomerDropdown
                      id="inv-customer"
                      value={watch('customerId') || ''}
                      onSelect={(id: string) => setValue('customerId', id, { shouldDirty: true })}
                      customers={customers}
                      ariaDescribedBy={errors.customerId ? 'inv-customer-error' : undefined}
                      placeholder="Select customer…"
                    />
                  </div>
                  {errors.customerId && <p className="text-red-600 text-sm mt-1" id="inv-customer-error" role="alert">{errors.customerId.message}</p>}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label htmlFor="inv-email" className="block text-sm font-medium text-slate-700">Customer email</label>
                      <input id="inv-email" type="email" placeholder="name@example.com" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" {...register('customerEmail')} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600" htmlFor="inv-cc">Cc</label><input id="inv-cc" type="text" className="w-full rounded-md border border-slate-200 px-2 py-1" {...register('cc')} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600" htmlFor="inv-bcc">Bcc</label><input id="inv-bcc" type="text" className="w-full rounded-md border border-slate-200 px-2 py-1" {...register('bcc')} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-700">Online payments <span className="text-xs text-sky-600 ml-1">Get set up</span></label>
                    <label className="mt-1 inline-flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" /> Cards <span className="text-slate-400 text-xs">💳</span></label>
                  </div>
                </div>
                <div>
                  {settings.tags && (<div><label className="block text-sm font-medium text-slate-700">Tags</label><div className="rounded-xl border border-slate-200 bg-white px-3 py-2"><TagSelect /></div><div className="mt-1"><a href="/tags" className="text-xs text-sky-600 hover:underline">Manage Tags</a></div></div>)}
                  <div className="mt-4"><label className="block text-sm font-medium text-slate-700" htmlFor="inv-billing-address">Billing address</label><textarea id="inv-billing-address" aria-label="Billing address" title="Billing address" readOnly rows={4} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2" value={(customers.find(c=>c.id===customerId)?.billingAddress)||''} /></div>
                  {settings.header.shipTo && (<div className="mt-4"><label className="block text-sm font-medium text-slate-700" htmlFor="inv-shipping-address">Shipping address</label><textarea id="inv-shipping-address" aria-label="Shipping address" title="Shipping address" readOnly rows={4} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2" value={(customers.find(c=>c.id===customerId)?.billingAddress)||''} /></div>)}
                </div>
              </div>
              <Loader setCustomers={setCustomers} />
              <AutoTerms customers={customers} customerId={customerId} setValue={setValue} />
              {settings.sales && (
                <div>
                  <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-slate-700">Line Items</span></div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <div aria-live="polite" role="status" className="sr-only">{liveMessage}</div>
                    <table className="min-w-full text-sm">
                      {/* colgroup controls column widths so the header resizer can update column sizes */}
                      <colgroup>
                        <col data-col="drag" style={{ width: `${colWidths?.drag ?? 32}px` }} />
                        {settings.optCols.productService && <col data-col="productService" style={{ width: `${colWidths?.productService ?? 180}px` }} />}
                        {settings.optCols.sku && <col data-col="sku" style={{ width: `${colWidths?.sku ?? 90}px` }} />}
                        {settings.optCols.date && <col data-col="date" style={{ width: `${colWidths?.date ?? 120}px` }} />}
                        <col data-col="description" style={{ width: `${colWidths?.description ?? 380}px` }} />
                        <col data-col="qty" style={{ width: `${colWidths?.qty ?? 80}px` }} />
                        <col data-col="rate" style={{ width: `${colWidths?.rate ?? 100}px` }} />
                        <col data-col="amount" style={{ width: `${colWidths?.amount ?? 110}px` }} />
                        <col data-col="tax" style={{ width: `${colWidths?.tax ?? 80}px` }} />
                        <col data-col="class" style={{ width: `${colWidths?.class ?? 120}px` }} />
                        <col data-col="actions" style={{ width: `${colWidths?.actions ?? 80}px` }} />
                      </colgroup>
                      <thead className="text-slate-600">
                        <tr>
                          <th className="w-8 border-r border-slate-200" aria-hidden>
                            <div className="relative h-full" />
                          </th>
                          {settings.optCols.productService && (
                            <ResizableColumn colKey="productService" width={colWidths.productService} onChange={updateColWidth} className="px-2 py-2 text-left border-r border-slate-200">Product/Service</ResizableColumn>
                          )}
                          {settings.optCols.sku && (
                            <ResizableColumn colKey="sku" width={colWidths.sku} onChange={updateColWidth} className="px-2 py-2 text-left border-r border-slate-200">SKU</ResizableColumn>
                          )}
                          {settings.optCols.date && (
                            <ResizableColumn colKey="date" width={colWidths.date} onChange={updateColWidth} className="px-2 py-2 text-left border-r border-slate-200">Date</ResizableColumn>
                          )}
                          <ResizableColumn colKey="description" width={colWidths.description} onChange={updateColWidth} className="px-2 py-2 text-left border-r border-slate-200">Description</ResizableColumn>
                          <ResizableColumn colKey="qty" width={colWidths.qty} onChange={updateColWidth} className="px-2 py-2 text-right border-r border-slate-200">Qty</ResizableColumn>
                          <ResizableColumn colKey="rate" width={colWidths.rate} onChange={updateColWidth} className="px-2 py-2 text-right border-r border-slate-200">Rate</ResizableColumn>
                          <ResizableColumn colKey="amount" width={colWidths.amount} onChange={updateColWidth} className="px-2 py-2 text-right border-r border-slate-200">Amount</ResizableColumn>
                          <ResizableColumn colKey="tax" width={colWidths.tax} onChange={updateColWidth} className="px-2 py-2 text-center border-r border-slate-200">Sales Tax</ResizableColumn>
                          <ResizableColumn colKey="class" width={colWidths.class} onChange={updateColWidth} className="px-2 py-2 text-left border-r border-slate-200">Class</ResizableColumn>
                          <ResizableColumn colKey="actions" width={colWidths.actions} onChange={updateColWidth} className="px-2 py-2">&nbsp;</ResizableColumn>
                        </tr>
                      </thead>
                      <tbody className="text-slate-800">{
                        (() => {
                          // Render processed rows (lines + subtotal markers) from deriveTotals so subtotal rows appear in the table
                          const optCount = (settings.optCols.productService ? 1 : 0) + (settings.optCols.sku ? 1 : 0) + (settings.optCols.date ? 1 : 0)
                          const totalCols = 7 + optCount // description, qty, rate, amount, sales tax, class, action plus optional columns
                          return (totals.withAmounts || []).map((entry: any, displayIdx: number) => {
                            if (entry.kind === 'subtotal') {
                              // Render a subtotal row that places the amount in the same column as 'Amount'
                              // account for drag-handle column (+1) — optional cols + description, qty, rate
                              const leftSpan = optCount + 4 // cols before amount: drag + optional cols + description, qty, rate
                              const remaining = Math.max(0, totalCols - (leftSpan + 2))
                              return (
                                <tr
                                    key={`subtotal-${displayIdx}`}
                                    className={`border-t border-slate-200 bg-slate-50 ${draggingIdx===displayIdx ? 'opacity-60' : ''} ${dragOverIdx===displayIdx ? 'ring-1 ring-sky-200' : ''}`}
                                    data-index={displayIdx}
                                    onDragOver={(e) => handleDragOver(e, displayIdx)}
                                    onDrop={(e) => handleDrop(e, displayIdx)}
                                    onDragEnd={handleDragEnd}
                                    aria-grabbed={draggingIdx === displayIdx ? 'true' : 'false'}
                                  >
                                    {/* Drag handle cell for subtotal rows (row is not draggable by clicking the row) */}
                                    <td className="px-3 py-2 w-8 align-middle">
                                      <button
                                        aria-label={`Drag row ${displayIdx}`}
                                        title="Drag to reorder"
                                        draggable
                                        type="button"
                                        onDragStart={(e) => handleDragStart(e, displayIdx)}
                                        onDragEnd={handleDragEnd}
                                        className="text-slate-400 hover:text-slate-600 p-1"
                                      >
                                        <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                          <circle cx="5" cy="3" r="1.4" fill="currentColor" />
                                          <circle cx="5" cy="7" r="1.4" fill="currentColor" />
                                          <circle cx="5" cy="11" r="1.4" fill="currentColor" />
                                        </svg>
                                      </button>
                                    </td>
                                    <td className="px-3 py-2 font-medium" colSpan={leftSpan - 1} role="cell">Subtotal</td>
                                  <td className="px-3 py-2 text-right font-medium" role="cell">{(entry.amount ?? 0).toFixed(2)}</td>
                                  <td className="px-3 py-2 text-right" role="cell"><button type="button" className="btn-ghost text-sm text-red-600" onClick={() => remove(displayIdx)} aria-label={`Remove subtotal at row ${displayIdx}`}>Remove</button></td>
                                  {Array.from({ length: remaining }).map((_, i) => <td key={`pad-${displayIdx}-${i}`} />)}
                                </tr>
                              )
                            }

                            // Each processed entry corresponds to the backing field at the same index
                            const idx = displayIdx
                            const amount = Number((entry.amount || ((linesWatch?.[idx]?.qty || 0) * (linesWatch?.[idx]?.rate || 0))).toFixed(2))
                            const key = fields[idx] ? fields[idx].id : `line-${displayIdx}`
                            // no pointer logic needed — mapping is index-aligned
                              return (
                              <tr key={key} className={`border-t border-slate-200 ${draggingIdx===displayIdx ? 'opacity-60' : ''} ${dragOverIdx===displayIdx ? 'ring-1 ring-sky-200' : ''}`} data-index={displayIdx} onDragOver={(e) => handleDragOver(e, displayIdx)} onDrop={(e) => handleDrop(e, displayIdx)} onDragEnd={handleDragEnd} aria-grabbed={draggingIdx === displayIdx ? 'true' : 'false'}>
                                <td className="px-3 py-2 align-middle w-8">
                                  <div
                                    className="flex items-center gap-1"
                                    tabIndex={0}
                                    role="group"
                                    aria-label={`Row ${displayIdx + 1} move controls`}
                                    onKeyDown={(e) => {
                                      if (e.key === 'ArrowUp') {
                                        e.preventDefault()
                                        if (displayIdx > 0) {
                                          moveUp(displayIdx)
                                          setLiveMessage(`Moved row ${displayIdx + 1} to ${displayIdx}`)
                                        }
                                      } else if (e.key === 'ArrowDown') {
                                        e.preventDefault()
                                        if (displayIdx < fields.length - 1) {
                                          moveDown(displayIdx, fields.length - 1)
                                          setLiveMessage(`Moved row ${displayIdx + 1} to ${displayIdx + 2}`)
                                        }
                                      }
                                    }}
                                  >
                                    <button aria-label={`Move row up ${displayIdx}`} type="button" className="text-xs text-slate-500" onClick={()=> { moveUp(displayIdx); setLiveMessage(`Moved row ${displayIdx + 1} to ${displayIdx}`) }} disabled={displayIdx<=0}>▲</button>
                                    <button aria-label={`Move row down ${displayIdx}`} type="button" className="text-xs text-slate-500" onClick={()=> { moveDown(displayIdx, fields.length - 1); setLiveMessage(`Moved row ${displayIdx + 1} to ${displayIdx + 2}`) }} disabled={displayIdx >= (fields.length-1)}>▼</button>
                                    {/* Drag handle: only this button is draggable, not the entire row. Click-and-hold to drag the row. */}
                                    <button
                                      aria-label={`Drag row ${displayIdx}`}
                                      title="Drag to reorder"
                                      draggable
                                      type="button"
                                      onDragStart={(e) => handleDragStart(e, displayIdx)}
                                      onDragEnd={handleDragEnd}
                                      className="text-slate-400 hover:text-slate-600 p-1"
                                    >
                                      {/* simple grip icon (vertical dots) */}
                                      <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                        <circle cx="5" cy="3" r="1.4" fill="currentColor" />
                                        <circle cx="5" cy="7" r="1.4" fill="currentColor" />
                                        <circle cx="5" cy="11" r="1.4" fill="currentColor" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                                {settings.optCols.productService && (
                                  <td className="p-0">
                                    <div style={{ width: productRowWidths[idx] ? `${productRowWidths[idx]}px` : undefined }} className="relative">
                                      <ProductDropdown triggerClassName="line-item-input--compact rounded-none px-0 py-0 text-[13.5px]" id={`lines.${idx}.item`} value={String(linesWatch?.[idx]?.item||'')} onSelect={(v)=> setValue(`lines.${idx}.item`, v, { shouldDirty: true })} />
                                      <InlineWidthResizer label="productService" rowIndex={idx} width={productRowWidths[idx] ?? colWidths.productService} onChange={(r,w) => setProductRowWidths(prev => ({ ...(prev || {}), [r]: w }))} min={60} />
                                    </div>
                                  </td>
                                )}
                                {settings.optCols.sku && (<td className="p-0"><input className="line-item-input--compact w-full rounded-none bg-white border border-slate-200 px-0 py-0 text-[13.5px]" placeholder="SKU" {...register(`lines.${idx}.sku` as const)} /></td>)}
                                {settings.optCols.date && (
                                  <td className="p-0">
                                    <div className="relative">
                                      <input type="date" className="line-item-date--square line-item-input--compact rounded-none bg-white border border-slate-200 px-0 py-0 text-[13.5px]" {...register(`lines.${idx}.date` as const)} style={{ width: dateRowWidths[idx] ? `${dateRowWidths[idx]}px` : '100%' }} />
                                      <InlineWidthResizer label="date" rowIndex={idx} width={dateRowWidths[idx] ?? colWidths.date} onChange={(r,w) => setDateRowWidths(prev => ({ ...(prev || {}), [r]: w }))} min={48} />
                                    </div>
                                  </td>
                                )}
                                <td className="p-0">
                                  <div className="relative">
                                    <input style={{ width: rowWidths[idx] ? `${rowWidths[idx]}px` : '100%' }} className="line-item-input--compact rounded-none bg-white border border-slate-200 px-0 py-0 text-[13.5px]" placeholder="Description" {...register(`lines.${idx}.description` as const)} />
                                    <InlineWidthResizer label="description" rowIndex={idx} width={rowWidths[idx] ?? colWidths.description} onChange={(r,w) => setRowWidths(prev => ({ ...(prev || {}), [r]: w }))} min={60} />
                                  </div>
                                </td>
                                <td className="p-0 text-right"><input type="number" step="0.01" min={0.01} className="line-item-input--compact w-full rounded-none bg-white border border-slate-200 px-0 py-0 text-[13.5px] text-right" {...register(`lines.${idx}.qty` as const)} /></td>
                                <td className="p-0 text-right"><input type="number" step="0.01" min={0} className="line-item-input--compact w-full rounded-none bg-white border border-slate-200 px-0 py-0 text-[13.5px] text-right" {...register(`lines.${idx}.rate` as const)} /></td>
                                <td className="p-0 text-right"><input readOnly value={amount} className="line-item-input--compact w-full rounded-none bg-slate-50 border border-slate-200 px-0 py-0 text-[13.5px] text-right" /></td>
                                <td className="px-3 py-2 text-center"><input type="checkbox" {...register(`lines.${idx}.taxable` as const)} /></td>
                                <td className="p-0"><input className="line-item-input--compact w-full rounded-none bg-white border border-slate-200 px-0 py-0 text-[13.5px]" placeholder="Class" {...register(`lines.${idx}.class` as const)} /></td>
                                <td className="px-3 py-2 text-right"><button type="button" className="btn-ghost text-red-600" onClick={()=> remove(idx)} disabled={fields.length<=1} aria-label={`Remove line ${idx}`} title="Remove"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden><path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button></td>
                              </tr>
                            )
                          })
                        })()
                      }</tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2"><button type="button" className="btn-secondary" onClick={()=> append({ description:'', qty:1, rate:0, taxable:false })}>Add lines</button><button type="button" className="btn-secondary" onClick={()=> replace([{ description:'', qty:1, rate:0, taxable:false }])}>Clear all lines</button><button type="button" className="btn-secondary" onClick={()=> append({ description:'Subtotal', qty:0, rate:0, taxable:false })}>Add subtotal</button></div>
                  {errors.lines && <p className="text-red-600 text-sm mt-1">{errors.lines.message as any}</p>}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700" htmlFor="inv-memo">Internal memo</label><textarea id="inv-memo" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" rows={3} {...register('memo')} /></div>
                <div><label className="block text-sm font-medium text-slate-700" htmlFor="inv-message">Message on statement</label><textarea id="inv-message" className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" rows={3} {...register('messageOnStatement')} /></div>
                {settings.customFieldNames.length > 0 && (<div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">{settings.customFieldNames.map(name => (<div key={name}><label className="block text-sm font-medium text-slate-700" htmlFor={`cf-${name}`}>{name}</label><input id={`cf-${name}`} className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2" {...register(`customFields.${name}` as const)} /></div>))}</div>)}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-sm">
                <div className="flex justify-end mb-2"><label className="flex items-center gap-2 text-xs text-slate-600">Amounts are <select className="rounded-md border border-slate-300 px-2 py-1 text-sm" {...register('amountsMode')}><option value="exclusive">Exclusive of Tax</option><option value="inclusive">Inclusive of Tax</option></select></label></div>
                <div className="flex justify-between"><span>Subtotal</span><span>{totals.subtotal.toFixed(2)}</span></div>
                {!applyDiscountAfterTax && (<>{settings.discount && (<div className="flex justify-between"><label className="flex items-center gap-2">Discount %<input type="number" min={0} max={100} step={0.01} className="w-20 rounded border border-slate-300 px-2 py-1 text-right" {...register('discountPct')} /></label><span>-{totals.discountAmt.toFixed(2)}</span></div>)}{settings.showTaxSummary && (<><div className="flex justify-between"><span>Taxable Subtotal</span><span>{totals.taxableSubtotal.toFixed(2)}</span></div><div className="flex justify-between"><label className="flex items-center gap-2">Sales Tax %<input type="number" min={0} max={100} step={0.01} className="w-20 rounded border border-slate-300 px-2 py-1 text-right" {...register('taxPct')} /></label><span>+{totals.taxAmt.toFixed(2)}</span></div></>)}</>)}
                {applyDiscountAfterTax && (settings.showTaxSummary ? (<><div className="flex justify-between"><span>Taxable Subtotal</span><span>{totals.taxableSubtotal.toFixed(2)}</span></div><div className="flex justify-between"><label className="flex items-center gap-2">Sales Tax %<input type="number" min={0} max={100} step={0.01} className="w-20 rounded border border-slate-300 px-2 py-1 text-right" {...register('taxPct')} /></label><span>+{totals.taxAmt.toFixed(2)}</span></div>{settings.discount && (<div className="flex justify-between"><label className="flex items-center gap-2">Discount %<input type="number" min={0} max={100} step={0.01} className="w-20 rounded border border-slate-300 px-2 py-1 text-right" {...register('discountPct')} /></label><span>-{totals.discountAmt.toFixed(2)}</span></div>)}</>) : (<> {settings.discount && (<div className="flex justify-between"><label className="flex items-center gap-2">Discount %<input type="number" min={0} max={100} step={0.01} className="w-20 rounded border border-slate-300 px-2 py-1 text-right" {...register('discountPct')} /></label><span>-{totals.discountAmt.toFixed(2)}</span></div>)} </>))}
                {settings.showShipping && (<div className="flex justify-between"><label className="flex items-center gap-2">Shipping/others<input type="number" min={0} step={0.01} className="w-28 rounded border border-slate-300 px-2 py-1 text-right" {...register('shipping')} /></label><span>+{(totals.shipping||0).toFixed(2)}</span></div>)}
                <div className="flex justify-between font-semibold text-slate-900"><span>Total</span><span>{totals.total.toFixed(2)}</span></div>
                {settings.deposit && (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 text-slate-700">
                        Payment received
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          className="w-32 rounded-md border border-slate-300 px-3 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                          aria-invalid={depositTouched && depositTooHigh}
                          aria-describedby={depositTouched && depositTooHigh ? 'payment-received-error' : undefined}
                          {...register('deposit', {
                            onBlur: (e) => {
                              setDepositTouched(true)
                              let val = Number(e.target.value || 0)
                              if (isNaN(val) || val < 0) val = 0
                              if (val > totals.total) val = totals.total
                              e.target.value = val.toFixed(2)
                              setValue('deposit', val, { shouldDirty: true, shouldValidate: true })
                            },
                            validate: (v) => {
                              const num = Number(v || 0)
                              if (num < 0) return 'Cannot be negative'
                              if (num > totals.total) return 'Cannot exceed invoice total'
                              return true
                            }
                          })}
                        />
                      </label>
                      <span className="text-slate-900 font-medium">-{clampedDeposit.toFixed(2)}</span>
                    </div>
                    <div className="h-4">
                      {depositTouched && depositTooHigh && (
                        <p id="payment-received-error" role="alert" className="text-xs text-red-600">Payment cannot exceed invoice total ({totals.total.toFixed(2)}).</p>
                      )}
                    </div>
                  </div>
                )}
                {settings.deposit && (
                  <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-2 mt-1">
                    <span>Balance due</span>
                    <span>{balanceDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between"><label className="text-sm font-medium text-slate-700 flex items-center gap-2" htmlFor="inv-attachments"><span aria-hidden>📎</span> Attachments</label><span className="text-xs text-slate-500">Maximum size: 25MB</span></div>
                <div onDragOver={(e)=>{ e.preventDefault() }} onDrop={(e)=>{ e.preventDefault(); const files = Array.from(e.dataTransfer.files||[]).filter(f=> f.size <= 25*1024*1024); if (files.length) setAttachments(prev=> [...prev, ...files]) }} className="rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500 px-3 py-6 text-center cursor-pointer" onClick={()=> { (document.getElementById('inv-attachments') as HTMLInputElement | null)?.click() }} role="button" aria-label="Add attachments" tabIndex={0} onKeyDown={(e)=>{ if (e.key==='Enter' || e.key===' ') { e.preventDefault(); (document.getElementById('inv-attachments') as HTMLInputElement | null)?.click() } }}>
                  Drag/Drop files here or click the icon.
                </div>
                <input id="inv-attachments" type="file" multiple className="hidden" onChange={(e)=>{ const files = Array.from(e.target.files||[]).filter(f=> f.size <= 25*1024*1024); if (files.length) setAttachments(prev=> [...prev, ...files]); e.currentTarget.value='' }} />
                {attachments.length>0 && (<ul className="text-xs text-slate-700 list-disc pl-5">{attachments.map((f, i)=> <li key={i}>{f.name} ({(f.size/1024/1024).toFixed(2)} MB)</li>)}</ul>)}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center gap-2"><input type="checkbox" {...register('makeRecurring.enabled')} id="rec-enabled" /><label htmlFor="rec-enabled" className="text-sm font-medium text-slate-700">Make recurring</label></div>
                {recurring?.enabled && (<div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-sm"><div><label className="block text-xs font-medium text-slate-600" htmlFor="rec-frequency">Frequency</label><select id="rec-frequency" className="w-full rounded-md border border-slate-200 px-2 py-1" {...register('makeRecurring.frequency')}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div><div><label className="block text-xs font-medium text-slate-600" htmlFor="rec-start">Start Date</label><input id="rec-start" type="date" className="w-full rounded-md border border-slate-200 px-2 py-1" {...register('makeRecurring.startDate')} /></div><div><label className="block text-xs font-medium text-slate-600" htmlFor="rec-end">End Date</label><input id="rec-end" type="date" className="w-full rounded-md border border-slate-200 px-2 py-1" {...register('makeRecurring.endDate')} /></div><div><label className="block text-xs font-medium text-slate-600" htmlFor="rec-occ">Occurrences</label><input id="rec-occ" type="number" min={1} className="w-full rounded-md border border-slate-200 px-2 py-1" {...register('makeRecurring.occurrences')} /></div><div className="flex items-end"><p className="text-xs text-slate-500">Template created after save.</p></div></div>)}
                {errors.makeRecurring && <p className="text-red-600 text-xs">{errors.makeRecurring.message}</p>}
              </div>
              {error && <div className="text-red-600">{error}</div>}
              {isBlocked && <div className="text-red-600 text-sm">Date is within a closed period. Choose a later date.</div>}
            </form>
          ) : activeTab === 'settings' ? (
            <div><div className="mb-3"><button type="button" className="btn-secondary" onClick={()=> setActiveTab('invoice')}>Back</button></div><SettingsInline settings={settings} onChange={setSettings} /></div>
          ) : (
            <div className="space-y-3">
              <InvoiceLayoutPanel initialTab={desiredLayoutTab} onLayoutChange={(l)=> {
                startTransition(()=> {
                  try {
                    if (currentLayout && JSON.stringify(currentLayout) === JSON.stringify(l)) return
                  } catch {}
                  setCurrentLayout(l);
                  applyLayoutToSettings(l);
                })
              }} previewData={{ invoice: { number: watch('number'), terms, invoiceDate: date, dueDate: dueDatePreview, billTo: (customers.find(c=>c.id===customerId)?.name || 'Client Co.') + (customers.find(c=>c.id===customerId)?.billingAddress ? `\n${customers.find(c=>c.id===customerId)?.billingAddress}` : ''), shipTo: settings.header.shipTo ? (customers.find(c=>c.id===customerId)?.billingAddress || '') : undefined, items: (linesWatch||[]).map(l => ({ name: l.description || 'Item', qty: Number(l.qty||0), rate: Number(l.rate||0), sku: l.sku || undefined, date: l.date || undefined })), discountAmount: totals.discountAmt, paymentsReceived: Number(deposit||0), shipping: previewShipping } }} onBack={()=> { try { const raw = localStorage.getItem('hb.invoice.layout'); if (raw) { const parsed = JSON.parse(raw); startTransition(()=> { try { if (currentLayout && JSON.stringify(currentLayout) === JSON.stringify(parsed)) return } catch {} applyLayoutToSettings(parsed); setCurrentLayout(parsed); if (watch('applyDiscountAfterTax') !== !!parsed.applyDiscountAfterTax) setValue('applyDiscountAfterTax', !!parsed.applyDiscountAfterTax, { shouldDirty: true }) }) } } catch {}; setActiveTab('invoice') }} />
            </div>
          )}
        </div>
        <div className="pt-3 mt-2 border-t bg-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex gap-2"><button type="button" className="btn-secondary" aria-label="Close" onClick={handleClose} disabled={isSubmitting}>Cancel</button></div>
          {activeTab === 'invoice' && (<div className="flex gap-2"><button type="button" className="btn-secondary" disabled={isSubmitting || isPending}>Print / Preview</button><button form="invoice-form" type="submit" className="btn-primary" disabled={isSubmitting || isBlocked || (depositTouched && depositTooHigh) || isPending}>{isSubmitting ? 'Saving…' : 'Save & Send'}</button></div>)}
        </div>
      </div>
    </div>
  )
}

function Loader({ setCustomers }: { setCustomers: (v: Array<{ id: string; name: string; terms?: string; email?: string; billingAddress?: string }>) => void }) { useEffect(() => { let alive = true; (async () => { try { const res = await fetch('/api/customers', { cache: 'no-store' }); if (!res.ok) return; const data = await res.json(); if (alive) setCustomers((data.customers || []).map((c: any) => ({ id: c.id, name: c.name, terms: c.terms, email: c.email, billingAddress: c.billingAddress }))) } catch {} })(); return () => { alive = false } }, [setCustomers]); return null }
function AutoTerms({ customers, customerId, setValue }: { customers: Array<{ id: string; name: string; terms?: string; email?: string }>; customerId: string; setValue: any }) { useEffect(() => { if (!customerId) return; const c = customers.find(x => x.id === customerId); if (c?.terms) setValue('terms', c.terms, { shouldValidate: true, shouldDirty: true }); if (c?.email) setValue('customerEmail', c.email, { shouldDirty: true }) }, [customerId, customers, setValue]); return null }
function SettingsInline({ settings, onChange }: { settings: any; onChange: (s: any) => void }) { function toggle(key: string) { onChange({ ...settings, [key]: !settings[key] }) } function toggleCol(col: 'date'|'productService'|'sku') { onChange({ ...settings, optCols: { ...settings.optCols, [col]: !settings.optCols[col] } }) } function addCustomField() { const name = prompt('Custom field name?')?.trim(); if (!name) return; const next = Array.from(new Set([ ...(settings.customFieldNames||[]), name ])); onChange({ ...settings, customFieldNames: next }) } function removeCustomField(name: string) { onChange({ ...settings, customFieldNames: (settings.customFieldNames||[]).filter((n: string)=> n!==name) }) } return (<div className="space-y-6"><section><h3 className="font-medium text-slate-800 mb-2">Fields</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.sales} onChange={()=> toggle('sales')} /> Sales (show line items)</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.discount} onChange={()=> toggle('discount')} /> Discount</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.deposit} onChange={()=> toggle('deposit')} /> Payment received</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.customNumbers} onChange={()=> toggle('customNumbers')} /> Custom transaction numbers</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.tags} onChange={()=> toggle('tags')} /> Tags</label></div></section><section><h3 className="font-medium text-slate-800 mb-2">Custom Fields</h3><p className="text-xs text-slate-600">Manage custom fields to add more details to invoices.</p><div className="mt-2 space-y-2">{(settings.customFieldNames||[]).length===0 && <p className="text-xs text-slate-500">No custom fields added.</p>}{(settings.customFieldNames||[]).map((name: string) => (<div key={name} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1"><span>{name}</span><button className="text-xs text-red-600" onClick={()=> removeCustomField(name)}>Remove</button></div>))}<button className="btn-secondary" onClick={addCustomField}>+ Add custom field</button></div></section><section><h3 className="font-medium text-slate-800 mb-2">Optional Columns</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.optCols.date} onChange={()=> toggleCol('date')} /> Date</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.optCols.productService} onChange={()=> toggleCol('productService')} /> Product/Service</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.optCols.sku} onChange={()=> toggleCol('sku')} /> SKU</label></div></section></div>) }
