'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Send, Trash2, Loader2, ArrowLeft, X } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import { formatCurrency } from '@/lib/format'
import LineItemTable from './LineItemTable'
import ActivityLog from '@/components/ui/ActivityLog'
import HaypFileUpload, { AttachmentMeta } from '@/components/shared/HaypFileUpload'
import HaypSelect from '@/components/shared/HaypSelect'
import { useActivityLog } from '@/hooks/useActivityLog'

const today = new Date().toISOString().slice(0, 10)
const CREDIT_TYPES = ['Return', 'Discount', 'Allowance', 'Other']
const STATUS_OPTIONS = ['DRAFT', 'SUBMITTED', 'APPLIED', 'VOID']

const lineItemColumns = [
  { key: 'description', label: 'Description', type: 'text', width: 320, minWidth: 220, placeholder: 'Description', required: true },
  { key: 'accountId', label: 'Account', type: 'select', width: 180, minWidth: 140, required: true, options: [] },
  { key: 'quantity', label: 'Quantity', type: 'number', width: 96, minWidth: 70, required: true },
  { key: 'unitPrice', label: 'Unit Price', type: 'number', width: 120, minWidth: 90, required: true },
  { key: 'taxRate', label: 'Tax %', type: 'number', width: 110, minWidth: 90 },
  { key: 'amount', label: 'Amount', type: 'calculated', width: 120, minWidth: 110 },
]

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

// API shapes for responses
interface ApiVendor {
  id: string
  displayName?: string | null
  name?: string | null
}

interface ApiAccount {
  id: string
  code?: string | null
  name?: string | null
}

interface ApiLine {
  id?: string
  description?: string | null
  accountId?: string | null
  quantity?: number | null
  unitPrice?: number | null
  taxRate?: number | null
  amount?: number | null
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
  const [referenceBillId, setReferenceBillId] = useState('')
  const [creditType, setCreditType] = useState('Return')
  const [vendorId, setVendorId] = useState('')
  const [status, setStatus] = useState('DRAFT')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [billOptions, setBillOptions] = useState<Array<{ id: string; label: string }>>([])
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([])
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [activeTab, setActiveTab] = useState<'details' | 'memo' | 'attachments' | 'activity'>('details')
  const lineItemAccountOptions = useMemo(() => accounts.map((account) => ({ id: account.id, label: account.code ? `${account.code} ${account.name}` : account.name ?? account.id })), [accounts])


