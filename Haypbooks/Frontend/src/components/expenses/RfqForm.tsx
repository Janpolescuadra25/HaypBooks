'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Send, Trash2, Loader2, X, Save } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'

const today = new Date().toISOString().slice(0, 10)
const STATUS_OPTIONS = ['DRAFT', 'SENT', 'RECEIVED', 'CLOSED']
const SHIPPING_TERMS = ['EXW', 'FOB', 'CIF', 'DDP', 'FCA', 'Other']
const genId = () => Math.random().toString(36).slice(2, 9)

interface Vendor { id: string; displayName: string }
interface Account { id: string; code?: string; name?: string }
interface LineItem { id: string; description: string; accountId: string; quantity: number; unitPrice: number; taxRate: number; amount: number }

interface RfqFormProps { mode: 'new' | 'edit'; rfqId?: string }

const defaultLine = (): LineItem => ({ id: genId(), description: '', accountId: '', quantity: 1, unitPrice: 0, taxRate: 0, amount: 0 })
const defaultWidths = { description: 300, account: 180, quantity: 96, unitPrice: 120, taxRate: 110, amount: 120 }

export default function RfqForm({ mode, rfqId }: RfqFormProps) {
  const router = useRouter()
  const toast = useToast()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [vendorSearch, setVendorSearch] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [rfqNumber, setRfqNumber] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [issueDate, setIssueDate] = useState(today)
  const [responseDeadline, setResponseDeadline] = useState('')
  const [shippingTerms, setShippingTerms] = useState('FOB')
  const [status, setStatus] = useState('DRAFT')
  const [internalNotes, setInternalNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLine()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')

  const { entries: activityEntries, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: activeTab === 'activity' && rfqId ? { tableName: 'Rfq', recordId: rfqId } : undefined,
  })

  const filteredVendors = useMemo(() => {
    if (!vendorSearch) return vendors
    const q = vendorSearch.toLowerCase()
    return vendors.filter((v) => v.displayName.toLowerCase().includes(q))
  }, [vendors, vendorSearch])

  useEffect(() => {
    if (!companyId) return
    let active = true
    expensesService.listVendors(companyId).then((res) => {
      if (!active) return
      const data = res.data ?? res
      const list = Array.isArray(data) ? data : data.data ?? []
      setVendors(list.map((v: Record<string, unknown>) => ({ id: String(v.id), displayName: String(v.displayName ?? v.name ?? v.id) })))
    }).catch(() => {})
    accountingService.listAccounts(companyId, { includeInactive: false }).then((res) => {
      if (!active) return
      const data = res.data ?? res
      const list = Array.isArray(data) ? data : data.data ?? []
      setAccounts(list.map((a: Record<string, unknown>) => ({ id: String(a.id), code: a.code ? String(a.code) : undefined, name: a.name ? String(a.name) : undefined })))
    }).catch(() => {})
    return () => { active = false }
  }, [companyId])

  useEffect(() => {
    if (mode !== 'edit' || !rfqId || !companyId) return
    let active = true
    expensesService.getRfq(companyId, rfqId).then((res) => {
      if (!active) return
      const d = res.data ?? res
      setRfqNumber(d.rfqNumber ?? d.number ?? '')
      setVendorId(d.vendorId ?? '')
      setSubject(d.subject ?? '')
      setDescription(d.description ?? '')
      setIssueDate(d.issueDate?.slice(0, 10) ?? today)
      setResponseDeadline(d.responseDeadline?.slice(0, 10) ?? '')
      setShippingTerms(d.shippingTerms ?? 'FOB')
      setStatus(d.status ?? 'DRAFT')
      setInternalNotes(d.internalNotes ?? '')
      if (Array.isArray(d.lines) && d.lines.length > 0) {
        setLineItems(d.lines.map((l: Record<string, unknown>) => ({
          id: genId(), description: String(l.description ?? ''), accountId: String(l.accountId ?? ''),
          quantity: Number(l.quantity ?? 1), unitPrice: Number(l.unitPrice ?? 0),
          taxRate: Number(l.taxRate ?? 0), amount: Number(l.amount ?? 0),
        })))
      }
    }).catch(() => toast.error('Failed to load RFQ'))
    return () => { active = false }
  }, [companyId, rfqId, mode, toast])

  const [colWidths, setColWidths] = useState(defaultWidths)
  const colWidthsRef = useRef(colWidths)
  useEffect(() => { colWidthsRef.current = colWidths }, [colWidths])
  const saveColWidths = useCallback((next: typeof defaultWidths) => {
    setColWidths(next)
    try { localStorage.setItem('rfq-line-cols-v1', JSON.stringify(next)) } catch {}
  }, [])

  const { containerRef: lineTableRef, isOverflowing: lineOverflowing } = useFixedWidthResizableMap({
    widths: colWidths, widthsRef: colWidthsRef,
    order: ['description', 'account', 'quantity', 'unitPrice', 'taxRate', 'amount'],
    saveWidths: saveColWidths, fixedWidth: 64,
    minWidth: { description: 200, account: 140, quantity: 70, unitPrice: 90, taxRate: 90, amount: 110 },
  })

  const subtotal = useMemo(() => lineItems.reduce((s, l) => s + l.quantity * l.unitPrice, 0), [lineItems])
  const taxTotal = useMemo(() => lineItems.reduce((s, l) => s + l.quantity * l.unitPrice * (l.taxRate / 100), 0), [lineItems])
  const total = useMemo(() => subtotal + taxTotal, [subtotal, taxTotal])

  const updateLine = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((items) => items.map((item) => {
      if (item.id !== id) return item
      const next = { ...item, [field]: field === 'description' || field === 'accountId' ? String(value) : Number(value) }
      if (field === 'quantity') next.amount = Number(value) * next.unitPrice
      if (field === 'unitPrice') next.amount = next.quantity * Number(value)
      return next
    }))
  }, [])

  const addLine = useCallback(() => setLineItems((items) => [...items, defaultLine()]), [])
  const removeLine = useCallback((id: string) => setLineItems((items) => items.filter((i) => i.id !== id)), [])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!vendorId) { setError('Vendor is required'); return false }
    if (!subject.trim()) { setError('Subject is required'); return false }
    if (!lineItems.length) { setError('Add at least one line item'); return false }
    if (lineItems.some((l) => !l.description.trim())) { setError('Each line needs a description'); return false }
    setError(''); return true
  }

  const handleSave = async (action: 'draft' | 'submit') => {
    if (!companyId || !validate()) return
    setSubmitting(true)
    try {
      const payload = {
        vendorId, subject, description, issueDate,
        responseDeadline: responseDeadline || null, shippingTerms,
        status: action === 'submit' ? 'SENT' : status, internalNotes,
        lines: lineItems.map((l) => ({ description: l.description, accountId: l.accountId || null, quantity: l.quantity, unitPrice: l.unitPrice, taxRate: l.taxRate, amount: l.amount })),
      }
      if (mode === 'new') {
        await expensesService.createRfq(companyId, payload)
        toast.success(action === 'submit' ? 'RFQ sent to vendor' : 'RFQ draft saved')
      } else if (rfqId) {
        await expensesService.updateRfq(companyId, rfqId, payload)
        toast.success('RFQ updated')
      }
      router.push('/expenses/procurement/rfq')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to save RFQ'
      setError(msg); toast.error(msg)
    } finally { setSubmitting(false) }
  }

  const selectedVendorName = vendors.find((v) => v.id === vendorId)?.displayName ?? ''

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <button type="button" onClick={() => router.push('/expenses/procurement/rfq')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
                <ArrowLeft size={16} /> Back to RFQs
              </button>
              <div className="mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New RFQ' : 'Edit RFQ'}</h1>
                <p className="mt-1 text-sm text-slate-500">Request for Quotation — specify items and send to vendors for pricing.</p>
              </div>
            </div>
            {rfqNumber && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div className="font-semibold">RFQ #</div><div>{rfqNumber}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="inline-flex rounded-xl bg-white/50 p-1 border border-slate-100">
            <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>
            <button type="button" onClick={() => setActiveTab('activity')} disabled={mode === 'new' || !rfqId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>
          </div>
        </div>
        <div className={activeTab !== 'details' ? 'hidden' : ''}>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-44 space-y-6">
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-900">Vendor <span className="text-rose-500">*</span></label>
                <input value={vendorSearch || selectedVendorName} onChange={(e) => { setVendorSearch(e.target.value); setVendorId('') }} placeholder="Search vendor…" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                {vendorSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-md z-10">
                    {filteredVendors.slice(0, 8).map((v) => (
                      <button key={v.id} type="button" onClick={() => { setVendorId(v.id); setVendorSearch('') }} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50">{v.displayName}</button>
                    ))}
                    {filteredVendors.length === 0 && <p className="px-4 py-2 text-xs text-slate-400">No vendors found</p>}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Subject <span className="text-rose-500">*</span></label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="RFQ subject" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Issue Date</label>
                <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Response Deadline</label>
                <input type="date" value={responseDeadline} onChange={(e) => setResponseDeadline(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Shipping Terms</label>
                <select value={shippingTerms} onChange={(e) => setShippingTerms(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  {SHIPPING_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 xl:col-span-3">
                <label className="block text-sm font-semibold text-slate-900">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Additional context for the vendor…" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Items Requested</h2>
                <p className="mt-1 text-sm text-slate-500">List each item you want the vendor to quote.</p>
              </div>
              <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                <Plus size={16} /> Add row
              </button>
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div ref={lineTableRef} className={`overflow-x-auto rounded-3xl border border-slate-200 ${lineOverflowing ? 'shadow-inner' : ''}`}>
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <colgroup>
                    <col width={colWidths.description} /><col width={colWidths.account} /><col width={colWidths.quantity} />
                    <col width={colWidths.unitPrice} /><col width={colWidths.taxRate} /><col width={colWidths.amount} /><col width={64} />
                  </colgroup>
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Description</th><th className="px-4 py-3">Account</th><th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Unit Price</th><th className="px-4 py-3">Tax %</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((line) => (
                      <tr key={line.id} className="border-t border-slate-200">
                        <td className="px-4 py-3 align-top"><input type="text" value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} aria-label="Item description" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none" /></td>
                        <td className="px-4 py-3 align-top"><select value={line.accountId} onChange={(e) => updateLine(line.id, 'accountId', e.target.value)} aria-label="Account" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"><option value="">Account</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.code ? `${a.code} — ${a.name}` : a.name}</option>)}</select></td>
                        <td className="px-4 py-3 align-top"><input type="number" value={line.quantity} min={1} onChange={(e) => updateLine(line.id, 'quantity', Number(e.target.value))} aria-label="Qty" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none" /></td>
                        <td className="px-4 py-3 align-top"><input type="number" value={line.unitPrice} min={0} step="0.01" onChange={(e) => updateLine(line.id, 'unitPrice', Number(e.target.value))} aria-label="Unit price" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none" /></td>
                        <td className="px-4 py-3 align-top"><input type="number" value={line.taxRate} min={0} max={100} step="0.1" onChange={(e) => updateLine(line.id, 'taxRate', Number(e.target.value))} aria-label="Tax %" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none" /></td>
                        <td className="px-4 py-3 align-top"><div className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm tabular-nums">{formatCurrency(line.amount, currency)}</div></td>
                        <td className="px-4 py-3 align-top text-right"><button type="button" aria-label="Remove line" onClick={() => removeLine(line.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200"><Trash2 size={16} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-3">
                <div className="text-sm font-semibold text-slate-900">Estimated totals</div>
                <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
                <div className="flex justify-between text-sm text-slate-600"><span>Tax</span><span>{formatCurrency(taxTotal, currency)}</span></div>
                <div className="border-t border-slate-200 pt-4 flex justify-between font-semibold text-slate-900"><span>Total (est.)</span><span>{formatCurrency(total, currency)}</span></div>
                <p className="text-xs text-slate-400 pt-2">Final pricing confirmed by vendor response.</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="block text-sm font-semibold text-slate-900">Internal Notes</label>
            <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={4} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none" placeholder="Internal notes (not sent to vendor)" />
          </section>
        </div>
      </div>
      <div className={activeTab !== 'activity' ? 'hidden' : ''}>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
                <div className="mt-4">
                  <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this RFQ yet." />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>{error ? <p className="text-sm font-medium text-rose-600">{error}</p> : <p className="text-sm text-slate-500">Save as draft or send to vendor when ready.</p>}</div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push('/expenses/procurement/rfq')} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><X size={16} className="inline mr-1" />Cancel</button>
            <button type="button" onClick={() => handleSave('draft')} disabled={submitting} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">{submitting ? <Loader2 size={16} className="inline animate-spin mr-1" /> : <Save size={16} className="inline mr-1" />}Save Draft</button>
            <button type="button" onClick={() => handleSave('submit')} disabled={submitting} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}Send to Vendor</button>
          </div>
        </div>
      </div>
    </div>
  )
}
