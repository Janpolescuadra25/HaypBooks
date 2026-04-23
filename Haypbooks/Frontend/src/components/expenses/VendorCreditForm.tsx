'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Save, Send, Trash2, Loader2 } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'

const today = new Date().toISOString().slice(0, 10)
const CREDIT_TYPES = ['Return', 'Discount', 'Allowance', 'Other']
const STATUS_OPTIONS = ['DRAFT', 'SUBMITTED', 'APPLIED', 'VOID']

const genId = () => Math.random().toString(36).slice(2, 9)

interface Vendor {
  id: string
  displayName: string
}

interface Account {
  id: string
  code?: string
  name?: string
}

interface LineItem {
  id: string
  description: string
  accountId: string
  quantity: number
  unitPrice: number
  taxRate: number
  amount: number
}

interface VendorCreditFormProps {
  mode: 'new' | 'edit'
  creditId?: string
}

const defaultLineItem = (): LineItem => ({
  id: genId(),
  description: '',
  accountId: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  amount: 0,
})

const defaultWidths = {
  description: 320,
  account: 180,
  quantity: 96,
  unitPrice: 120,
  taxRate: 110,
  amount: 120,
}

export default function VendorCreditForm({ mode, creditId }: VendorCreditFormProps) {
  const router = useRouter()
  const toast = useToast()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [creditNumber, setCreditNumber] = useState('')
  const [creditDate, setCreditDate] = useState(today)
  const [referenceBill, setReferenceBill] = useState('')
  const [creditType, setCreditType] = useState('Return')
  const [vendorId, setVendorId] = useState('')
  const [status, setStatus] = useState('DRAFT')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!companyId) return
    let active = true
    expensesService.listVendors(companyId)
      .then((res) => {
        if (!active) return
        const payload = res.data ?? res
        const list = Array.isArray(payload) ? payload : payload.data ?? []
        setVendors(list.map((vendor: any) => ({ id: vendor.id, displayName: vendor.displayName ?? vendor.name ?? vendor.id })))
        if (!vendorId && list.length > 0) setVendorId(list[0].id)
      })
      .catch(() => toast.error('Failed to load vendors'))
    accountingService.listAccounts(companyId, { includeInactive: false })
      .then((res) => {
        if (!active) return
        const payload = res.data ?? res
        const list = Array.isArray(payload) ? payload : payload.data ?? []
        setAccounts(list.map((account: any) => ({ id: account.id, code: account.code, name: account.name })))
      })
      .catch(() => {})
    return () => { active = false }
  }, [companyId, toast, vendorId])

  useEffect(() => {
    if (mode !== 'edit' || !creditId || !companyId) return
    let active = true
    expensesService.getVendorCredit(companyId, creditId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setCreditNumber(data.creditNumber ?? data.number ?? '')
        setCreditDate(data.creditDate?.slice(0, 10) ?? today)
        setReferenceBill(data.referenceBillNumber ?? '')
        setCreditType(data.creditType ?? 'Return')
        setVendorId(data.vendorId ?? '')
        setStatus(data.status ?? 'DRAFT')
        setReason(data.reason ?? '')
        setNotes(data.notes ?? '')
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          setLineItems(data.lines.map((line: any) => ({
            id: genId(),
            description: line.description ?? '',
            accountId: line.accountId ?? '',
            quantity: Number(line.quantity ?? 1),
            unitPrice: Number(line.unitPrice ?? 0),
            taxRate: Number(line.taxRate ?? 0),
            amount: Number(line.amount ?? (Number(line.quantity ?? 1) * Number(line.unitPrice ?? 0))),
          })))
        }
      })
      .catch(() => toast.error('Failed to load vendor credit'))
    return () => { active = false }
  }, [companyId, creditId, mode, toast])

  const [colWidths, setColWidths] = useState(defaultWidths)
  const colWidthsRef = useRef(colWidths)
  useEffect(() => { colWidthsRef.current = colWidths }, [colWidths])
  const saveColWidths = useCallback((next: typeof defaultWidths) => {
    setColWidths(next)
    try { localStorage.setItem('vendor-credit-line-cols-v1', JSON.stringify(next)) } catch {}
  }, [])

  const { containerRef: lineItemsTableRef, startResize: startLineResize, isOverflowing: lineItemsOverflowing } = useFixedWidthResizableMap({
    widths: colWidths,
    widthsRef: colWidthsRef,
    order: ['description', 'account', 'quantity', 'unitPrice', 'taxRate', 'amount'],
    saveWidths: saveColWidths,
    fixedWidth: 64,
    minWidth: { description: 220, account: 140, quantity: 70, unitPrice: 90, taxRate: 90, amount: 110 },
  })

  const subtotal = useMemo(() => lineItems.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0), [lineItems])
  const taxTotal = useMemo(() => lineItems.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0) * (Number(line.taxRate || 0) / 100), 0), [lineItems])
  const total = useMemo(() => Math.max(0, subtotal + taxTotal), [subtotal, taxTotal])

  const updateLine = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((items) => items.map((item) => {
      if (item.id !== id) return item
      const next = { ...item, [field]: field === 'description' || field === 'accountId' ? String(value) : Number(value) }
      if (field === 'quantity') next.amount = Number(value) * next.unitPrice
      if (field === 'unitPrice') next.amount = next.quantity * Number(value)
      return next
    }))
  }, [])

  const addLine = useCallback(() => setLineItems((items) => [...items, defaultLineItem()]), [])
  const removeLine = useCallback((id: string) => setLineItems((items) => items.filter((item) => item.id !== id)), [])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!vendorId) { setError('Vendor is required'); return false }
    if (!lineItems.length) { setError('At least one credit line is required'); return false }
    if (lineItems.some((line) => !line.description.trim())) { setError('Each credit line requires a description'); return false }
    if (lineItems.some((line) => line.quantity <= 0)) { setError('Quantity must be at least 1'); return false }
    if (lineItems.some((line) => line.unitPrice < 0)) { setError('Unit price cannot be negative'); return false }
    setError('')
    return true
  }

  const handleSave = async (action: 'draft' | 'submit') => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        creditDate,
        referenceBillNumber: referenceBill || null,
        creditType,
        vendorId,
        status: action === 'submit' ? 'SUBMITTED' : status,
        reason,
        notes,
        lines: lineItems.map((line) => ({
          description: line.description,
          accountId: line.accountId || null,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          amount: line.amount,
        })),
      }

      if (mode === 'new') {
        await expensesService.createVendorCredit(companyId, payload)
        toast.success(action === 'submit' ? 'Vendor credit submitted' : 'Vendor credit saved')
      } else if (creditId) {
        await expensesService.updateVendorCredit(companyId, creditId, payload)
        toast.success(action === 'submit' ? 'Vendor credit updated and submitted' : 'Vendor credit updated')
      }
      router.push('/expenses/bills-payments/vendor-credits')
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to save vendor credit')
      toast.error('Unable to save vendor credit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <button type="button" onClick={() => router.push('/expenses/bills-payments/vendor-credits')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
                <ArrowLeft size={16} /> Back to vendor credits
              </button>
              <div className="mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Vendor Credit' : 'Edit Vendor Credit'}</h1>
                <p className="mt-1 text-sm text-slate-500">Manage vendor credits and credit line details.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="font-semibold">Credit #</div>
              <div>{creditNumber || 'Auto-generated'}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-44">
          <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="creditDate" className="block text-sm font-semibold text-slate-900">Credit Date</label>
                  <input id="creditDate" type="date" value={creditDate} onChange={(e) => setCreditDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="referenceBill" className="block text-sm font-semibold text-slate-900">Reference Bill #</label>
                  <input id="referenceBill" value={referenceBill} onChange={(e) => setReferenceBill(e.target.value)} placeholder="Optional" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="creditType" className="block text-sm font-semibold text-slate-900">Credit Type</label>
                  <select id="creditType" value={creditType} onChange={(e) => setCreditType(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    {CREDIT_TYPES.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-slate-900">Status</label>
                  <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="vendorId" className="block text-sm font-semibold text-slate-900">Vendor</label>
                <select id="vendorId" value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  <option value="">Select vendor</option>
                  {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.displayName}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Credit Line Items</h2>
                    <p className="mt-1 text-sm text-slate-500">Add details for each credit line.</p>
                  </div>
                  <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                    <Plus size={16} /> Add row
                  </button>
                </div>

                <div ref={lineItemsTableRef} className={`mt-6 overflow-x-auto rounded-3xl border border-slate-200 ${lineItemsOverflowing ? 'shadow-inner' : ''}`}>
                  <table className="w-full min-w-[800px] border-collapse text-sm">
                    <colgroup>
                      <col width={colWidths.description} />
                      <col width={colWidths.account} />
                      <col width={colWidths.quantity} />
                      <col width={colWidths.unitPrice} />
                      <col width={colWidths.taxRate} />
                      <col width={colWidths.amount} />
                      <col width={64} />
                    </colgroup>
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Account</th>
                        <th className="px-4 py-3">Quantity</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3">Tax %</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((line) => (
                        <tr key={line.id} className="border-t border-slate-200">
                          <td className="px-4 py-3 align-top">
                            <input type="text" value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} placeholder="Description" aria-label="Credit line description" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                          </td>
                          <td className="px-4 py-3 align-top">
                            <select value={line.accountId} onChange={(e) => updateLine(line.id, 'accountId', e.target.value)} aria-label="Credit line account" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                              <option value="">Account</option>
                              {accounts.map((account) => (
                                <option key={account.id} value={account.id}>{account.code ? `${account.code} — ${account.name}` : account.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <input type="number" value={line.quantity} min={1} onChange={(e) => updateLine(line.id, 'quantity', Number(e.target.value))} aria-label="Credit line quantity" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                          </td>
                          <td className="px-4 py-3 align-top">
                            <input type="number" value={line.unitPrice} min={0} step="0.01" onChange={(e) => updateLine(line.id, 'unitPrice', Number(e.target.value))} aria-label="Credit line unit price" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                          </td>
                          <td className="px-4 py-3 align-top">
                            <input type="number" value={line.taxRate} min={0} max={100} step="0.1" onChange={(e) => updateLine(line.id, 'taxRate', Number(e.target.value))} aria-label="Credit line tax rate" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">{formatCurrency(line.amount, currency)}</div>
                          </td>
                          <td className="px-4 py-3 align-top text-right">
                            <button type="button" title="Remove credit line" aria-label="Remove credit line" onClick={() => removeLine(line.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-900">Credit summary</div>
                  <div className="flex items-center justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
                  <div className="flex items-center justify-between text-sm text-slate-600"><span>Tax</span><span>{formatCurrency(taxTotal, currency)}</span></div>
                  <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-base font-semibold text-slate-900"><span>Total Credit</span><span>{formatCurrency(total, currency)}</span></div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-6">
              <div>
                <label htmlFor="creditReason" className="block text-sm font-semibold text-slate-900">Reason</label>
                <textarea id="creditReason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="creditNotes" className="block text-sm font-semibold text-slate-900">Notes</label>
                <textarea id="creditNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
            </div>
          </section>
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : <p className="text-sm text-slate-500">Review your credit before saving or submitting.</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push('/expenses/bills-payments/vendor-credits')} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={() => handleSave('draft')} disabled={submitting} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">Save</button>
            <button type="button" onClick={() => handleSave('submit')} disabled={submitting} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