  const { entries: activityEntries, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: activeTab === 'activity' && creditId ? { tableName: 'VendorCredit', recordId: creditId } : undefined,
  })

  useEffect(() => {
    if (!companyId) return
    let active = true
    expensesService.listVendors(companyId)
      .then((res) => {
        if (!active) return
        const payload = res.data ?? res
        const list = Array.isArray(payload) ? payload : payload.data ?? []
        setVendors(list.map((vendor: ApiVendor) => ({ id: vendor.id, displayName: vendor.displayName ?? vendor.name ?? vendor.id })))
        if (!vendorId && list.length > 0) setVendorId(list[0].id)
      })
      .catch(() => toast.error('Failed to load vendors'))
    accountingService.listAccounts(companyId, { includeInactive: false })
      .then((res) => {
        if (!active) return
        const payload = res.data ?? res
        const list = Array.isArray(payload) ? payload : payload.data ?? []
        setAccounts(list.map((account: ApiAccount) => ({ id: account.id, code: account.code, name: account.name })))
      })
      .catch(() => {})
    return () => { active = false }
  }, [companyId, toast, vendorId])

  useEffect(() => {
    if (!companyId || !vendorId) {
      setBillOptions([])
      setReferenceBillId('')
      return
    }
    let active = true
    expensesService.listBills(companyId, { vendorId, limit: 100 })
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const bills = Array.isArray(data) ? data : data.data ?? []
        const options = bills
          .filter((bill: any) => bill.status !== 'PAID' && bill.status !== 'VOIDED')
          .map((bill: any) => ({ id: bill.id, label: `${bill.billNumber ?? 'Draft'} • ${bill.date ?? ''}` }))
        setBillOptions(options)
      })
      .catch(() => {})
    return () => { active = false }
  }, [companyId, vendorId])

  useEffect(() => {
    if (mode !== 'edit' || !creditId || !companyId) return
    let active = true
    expensesService.getVendorCredit(companyId, creditId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setCreditNumber(data.creditNumber ?? data.number ?? '')
        setCreditDate(data.creditDate?.slice(0, 10) ?? today)
        setReferenceBillId(data.referenceBillId ?? '')
        setCreditType(data.creditType ?? 'Return')
        setVendorId(data.vendorId ?? '')
        setStatus(data.status ?? 'DRAFT')
        setReason(data.reason ?? '')
        setNotes(data.notes ?? '')
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          setLineItems(data.lines.map((line: ApiLine) => ({
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
        referenceBillId: referenceBillId || null,
        creditType,
        vendorId,
        status: action === 'submit' ? 'SUBMITTED' : status,
        reason,
        notes,
        attachments: attachments.length ? attachments : undefined,
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
      setError(err?.response?.data?.message ?? 'Unable to save vendor credit')
      toast.error('Unable to save vendor credit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl z-30">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => router.back()} 
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="w-px h-6 bg-slate-200" />
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                {mode === 'new' ? 'New Vendor Credit' : 'Edit Vendor Credit'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100">
                {status}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          {mode !== 'new' && (
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-100 mb-4">
              <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>
              <button type="button" onClick={() => setActiveTab('memo')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'memo' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Memo</button>
              <button type="button" onClick={() => setActiveTab('attachments')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'attachments' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Attachments</button>
              <button type="button" onClick={() => setActiveTab('activity')} disabled={!creditId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>
            </div>
          )}

          <div className={activeTab === 'details' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Credit Information</h2>
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 pb-4 sm:px-5 lg:px-6">
                  <div className="space-y-1.5">
                    <label htmlFor="creditNumber" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credit #</label>
                    <input 
                      id="creditNumber" 
                      value={creditNumber || 'Auto-generated'} 
                      readOnly 
                      className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="creditDate" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credit Date</label>
                    <input 
                      id="creditDate" 
                      type="date" 
                      value={creditDate} 
                      onChange={e => setCreditDate(e.target.value)} 
                      className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="creditType" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credit Type</label>
                    <HaypSelect 
                      id="creditType" 
                      value={creditType} 
                      onChange={setCreditType} 
                      options={CREDIT_TYPES.map(o => ({ value: o, label: o }))} 
                      className="h-10 rounded-xl bg-slate-50 px-4 py-2 font-bold"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Vendor & Reference</h2>
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 pb-4 sm:px-5 lg:px-6">
                  <div className="space-y-1.5">
                    <label htmlFor="vendorId" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor</label>
                    <HaypSelect 
                      id="vendorId" 
                      value={vendorId} 
                      onChange={setVendorId} 
                      options={vendors.map(v => ({ value: v.id, label: v.displayName }))} 
                      placeholder="Select vendor" 
                      className="h-10 rounded-xl bg-slate-50 px-4 py-2 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="referenceBill" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference Bill</label>
                    <HaypSelect 
                      id="referenceBill" 
                      value={referenceBillId} 
                      onChange={setReferenceBillId} 
                      options={[{ value: '', label: 'Standalone credit' }, ...billOptions.map(b => ({ value: b.id, label: b.label }))]} 
                      className="h-10 rounded-xl bg-slate-50 px-4 py-2 font-bold"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Line Items</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <LineItemTable
                    columns={lineItemColumns.map((column) => column.key === 'accountId'
                      ? { ...column, options: accounts.map((account) => ({ value: account.id, label: account.code ? `${account.code} — ${account.name}` : account.name ?? '' })) }
                      : column
                    )}
                    rows={lineItems}
                    onChange={setLineItems}
                    currency={currency ?? 'USD'}
                    calculatedColumns={{ amount: (row) => Number(row.quantity || 0) * Number(row.unitPrice || 0) }}
                  />
                </div>
              </div>
            </section>

            <section className="p-4 sm:p-5 lg:p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end text-right">
                <div className="px-4 text-sm font-medium text-slate-500">Subtotal: <span className="ml-2 font-bold text-slate-900 tabular-nums">{formatCurrency(subtotal, currency)}</span></div>
                <div className="px-4 text-sm font-medium text-slate-500">Tax: <span className="ml-2 font-bold text-slate-900 tabular-nums">{formatCurrency(taxTotal, currency)}</span></div>
                <div className="px-4 text-sm font-medium text-slate-500">Total Credit: <span className="ml-2 text-xl font-black text-emerald-600 tabular-nums">{formatCurrency(total, currency)}</span></div>
              </div>
            </section>
          </div>

          <div className={activeTab === 'memo' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Reason & Notes</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6 space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="creditReason" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason</label>
                    <textarea 
                      id="creditReason" 
                      value={reason} 
                      onChange={(e) => setReason(e.target.value)} 
                      rows={4} 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="creditNotes" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
                    <textarea 
                      id="creditNotes" 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      rows={3} 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" 
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className={activeTab === 'attachments' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Attachments</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <HaypFileUpload attachments={attachments} onChange={setAttachments} />
                </div>
              </div>
            </section>
          </div>

          <div className={activeTab === 'activity' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Activity</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this vendor credit yet." />
                </div>
              </div>
            </section>
          </div>
        </div>

      </main>

      <div className="sticky bottom-0 z-40 shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.05)]">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <span>Total Credit:</span>
                <span className="text-lg font-bold text-slate-900">{formatCurrency(total, currency)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => router.push('/expenses/bills-payments/vendor-credits')} 
                className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => handleSave('draft')} 
                disabled={submitting} 
                className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin text-emerald-600" /> : <Save size={18} className="text-slate-400" />}
                Save Draft
              </button>
              <button 
                type="button" 
                onClick={() => handleSave('submit')} 
                disabled={submitting} 
                className="h-10 px-8 rounded-xl bg-emerald-600 text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-lg">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}
