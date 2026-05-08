'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Send, Trash2, Loader2 } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import LineItemTable from './LineItemTable'
import ActivityLog from '@/components/ui/ActivityLog'
import HaypFileUpload, { AttachmentMeta } from '@/components/shared/HaypFileUpload'
import { useActivityLog } from '@/hooks/useActivityLog'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import HaypSelect from '@/components/shared/HaypSelect'
import { NewVendorModal } from '@/components/shared/NewVendorModal'

const today = new Date().toISOString().slice(0, 10)
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']
const STATUS_OPTIONS = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CLOSED']

const genId = () => Math.random().toString(36).slice(2, 9)

interface Vendor {
  id: string
  displayName: string
}

interface Employee {
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

interface PurchaseRequestFormProps {
  mode: 'new' | 'edit'
  prId?: string
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

// API shapes for list responses
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

interface ApiEmployee {
  id: string
  displayName?: string | null
  name?: string | null
}

interface ApiPRLine {
  id?: string
  description?: string | null
  accountId?: string | null
  quantity?: number | null
  unitPrice?: number | null
  taxRate?: number | null
  amount?: number | null
}

const lineItemColumns = [
  { key: 'description', label: 'Description', type: 'text', width: 320, minWidth: 220, placeholder: 'Description', required: true },
  { key: 'accountId', label: 'Account', type: 'select', width: 180, minWidth: 140, required: true, options: [] },
  { key: 'quantity', label: 'Quantity', type: 'number', width: 96, minWidth: 70, required: true },
  { key: 'unitPrice', label: 'Rate', type: 'number', width: 120, minWidth: 90, required: true },
  { key: 'taxRate', label: 'Tax %', type: 'number', width: 110, minWidth: 90 },
  { key: 'amount', label: 'Amount', type: 'calculated', width: 120, minWidth: 110 },
]

export default function PurchaseRequestForm({ mode, prId }: PurchaseRequestFormProps) {
  const router = useRouter()
  const toast = useToast()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([])
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([])
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([])
  const [requestNumber, setRequestNumber] = useState('')
  const [requestDate, setRequestDate] = useState(today)
  const [requiredDate, setRequiredDate] = useState(today)
  const [priority, setPriority] = useState('Medium')
  const [status, setStatus] = useState('DRAFT')
  const [requesterId, setRequesterId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'attachments' | 'activity'>('details')
  const [showVendorModal, setShowVendorModal] = useState(false)

  const { entries: activityEntries, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: activeTab === 'activity' && prId ? { tableName: 'PurchaseRequest', recordId: prId } : undefined,
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
    expensesService.listEmployees(companyId, { limit: 100 })
      .then((res) => {
        if (!active) return
        const payload = res.data ?? res
        const list = Array.isArray(payload) ? payload : payload.data ?? []
        setEmployees(list.map((employee: ApiEmployee) => ({ id: employee.id, displayName: employee.displayName ?? employee.name ?? employee.id })))
        if (!requesterId && list.length > 0) setRequesterId(list[0].id)
      })
      .catch(() => {})

    apiClient.get(`/companies/${companyId}/organization/departments`)
      .then((res) => {
        if (!active) return
        const payload = res.data ?? res
        const list = Array.isArray(payload) ? payload : payload.data ?? []
        setDepartments(list.map((dept: any) => ({ id: dept.id, name: dept.name })))
        if (!departmentId && list.length > 0) setDepartmentId(list[0].id)
      })
      .catch(() => {})

    apiClient.get(`/companies/${companyId}/organization/locations`)
      .then((res) => {
        if (!active) return
        const payload = res.data ?? res
        const list = Array.isArray(payload) ? payload : payload.data ?? []
        setLocations(list.map((loc: any) => ({ id: loc.id, name: loc.name })))
        if (!locationId && list.length > 0) setLocationId(list[0].id)
      })
      .catch(() => {})

    return () => { active = false }
  }, [companyId, toast, vendorId, requesterId, departmentId, locationId])

  useEffect(() => {
    if (mode !== 'edit' || !prId || !companyId) return
    let active = true
    expensesService.getPurchaseRequest(companyId, prId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setRequestNumber(data.prNumber ?? data.requestNumber ?? '')
        setRequestDate(data.requestDate?.slice(0, 10) ?? today)
        setRequiredDate(data.requiredDate?.slice(0, 10) ?? today)
        setPriority(data.priority ?? 'Medium')
        setStatus(data.status ?? 'DRAFT')
        setRequesterId(data.requesterId ?? '')
        setVendorId(data.vendorId ?? '')
        setReason(data.reason ?? '')
        setNotes(data.notes ?? '')
        setInternalNotes(data.internalNotes ?? '')
        setDepartmentId(data.departmentId ?? '')
        setLocationId(data.locationId ?? '')
        setVendorId(data.vendorId ?? '')
        setAttachments(Array.isArray(data.attachments) ? data.attachments.map((attachment: any, index: number) => ({
          id: attachment.id ?? `att-${index}`,
          fileName: attachment.fileName ?? attachment.name ?? 'Attachment',
          contentType: attachment.contentType ?? null,
          size: attachment.size ?? null,
          url: attachment.url ?? attachment.fileUrl ?? undefined,
        })) : [])
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          setLineItems(data.lines.map((line: ApiPRLine) => ({
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
      .catch(() => toast.error('Failed to load purchase request'))
    return () => { active = false }
  }, [companyId, mode, prId, toast])

  const subtotal = useMemo(() => lineItems.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0), [lineItems])
  const taxTotal = useMemo(() => lineItems.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0) * (Number(line.taxRate || 0) / 100), 0), [lineItems])
  const total = useMemo(() => Math.max(0, subtotal + taxTotal), [subtotal, taxTotal])
  const vendorOptions = useMemo(() => vendors.map((v) => ({ id: v.id, name: v.displayName })), [vendors])

  const updateLine = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((items) => items.map((item) => {
      if (item.id !== id) return item
      const next = {
        ...item,
        [field]: field === 'description' || field === 'accountId' ? String(value) : Number(value),
      }
      if (field === 'quantity') {
        next.amount = Number(value) * next.unitPrice
      }
      if (field === 'unitPrice') {
        next.amount = next.quantity * Number(value)
      }
      return next
    }))
  }, [])

  const addLine = useCallback(() => setLineItems((items) => [...items, defaultLineItem()]), [])
  const removeLine = useCallback((id: string) => setLineItems((items) => items.filter((item) => item.id !== id)), [])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!vendorId) { setError('Vendor is required'); return false }
    if (!requesterId) { setError('Requester is required'); return false }
    if (!lineItems.length) { setError('At least one line item is required'); return false }
    if (lineItems.some((line) => !line.description.trim())) { setError('Each line item requires a description'); return false }
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
        requestDate,
        requiredDate,
        priority,
        status: action === 'submit' ? 'SUBMITTED' : status,
        requesterId,
        vendorId,
        departmentId: departmentId || null,
        locationId: locationId || null,
        reason,
        notes,
        internalNotes,
        attachments,
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
        await expensesService.createPurchaseRequest(companyId, payload)
        toast.success(action === 'submit' ? 'Purchase request submitted' : 'Purchase request saved')
      } else if (prId) {
        await expensesService.updatePurchaseRequest(companyId, prId, payload)
        toast.success(action === 'submit' ? 'Purchase request updated and submitted' : 'Purchase request updated')
      }

