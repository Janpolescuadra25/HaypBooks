'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState, useCallback } from 'react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import HaypFileUpload, { AttachmentMeta } from '@/components/shared/HaypFileUpload'
import AccountSplitModal, { AccountSplitRow } from '@/components/shared/AccountSplitModal'
import LineItemTable from './LineItemTable'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import HaypSelect from '@/components/shared/HaypSelect'
import { NewVendorModal } from '@/components/shared/NewVendorModal'

const today = new Date().toISOString().slice(0, 10)
const FREQUENCIES = ['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']
const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt']
const STATUS_OPTIONS = ['ACTIVE', 'PAUSED', 'CANCELLED']

interface Vendor { id: string; displayName: string }
interface Account { id: string; code?: string; name?: string }
interface LineItem { id: string; description: string; account: string; quantity: number; unitPrice: number; taxRate: number; amount: number; splits?: AccountSplitRow[] }

const defaultLineItem = (): LineItem => ({
  id: Math.random().toString(36).slice(2, 9),
  description: '',
  account: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  amount: 0,
})

export interface RecurringBillFormHandle {
  save: () => Promise<void>
}

interface RecurringBillFormProps {
  mode: 'new' | 'edit'
  billId?: string
  onClose?: () => void
  onSaved?: () => void
}

const RecurringBillForm = forwardRef<RecurringBillFormHandle, RecurringBillFormProps>(
  function RecurringBillForm({ mode, billId, onClose, onSaved }, ref) {
    const toast = useToast()
    const { companyId } = useCompanyId()
    const { currency } = useCompanyCurrency()

    const [vendors, setVendors] = useState<Vendor[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [vendorId, setVendorId] = useState('')
    const [description, setDescription] = useState('')
    const [frequency, setFrequency] = useState('MONTHLY')
    const [startDate, setStartDate] = useState(today)
    const [endDate, setEndDate] = useState('')
    const [amount, setAmount] = useState(0)
    const [accountId, setAccountId] = useState('')
    const [paymentTerms, setPaymentTerms] = useState('Net 30')
    const [billType, setBillType] = useState('Regular')
    const [templateName, setTemplateName] = useState('')
    const [status, setStatus] = useState('ACTIVE')
    const [internalNotes, setInternalNotes] = useState('')
    const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()])
    const [attachments, setAttachments] = useState<AttachmentMeta[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [splitModalOpen, setSplitModalOpen] = useState(false)
    const [splitRowId, setSplitRowId] = useState<string | null>(null)
    const [splitDraft, setSplitDraft] = useState<AccountSplitRow[]>([])
    const [showVendorModal, setShowVendorModal] = useState(false)

    const lineItemsTotal = useMemo(() => lineItems.reduce((sum, item) => sum + Number(item.amount || item.quantity * item.unitPrice), 0), [lineItems])
    const vendorOptions = useMemo(() => vendors.map((v) => ({ id: v.id, name: v.displayName })), [vendors])

    const handleLineItemsChange = useCallback((nextLineItems: LineItem[]) => {
      setLineItems(nextLineItems.map((item) => ({
        ...item,
        amount: Number(item.quantity || 0) * Number(item.unitPrice || 0),
      })))
    }, [])

    const [activeTab, setActiveTab] = useState<'schedule' | 'details' | 'attachments' | 'notes' | 'activity'>('schedule')
    const selectedSplitLine = useMemo(() => lineItems.find((line) => line.id === splitRowId) ?? null, [lineItems, splitRowId])
    const lineItemAccountOptions = useMemo(() => accounts.map((account) => ({ id: account.id, label: account.code ? `${account.code} ${account.name}` : account.name ?? account.id })), [accounts])

    const openSplitModal = useCallback((rowId: string) => {
      const line = lineItems.find((item) => item.id === rowId)
      setSplitRowId(rowId)
      setSplitDraft(line?.splits?.length ? [...line.splits] : [{ id: Math.random().toString(36).slice(2, 9), accountId: '', amount: Number(line?.amount ?? 0) }])
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
      initialFilters: activeTab === 'activity' && billId ? { tableName: 'RecurringBill', recordId: billId } : undefined,
    })

    // Compute next due date from startDate + frequency (approximate display only)
    const nextDueDate = useMemo(() => {
      try {
        const d = new Date(startDate)
        if (isNaN(d.getTime())) return ''
        switch (frequency) {
          case 'WEEKLY':    d.setDate(d.getDate() + 7); break
          case 'BI_WEEKLY': d.setDate(d.getDate() + 14); break
          case 'MONTHLY':   d.setMonth(d.getMonth() + 1); break
          case 'QUARTERLY': d.setMonth(d.getMonth() + 3); break
          case 'YEARLY':    d.setFullYear(d.getFullYear() + 1); break
        }
        return d.toISOString().slice(0, 10)
      } catch { return '' }
    }, [startDate, frequency])

    useEffect(() => {
      if (!companyId) return
      let active = true
      expensesService.listVendors(companyId)
        .then((res) => {
          if (!active) return
          const data = res.data ?? res
          const list = Array.isArray(data) ? data : data.data ?? []
          setVendors(list.map((v: Record<string, unknown>) => ({ id: String(v.id), displayName: String(v.displayName ?? v.name ?? v.id) })))
        }).catch(() => {})
      accountingService.listAccounts(companyId, { includeInactive: false })
        .then((res) => {
          if (!active) return
          const data = res.data ?? res
          const list = Array.isArray(data) ? data : data.data ?? []
          setAccounts(list.map((a: Record<string, unknown>) => ({ id: String(a.id), code: a.code ? String(a.code) : undefined, name: a.name ? String(a.name) : undefined })))
        }).catch(() => {})
      return () => { active = false }
    }, [companyId])

    useEffect(() => {
      if (mode !== 'edit' || !billId || !companyId) return
      let active = true
      expensesService.getRecurringBill(companyId, billId)
        .then((res) => {
          if (!active) return
          const data = res.data ?? res
          setVendorId(data.vendorId ?? '')
          setTemplateName(data.templateName ?? data.description ?? '')
          setDescription(data.description ?? data.templateName ?? '')
          setBillType(data.billType ?? 'Regular')
          setFrequency(data.frequency ?? 'MONTHLY')
          setStartDate(data.startDate?.slice(0, 10) ?? today)
          setEndDate(data.endDate?.slice(0, 10) ?? '')
          setAmount(Number(data.amount ?? 0))
          setAccountId(data.accountId ?? '')
          setPaymentTerms(data.paymentTerms ?? 'Net 30')
          setStatus(data.status ?? 'ACTIVE')
          setInternalNotes(data.internalNotes ?? '')
          setAttachments(Array.isArray(data.attachments) ? data.attachments.map((attachment: any) => ({
            id: String(attachment.id ?? attachment.fileKey ?? Math.random().toString(36).slice(2, 9)),
            fileName: String(attachment.fileName ?? attachment.name ?? ''),
            url: String(attachment.url ?? attachment.fileUrl ?? ''),
          })) : [])
          setLineItems(Array.isArray(data.lineItems) && data.lineItems.length > 0
            ? data.lineItems.map((item: any) => ({
                id: String(item.id ?? Math.random().toString(36).slice(2, 9)),
                description: String(item.description ?? ''),
                account: String(item.accountId ?? item.account ?? ''),
                quantity: Number(item.quantity ?? 1),
                unitPrice: Number(item.unitPrice ?? item.amount ?? 0),
                taxRate: Number(item.taxRate ?? 0),
                amount: Number(item.amount ?? 0),
              }))
            : [defaultLineItem()])
        })
        .catch(() => toast.error('Failed to load recurring bill'))
      return () => { active = false }
    }, [companyId, billId, mode, toast])

    const validate = useCallback(() => {
      if (!companyId) { setError('Company not loaded'); return false }
      if (!vendorId) { setError('Vendor is required'); return false }
      if (!templateName.trim()) { setError('Template name is required'); return false }
      if (lineItemsTotal <= 0) { setError('Amount must be greater than zero'); return false }
      if (!startDate) { setError('Start date is required'); return false }
      setError('')
      return true
    }, [companyId, vendorId, templateName, amount, startDate])

    const handleSave = useCallback(async () => {
      if (!companyId) return
      if (!validate()) return
      setSubmitting(true)
      try {
        const payload = {
          vendorId,
          templateName: templateName.trim(),
          description: description.trim() || templateName.trim(),
          billType,
          frequency,
          startDate,
          endDate: endDate || null,
          nextDueDate,
          amount: lineItemsTotal,
          currency,
          accountId: accountId || null,
          paymentTerms,
          status,
          internalNotes,
          lineItems: lineItems.map((item) => ({
            description: item.description,
            accountId: item.account || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            amount: item.amount,
          })),
          attachments: attachments.map((attachment) => ({
            fileName: attachment.fileName,
            url: attachment.url,
          })),
        }
        if (mode === 'new') {
          await expensesService.createRecurringBill(companyId, payload)
          toast.success('Recurring bill template created')
        } else if (billId) {
          await expensesService.updateRecurringBill(companyId, billId, payload)
          toast.success('Recurring bill template updated')
        }
        if (onSaved) onSaved()
        else if (onClose) onClose()
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to save recurring bill'
        setError(msg)
        toast.error(msg)
      } finally {
        setSubmitting(false)
      }
    }, [companyId, validate, vendorId, description, frequency, startDate, endDate, nextDueDate, amount, currency, accountId, paymentTerms, status, internalNotes, mode, billId, onSaved, onClose, toast])

    useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

    return (
      <div className="space-y-6 text-slate-900">
        <div className="overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 py-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{mode === 'new' ? 'New Recurring Bill Template' : 'Edit Recurring Bill Template'}</h2>
                </div>
                {mode !== 'new' ? (
                  <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-white p-1">
                    {(['schedule', 'details', 'attachments', 'notes'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                      >
                        {tab === 'schedule' ? 'Schedule' : tab === 'details' ? 'Details' : tab === 'attachments' ? 'Attachments' : 'Notes'}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setActiveTab('activity')}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                    >
                      Activity
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="space-y-6">
                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
                )}

                {(mode === 'new' || activeTab === 'schedule') && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 mb-4">Schedule</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="recurringFrequency" className="text-[10px] font-bold uppercase text-slate-400">Frequency</label>
                          <HaypSelect
                            id="recurringFrequency"
                            value={frequency}
                            onChange={setFrequency}
                            options={FREQUENCIES.map((f) => ({ value: f, label: f.replace('_', '-') }))}
                          />
                        </div>
                        <div>
                          <label htmlFor="recurringStartDate" className="text-[10px] font-bold uppercase text-slate-400">Start Date</label>
                          <input
                            id="recurringStartDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            aria-label="Start Date"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="recurringEndDate" className="text-[10px] font-bold uppercase text-slate-400">End Date</label>
                          <input
                            id="recurringEndDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            aria-label="End Date"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                          />
                        </div>
                        {nextDueDate && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-slate-500">Next bill will be generated on <strong className="text-slate-700">{nextDueDate}</strong></p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(mode === 'new' || activeTab === 'details') && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 mb-4">Vendor & Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <CustomerPickerField
                            label="Vendor"
                            value={vendorId}
                            customers={vendorOptions}
                            placeholder="Search vendors…"
                            createLabel="+ New Vendor"
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
                        <div>
                          <label htmlFor="recurringStatus" className="text-[10px] font-bold uppercase text-slate-400">Status</label>
                          <HaypSelect
                            id="recurringStatus"
                            value={status}
                            onChange={setStatus}
                            options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
                          />
                        </div>
                        <div>
                          <label htmlFor="recurringTemplateName" className="text-[10px] font-bold uppercase text-slate-400">Template Name</label>
                          <input
                            id="recurringTemplateName"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="e.g. Monthly SaaS subscription"
                            aria-label="Template Name"
                            className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="recurringBillType" className="text-[10px] font-bold uppercase text-slate-400">Bill Type</label>
                          <HaypSelect
                            id="recurringBillType"
                            value={billType}
                            onChange={setBillType}
                            options={['Regular', 'Service', 'Subscription', 'Project'].map((t) => ({ value: t, label: t }))}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="recurringDescription" className="text-[10px] font-bold uppercase text-slate-400">Optional Description</label>
                          <textarea
                            id="recurringDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional detail to include with generated bills"
                            rows={3}
                            aria-label="Description"
                            className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all resize-y"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    <div>
                      <h3 className="text-xs font-bold text-slate-900 mb-4">Line Items</h3>
                      <LineItemTable
                        columns={[
                          { key: 'description', label: 'Description', type: 'text', width: 320, minWidth: 220, placeholder: 'Line item description', required: true },
                          { key: 'account', label: 'Account', type: 'select', width: 200, minWidth: 150, required: true, options: accounts.map((a) => ({ value: a.id, label: a.code ? `${a.code} — ${a.name}` : a.name ?? '' })) },
                          { key: 'quantity', label: 'Qty', type: 'number', width: 96, minWidth: 70, required: true },
                          { key: 'unitPrice', label: 'Rate', type: 'number', width: 120, minWidth: 90, required: true },
                          { key: 'taxRate', label: 'Tax %', type: 'number', width: 110, minWidth: 90 },
                          { key: 'amount', label: 'Amount', type: 'calculated', width: 120, minWidth: 110 },
                        ]}
                        rows={lineItems}
                        onChange={handleLineItemsChange}
                        currency={currency ?? 'USD'}
                        calculatedColumns={{ amount: (row) => Number(row.quantity || 0) * Number(row.unitPrice || 0) }}
                        showSplitButton
                        onSplit={openSplitModal}
                      />
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-400">Total Amount</label>
                          <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                            <span>{currency}</span>
                            <strong className="text-slate-900">{lineItemsTotal.toFixed(2)}</strong>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="recurringPaymentTerms" className="text-[10px] font-bold uppercase text-slate-400">Payment Terms</label>
                          <HaypSelect
                            id="recurringPaymentTerms"
                            value={paymentTerms}
                            onChange={setPaymentTerms}
                            options={PAYMENT_TERMS.map((t) => ({ value: t, label: t }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <AccountSplitModal
                  open={splitModalOpen}
                  onClose={closeSplitModal}
                  title={selectedSplitLine?.description ? `Split: ${selectedSplitLine.description}` : 'Split recurring line item'}
                  totalAmount={Number(selectedSplitLine?.amount ?? 0)}
                  splits={splitDraft}
                  accounts={lineItemAccountOptions}
                  onChange={setSplitDraft}
                  onSave={handleSplitSave}
                />

                {(mode === 'new' || activeTab === 'attachments') && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-900 mb-4">Attachments</h3>
                    <HaypFileUpload
                      attachments={attachments}
                      onChange={setAttachments}
                      multiple={true}
                      description="Upload related receipts, invoices, or contract documents for this template."
                    />
                  </div>
                )}
                {(mode === 'new' || activeTab === 'notes') && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-900 mb-4">Notes</h3>
                    <textarea
                      id="recurringInternalNotes"
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      rows={4}
                      placeholder="Internal notes (not shown on bills)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all resize-y"
                    />
                  </div>
                )}

                {activeTab === 'activity' && mode !== 'new' && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-900 mb-4">Activity</h3>
                    <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this recurring bill yet." />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default RecurringBillForm
