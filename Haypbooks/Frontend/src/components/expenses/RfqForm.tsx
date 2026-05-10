'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Save, FileText, History } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import { formatCurrency } from '@/lib/format'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import { NewVendorModal } from '@/components/shared/NewVendorModal'
import HaypSelect from '@/components/shared/HaypSelect'
import LineItemTable from './LineItemTable'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'

const RFQ_STATUSES = ['DRAFT', 'SENT', 'AWARDED', 'CLOSED'] as const
const today = new Date().toISOString().slice(0, 10)

const defaultLine = () => ({
  id: Math.random().toString(36).slice(2, 9),
  description: '',
  accountId: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  amount: 0,
})

interface Vendor { id: string; displayName: string }
interface Account { id: string; code?: string; name?: string }
interface RfqLine { id: string; description: string; accountId: string; quantity: number; unitPrice: number; taxRate: number; amount: number }

interface RfqFormProps {
  mode: 'new' | 'edit'
  rfqId?: string
}

export default function RfqForm({ mode, rfqId }: RfqFormProps) {
  const router = useRouter()
  const toast = useToast()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [status, setStatus] = useState<typeof RFQ_STATUSES[number]>('DRAFT')
  const [closingDate, setClosingDate] = useState(today)
  const [lineItems, setLineItems] = useState<RfqLine[]>([defaultLine()])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')
  const [showVendorModal, setShowVendorModal] = useState(false)

  const { entries: activityEntries, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: activeTab === 'activity' && rfqId ? { tableName: 'Rfq', recordId: rfqId } : undefined,
  })

  useEffect(() => {
    if (!companyId) return
    let active = true

    expensesService.listVendors(companyId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        const list = Array.isArray(data) ? data : data.data ?? []
        setVendors(list.map((vendor: any) => ({ id: vendor.id, displayName: vendor.displayName ?? vendor.name ?? String(vendor.id) })))
        if (!vendorId && Array.isArray(list) && list.length > 0) {
          setVendorId(list[0].id)
        }
      })
      .catch(() => toast.error('Failed to load vendors'))

    accountingService.listAccounts(companyId, { includeInactive: false })
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        const list = Array.isArray(data) ? data : data.data ?? []
        setAccounts(list.map((account: any) => ({ id: account.id, code: account.code, name: account.name })))
      })
      .catch(() => {})

    return () => { active = false }
  }, [companyId, toast, vendorId])

  useEffect(() => {
    if (mode !== 'edit' || !companyId || !rfqId) return
    let active = true

    expensesService.getRfq(companyId, rfqId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setSubject(data.subject ?? data.title ?? '')
        setDescription(data.description ?? '')
        setVendorId(data.vendorId ?? '')
        setStatus((data.status as typeof RFQ_STATUSES[number]) ?? 'DRAFT')
        setClosingDate(data.closingDate?.slice(0, 10) ?? today)
        setNotes(data.notes ?? '')
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          setLineItems(data.lines.map((line: any) => ({
            id: Math.random().toString(36).slice(2, 9),
            description: line.description ?? '',
            accountId: line.accountId ?? '',
            quantity: Number(line.quantity ?? 1),
            unitPrice: Number(line.unitPrice ?? 0),
            taxRate: Number(line.taxRate ?? 0),
            amount: Number(line.amount ?? (Number(line.quantity ?? 1) * Number(line.unitPrice ?? 0))),
          })))
        }
      })
      .catch(() => toast.error('Failed to load RFQ'))

    return () => { active = false }
  }, [companyId, mode, rfqId, toast])

  const subtotal = useMemo(() => lineItems.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0), [lineItems])
  const taxTotal = useMemo(() => lineItems.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0) * (Number(line.taxRate || 0) / 100), 0), [lineItems])
  const total = useMemo(() => Math.max(0, subtotal + taxTotal), [subtotal, taxTotal])

  const updateLine = useCallback((id: string, field: keyof RfqLine, value: string | number) => {
    setLineItems((items) => items.map((item) => {
      if (item.id !== id) return item
      const next: RfqLine = {
        ...item,
        [field]: field === 'description' || field === 'accountId' ? String(value) : Number(value),
      }
      if (field === 'quantity') next.amount = Number(value) * next.unitPrice
      if (field === 'unitPrice') next.amount = next.quantity * Number(value)
      return next
    }))
  }, [])

  const addLine = useCallback(() => setLineItems((items) => [...items, defaultLine()]), [])
  const removeLine = useCallback((id: string) => setLineItems((items) => items.filter((item) => item.id !== id)), [])

  const validate = useCallback(() => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!subject.trim()) { setError('Subject is required'); return false }
    if (!vendorId) { setError('Vendor is required'); return false }
    if (!lineItems.length) { setError('Add at least one RFQ line'); return false }
    if (lineItems.some((line) => !line.description.trim())) { setError('Each line item needs a description'); return false }
    if (lineItems.some((line) => line.quantity <= 0)) { setError('Quantity must be at least 1'); return false }
    if (lineItems.some((line) => line.unitPrice < 0)) { setError('Unit price cannot be negative'); return false }
    setError('')
    return true
  }, [companyId, subject, vendorId, lineItems])

  const handleSave = useCallback(async () => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        subject,
        description,
        vendorId,
        status,
        closingDate,
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
        await expensesService.createRfq(companyId, payload)
        toast.success('RFQ created')
      } else if (rfqId) {
        await expensesService.updateRfq(companyId, rfqId, payload)
        toast.success('RFQ updated')
      }

      router.push('/expenses/procurement/rfq')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to save RFQ')
      toast.error('Unable to save RFQ')
    } finally {
      setSubmitting(false)
    }
  }, [companyId, validate, subject, description, vendorId, status, closingDate, notes, lineItems, mode, rfqId, toast, router])

  const vendorOptions = useMemo(() => vendors.map((v) => ({ id: v.id, name: v.displayName })), [vendors])

  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl z-30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                {mode === 'new' ? 'New Request for Quotation' : 'Edit RFQ'}
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
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          {mode !== 'new' && (
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-100 mb-4">
              <button 
                type="button" 
                onClick={() => setActiveTab('details')} 
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'details' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <FileText className="w-4 h-4" /> Details
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('activity')} 
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'activity' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <History className="w-4 h-4" /> Activity
              </button>
            </div>
          )}

          <div className={activeTab === 'details' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Request Information</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <div className="mb-4 space-y-1.5">
                    <label htmlFor="rfqSubject" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</label>
                    <input
                      id="rfqSubject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      placeholder="RFQ subject line"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <CustomerPickerField
                        label="Vendor"
                        value={vendorId}
                        customers={vendorOptions}
                        placeholder="Search vendors…"
                        createLabel="New Vendor"
                        onChange={setVendorId}
                        onCreateNew={() => setShowVendorModal(true)}
                      />
                      {companyId && (
                        <NewVendorModal
                          open={showVendorModal}
                          companyId={companyId}
                          onClose={() => setShowVendorModal(false)}
                          onCreated={(v) => {
                            setVendors((prev) => [{ id: v.id, displayName: v.displayName }, ...prev])
                            setVendorId(v.id)
                          }}
                        />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="rfqClosingDate" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Closing Date</label>
                      <input
                        id="rfqClosingDate"
                        type="date"
                        value={closingDate}
                        onChange={(e) => setClosingDate(e.target.value)}
                        className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="rfqStatus" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                      <HaypSelect
                        id="rfqStatus"
                        value={status}
                        onChange={(v) => setStatus(v as typeof RFQ_STATUSES[number])}
                        options={RFQ_STATUSES.map((s) => ({ value: s, label: s }))}
                        className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <label htmlFor="rfqDescription" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requirements Description</label>
                    <textarea
                      id="rfqDescription"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      placeholder="Describe your requirements and expectations in detail..."
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Required Items</h2>
                  </div>
                  <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
                    <Plus size={16} /> Add Item
                  </button>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <LineItemTable
                    columns={[
                      { key: 'description', label: 'Description', type: 'text', width: 320, minWidth: 220, placeholder: 'Description', required: true },
                      { key: 'accountId', label: 'Account', type: 'select', width: 180, minWidth: 140, required: true, options: accounts.map((account) => ({ value: account.id, label: account.code ? `${account.code} — ${account.name}` : account.name ?? '' })) },
                      { key: 'quantity', label: 'Qty', type: 'number', width: 96, minWidth: 70, required: true },
                      { key: 'unitPrice', label: 'Unit Price', type: 'number', width: 120, minWidth: 90, required: true },
                      { key: 'taxRate', label: 'Tax %', type: 'number', width: 110, minWidth: 90 },
                      { key: 'amount', label: 'Amount', type: 'calculated', width: 120, minWidth: 110 },
                    ]}
                    rows={lineItems}
                    onChange={setLineItems}
                    currency={currency ?? 'USD'}
                    calculatedColumns={{ amount: (row) => Number(row.quantity || 0) * Number(row.unitPrice || 0) }}
                  />
                </div>
              </div>
            </section>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm h-full">
                  <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                    <div className="w-1 h-6 bg-slate-300 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Additional Notes</h2>
                  </div>
                  <div className="px-4 pb-4 sm:px-5 lg:px-6">
                    <textarea
                      id="rfqNotes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      placeholder="Internal notes or special instructions for the vendor..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm h-full">
                  <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Estimated Total</h2>
                  </div>
                  <div className="px-4 pb-4 sm:px-5 lg:px-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tax</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(taxTotal, currency)}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-black text-emerald-600 tabular-nums">{formatCurrency(total, currency)}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className={activeTab === 'activity' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Activity Log</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity recorded for this RFQ." />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="z-40 shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.05)]">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <div className="flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={() => router.push('/expenses/procurement/rfq')} 
                disabled={submitting}
                className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSave} 
                disabled={submitting} 
                className="h-10 px-8 rounded-xl bg-emerald-600 text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {mode === 'new' ? 'Create RFQ' : 'Save RFQ'}
              </button>
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