      router.push('/expenses/procurement/purchase-requests')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to save purchase request')
      toast.error('Unable to save purchase request')
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'new' ? 'New Purchase Request' : 'Edit Purchase Request'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">{title}</h1>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-sm text-slate-700">
              <div className="font-semibold">PR Number</div>
              <div>{requestNumber || 'Auto-generated'}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          {mode !== 'new' ? (
            <div className="inline-flex overflow-hidden rounded-xl bg-white p-1 border border-slate-100">
              {[
                { id: 'details', label: 'Details' },
                { id: 'notes', label: 'Notes' },
                { id: 'attachments', label: 'Attachments' },
                { id: 'activity', label: 'Activity', disabled: false },
              ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => !tab.disabled && setActiveTab(tab.id as typeof activeTab)}
                disabled={tab.disabled}
                className={`px-4 py-2 text-sm font-semibold ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'} ${tab.id === 'details' ? 'rounded-l-lg' : tab.id === 'activity' ? 'rounded-r-lg' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          ) : null}
        </div>
        <div className={mode === 'new' || activeTab === 'details' ? '' : 'hidden'}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 pb-44">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="requestDate" className="block text-sm font-semibold text-slate-900">Request Date</label>
                      <input id="requestDate" type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                    </div>
                    <div>
                      <label htmlFor="requiredDate" className="block text-sm font-semibold text-slate-900">Delivery Date</label>
                      <input id="requiredDate" type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                    </div>
                    <div>
                      <label htmlFor="priority" className="block text-sm font-semibold text-slate-900">Priority</label>
                      <HaypSelect id="priority" value={priority} onChange={setPriority} options={PRIORITIES.map((o) => ({ value: o, label: o }))} />
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-semibold text-slate-900">Status</label>
                      <HaypSelect id="status" value={status} onChange={setStatus} options={STATUS_OPTIONS.map((o) => ({ value: o, label: o }))} />
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <label htmlFor="requesterId" className="block text-sm font-semibold text-slate-900">Requester</label>
                      <HaypSelect id="requesterId" value={requesterId} onChange={setRequesterId} options={employees.map((e) => ({ value: e.id, label: e.displayName }))} placeholder="Select requester" />
                    </div>
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
                      <label htmlFor="departmentId" className="block text-sm font-semibold text-slate-900">Department</label>
                      <HaypSelect id="departmentId" value={departmentId} onChange={setDepartmentId} options={departments.map((d) => ({ value: d.id, label: d.name }))} placeholder="Select department" />
                    </div>
                    <div>
                      <label htmlFor="locationId" className="block text-sm font-semibold text-slate-900">Location</label>
                      <HaypSelect id="locationId" value={locationId} onChange={setLocationId} options={locations.map((l) => ({ value: l.id, label: l.name }))} placeholder="Select location" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-700 mb-3">Line Items</h2>
                    </div>
                    <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                      <Plus size={16} /> Add row
                    </button>
                  </div>

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

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <div className="space-y-4">
                      <div className="text-sm font-semibold text-slate-900">Request summary</div>
                      <div className="flex items-center justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
                      <div className="flex items-center justify-between text-sm text-slate-600"><span>Tax</span><span>{formatCurrency(taxTotal, currency)}</span></div>
                      <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-base font-semibold text-slate-900"><span>Total</span><span>{formatCurrency(total, currency)}</span></div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className={mode === 'new' || activeTab === 'notes' ? '' : 'hidden'}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 pb-32">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <label htmlFor="reason" className="block text-sm font-semibold text-slate-900">Justification / Reason</label>
                  <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-slate-900">Notes</label>
                  <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="internalNotes" className="block text-sm font-semibold text-slate-900">Internal Notes</label>
                  <textarea id="internalNotes" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className={mode === 'new' || activeTab === 'attachments' ? '' : 'hidden'}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 pb-32">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <HaypFileUpload
                attachments={attachments}
                onChange={setAttachments}
                label="Purchase Request Attachments"
                description="Upload supporting documents for the purchase request."
              />
            </section>
          </div>
        </div>

        <div className={activeTab !== 'activity' ? 'hidden' : ''}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
                <div className="mt-4">
                  <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this purchase request yet." />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : <p className="text-sm text-slate-500">Changes are saved when you press Save or Submit.</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push('/expenses/procurement/purchase-requests')} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={() => handleSave('draft')} disabled={submitting} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">Save Draft</button>
            <button type="button" onClick={() => handleSave('submit')} disabled={submitting} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
