'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Send, Trash2, Loader2 } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import { formatCurrency } from '@/lib/format'
import AccountSplitModal, { AccountSplitRow } from '@/components/shared/AccountSplitModal'
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
  splits?: AccountSplitRow[]
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
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [splitRowId, setSplitRowId] = useState<string | null>(null)
  const [splitDraft, setSplitDraft] = useState<AccountSplitRow[]>([])

  const [activeTab, setActiveTab] = useState<'details' | 'memo' | 'attachments' | 'activity'>('details')
  const selectedSplitLine = useMemo(() => lineItems.find((line) => line.id === splitRowId) ?? null, [lineItems, splitRowId])
  const lineItemAccountOptions = useMemo(() => accounts.map((account) => ({ id: account.id, label: account.code ? `${account.code} ${account.name}` : account.name ?? account.id })), [accounts])

  const openSplitModal = useCallback((rowId: string) => {
    const line = lineItems.find((item) => item.id === rowId)
    setSplitRowId(rowId)
    setSplitDraft(line?.splits?.length ? [...line.splits] : [{ id: genId(), accountId: '', amount: Number(line?.amount ?? 0) }])
    setSplitModalOpen(true)
  }, [lineItems])

  const closeSplitModal = useCallback(() => {
    setSplitModalOpen(false)
    setSplitRowId(null)
    setSplitDraft([])
  }, [])

  const handleSplitSave = useCallback(() => {
    if (!splitRowId) {
      closeSplitModal()
      return
    }
    setLineItems((items) => items.map((item) => item.id === splitRowId ? { ...item, splits: splitDraft } : item))
    closeSplitModal()
  }, [closeSplitModal, splitDraft, splitRowId])

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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Vendor Credit' : 'Edit Vendor Credit'}</h1>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-sm text-slate-700">
              <div className="font-semibold">Credit #</div>
              <div>{creditNumber || 'Auto-generated'}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
            {mode !== 'new' ? (
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-100">
              <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>
              <button type="button" onClick={() => setActiveTab('memo')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'memo' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Memo</button>
              <button type="button" onClick={() => setActiveTab('attachments')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'attachments' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Attachments</button>
              <button type="button" onClick={() => setActiveTab('activity')} disabled={!creditId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>
            </div>
          ) : null}
        </div>
        <div className={mode === 'new' || activeTab === 'details' ? '' : 'hidden'}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 pb-44">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <div>
                <label htmlFor="creditDate" className="block text-sm font-semibold text-slate-900">Credit Date</label>
                <input id="creditDate" type="date" value={creditDate} onChange={(e) => setCreditDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="creditNumber" className="block text-sm font-semibold text-slate-900">Credit Number</label>
                <input id="creditNumber" value={creditNumber ? creditNumber : 'Auto-generated'} readOnly className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" />

                          <div>
                    <label htmlFor="referenceBill" className="block text-sm font-semibold text-slate-900">Reference Bill</label>
                    <HaypSelect id="referenceBill" value={referenceBillId} onChange={setReferenceBillId} options={[{ value: '', label: 'Standalone credit' }, ...billOptions.map((b) => ({ value: b.id, label: b.label }))]} />
                  </div>
                  <div>
                    <label htmlFor="creditType" className="block text-sm font-semibold text-slate-900">Credit Type</label>
                    <HaypSelect id="creditType" value={creditType} onChange={setCreditType} options={CREDIT_TYPES.map((o) => ({ value: o, label: o }))} />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-semibold text-slate-900">Status</label>
                    <HaypSelect id="status" value={status} onChange={setStatus} options={STATUS_OPTIONS.map((o) => ({ value: o, label: o.replace(/_/g, ' ') }))} />
                  </div>
                  <div>
                    <label htmlFor="vendorId" className="block text-sm font-semibold text-slate-900">Vendor</label>
                    <HaypSelect id="vendorId" value={vendorId} onChange={setVendorId} options={vendors.map((v) => ({ value: v.id, label: v.displayName }))} placeholder="Select vendor" />
                  </div>
                </div>
              </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Credit Line Items</h2>
                      </div>
                      <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                        <Plus size={16} /> Add row
                      </button>
                    </div>

                    <div className="mt-6">
                      <LineItemTable
                        columns={lineItemColumns.map((column) => column.key === 'accountId'
                          ? { ...column, options: accounts.map((account) => ({ value: account.id, label: account.code ? `${account.code} — ${account.name}` : account.name ?? '' })) }
                          : column
                        )}
                        rows={lineItems}
                        onChange={setLineItems}
                        currency={currency ?? 'USD'}
                        calculatedColumns={{ amount: (row) => Number(row.quantity || 0) * Number(row.unitPrice || 0) }}
                        showSplitButton
                        onSplit={openSplitModal}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-slate-900">Credit summary</div>
                      <div className="flex items-center justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
                      <div className="flex items-center justify-between text-sm text-slate-600"><span>Tax</span><span>{formatCurrency(taxTotal, currency)}</span></div>
                      <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-base font-semibold text-slate-900"><span>Total Credit</span><span>{formatCurrency(total, currency)}</span></div>
                    </div>
                  </div>
                </div>
              </section>

              <AccountSplitModal
                open={splitModalOpen}
                onClose={closeSplitModal}
                title={selectedSplitLine?.description ? `Split: ${selectedSplitLine.description}` : 'Split credit line'}
                totalAmount={Number(selectedSplitLine?.amount ?? 0)}
                splits={splitDraft}
                accounts={lineItemAccountOptions}
                onChange={setSplitDraft}
                onSave={handleSplitSave}
              />

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="creditReason" className="block text-sm font-semibold text-slate-900">Reason</label>
                    <textarea id="creditReason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="creditNotes" className="block text-sm font-semibold text-slate-900">Notes</label>
                    <textarea id="creditNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className={mode === 'new' || activeTab === 'memo' ? '' : 'hidden'}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 pb-44">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <label htmlFor="creditReason" className="block text-sm font-semibold text-slate-900">Reason</label>
                  <textarea id="creditReason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="creditNotes" className="block text-sm font-semibold text-slate-900">Notes</label>
                  <textarea id="creditNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className={mode === 'new' || activeTab === 'attachments' ? '' : 'hidden'}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 pb-44">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Attachments</h2>
              <div className="mt-4">
                <HaypFileUpload attachments={attachments} onChange={setAttachments} />
              </div>
            </section>
          </div>
        </div>

        <div className={mode === 'new' || activeTab !== 'activity' ? 'hidden' : ''}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
                <div className="mt-4">
                  <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this vendor credit yet." />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
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
