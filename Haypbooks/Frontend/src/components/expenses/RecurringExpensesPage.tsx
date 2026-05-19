'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, X, CircleSlash } from 'lucide-react'
import { listRecurringExpenses, createRecurringExpense, updateRecurringExpense, cancelRecurringExpense } from '@/services/recurring-expense.service'
import { expensesService } from '@/services/expenses.service'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import HaypSelect from '@/components/shared/HaypSelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/format'
import type { HaypColumn } from '@/components/shared/HaypDataTable.types'

interface RecurringExpenseRow {
  id: string
  description: string
  vendorId?: string
  vendorName?: string
  amount: number
  frequency: string
  nextExecutionDate: string
  status: string
  startDate: string
  endDate?: string
  memo?: string
  expenseAccountId?: string
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const FREQUENCY_OPTIONS = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Biweekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
]

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
}

const INITIAL_FORM = {
  id: '',
  vendorId: '',
  description: '',
  memo: '',
  amount: '',
  frequency: 'MONTHLY',
  interval: 1,
  startDate: '',
  endDate: '',
}

export default function RecurringExpensesPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows] = useState<RecurringExpenseRow[]>([])
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [vendorFilter, setVendorFilter] = useState('ALL')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [formState, setFormState] = useState<typeof INITIAL_FORM>(INITIAL_FORM)
  const [isEditing, setIsEditing] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }, [])

  const fetchVendors = useCallback(async () => {
    if (!companyId) return
    try {
      const res = await expensesService.listVendors(companyId)
      const data = res.data ?? res
      const list = Array.isArray(data) ? data : data.data ?? []
      setVendors(list.map((vendor: any) => ({
        id: String(vendor.id ?? vendor.contactId ?? vendor.contact?.id ?? ''),
        name: String(vendor.displayName ?? vendor.name ?? vendor.contact?.displayName ?? ''),
      })).filter((vendor: any) => vendor.id))
    } catch {
      setVendors([])
    }
  }, [companyId])

  const fetchRows = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const res = await listRecurringExpenses(companyId, {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        vendorId: vendorFilter !== 'ALL' ? vendorFilter : undefined,
        take: 100,
      })
      const data = res.data ?? res
      const items = Array.isArray(data) ? data : data.items ?? []
      setRows(items.map((item: any) => ({
        id: item.id,
        description: item.description,
        vendorId: item.vendorId,
        vendorName: item.vendor?.contact?.displayName ?? item.vendor?.name ?? '',
        amount: Number(item.amount ?? 0),
        frequency: item.frequency,
        nextExecutionDate: item.nextExecutionDate ? new Date(item.nextExecutionDate).toISOString().slice(0, 10) : '',
        status: item.status,
        startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : '',
        memo: item.memo ?? '',
        expenseAccountId: item.expenseAccountId ?? undefined,
      })))
    } catch {
      showToast('Failed to load recurring expenses')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter, vendorFilter, showToast])

  useEffect(() => { fetchVendors() }, [fetchVendors])
  useEffect(() => { fetchRows() }, [fetchRows])

  const filteredRows = useMemo(() => rows, [rows])

  const columns = useMemo<HaypColumn<RecurringExpenseRow>[]>(() => [
    { id: 'description', header: 'Description', accessorKey: 'description', size: 220 },
    { id: 'vendorName', header: 'Vendor', accessorKey: 'vendorName', size: 200 },
    { id: 'amount', header: 'Amount', accessorKey: 'amount', size: 120, align: 'right', render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{formatCurrency(Number(value ?? 0), currency)}</span> },
    { id: 'frequency', header: 'Frequency', accessorKey: 'frequency', size: 130 },
    { id: 'nextExecutionDate', header: 'Next Execution', accessorKey: 'nextExecutionDate', size: 140 },
    { id: 'status', header: 'Status', accessorKey: 'status', size: 120, render: (value) => <span className={STATUS_BADGE[String(value)] ?? 'bg-slate-100 text-slate-700 rounded-full px-2 py-1 text-xs'}>{String(value)}</span> },
    {
      id: 'actions',
      header: 'Actions',
      accessorKey: 'id',
      size: 180,
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => openEdit(String(value))}
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
          {row?.status === 'ACTIVE' ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              onClick={() => handleCancel(String(value))}
            >
              <CircleSlash className="h-4 w-4" /> Cancel
            </button>
          ) : null}
        </div>
      ),
    },
  ], [currency])

  const openCreate = useCallback(() => {
    setIsEditing(false)
    setFormState(INITIAL_FORM)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((id: string) => {
    const item = rows.find((row) => row.id === id)
    if (!item) return
    setIsEditing(true)
    setFormState({
      id: item.id,
      vendorId: item.vendorId ?? '',
      description: item.description,
      memo: item.memo ?? '',
      amount: String(item.amount),
      frequency: item.frequency,
      interval: 1,
      startDate: item.startDate,
      endDate: item.endDate ?? '',
    })
    setModalOpen(true)
  }, [rows])

  const handleCancel = useCallback(async (id: string) => {
    if (!companyId || !confirm('Cancel this recurring expense?')) return
    try {
      await cancelRecurringExpense(companyId, id)
      showToast('Recurring expense cancelled')
      fetchRows()
    } catch {
      showToast('Failed to cancel recurring expense')
    }
  }, [companyId, fetchRows, showToast])

  const handleSave = useCallback(async () => {
    if (!companyId) return
    const payload = {
      vendorId: formState.vendorId || undefined,
      description: formState.description,
      memo: formState.memo || undefined,
      amount: Number(formState.amount || 0),
      currency: currency || 'USD',
      frequency: formState.frequency,
      interval: formState.interval || 1,
      startDate: formState.startDate,
      endDate: formState.endDate || undefined,
    }

    try {
      if (isEditing && formState.id) {
        await updateRecurringExpense(companyId, formState.id, payload)
        showToast('Recurring expense updated')
      } else {
        await createRecurringExpense(companyId, payload)
        showToast('Recurring expense created')
      }
      setModalOpen(false)
      fetchRows()
    } catch {
      showToast('Failed to save recurring expense')
    }
  }, [companyId, currency, formState, isEditing, fetchRows, showToast])

  if (cidLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="text-sm text-slate-600">Loading...</span>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50/30 custom-scrollbar">
      <div className="max-w-full mx-auto p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Expenses</p>
            <h1 className="text-3xl font-bold text-slate-900">Recurring Expenses</h1>
          </div>
          <Button onClick={openCreate} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Recurring Expense
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <HaypSelect
            id="statusFilter"
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
          <HaypSelect
            id="vendorFilter"
            label="Vendor"
            value={vendorFilter}
            onChange={setVendorFilter}
            options={[
              { value: 'ALL', label: 'All Vendors' },
              ...vendors.map((vendor) => ({ value: vendor.id, label: vendor.name })),
            ]}
          />
        </div>

        <HaypDataTable
          data={filteredRows}
          columns={columns}
          tableId="recurring-expenses"
          title="Recurring Expenses"
          description="Manage your active and scheduled recurring expenses."
          headerActions={
            <Button onClick={openCreate} className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Recurring Expense
            </Button>
          }
          filters={STATUS_OPTIONS}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          filterLabel="Status"
          loading={loading}
          emptyTitle="No recurring expenses found"
          emptySubtitle="Adjust your filters or create a new recurring expense."
        />

        {modalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Recurring Expense' : 'New Recurring Expense'}</h2>
                  <p className="text-sm text-slate-500">Enter the schedule and amount for this recurring expense.</p>
                </div>
                <button type="button" aria-label="Close modal" onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                  <HaypSelect
                    id="vendor"
                    value={formState.vendorId}
                    onChange={(value) => setFormState((prev) => ({ ...prev, vendorId: value }))}
                    options={[
                      { value: '', label: 'No vendor' },
                      ...vendors.map((vendor) => ({ value: vendor.id, label: vendor.name })),
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <Input
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Recurring expense description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <Input
                    type="number"
                    value={formState.amount}
                    onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder="Amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                  <HaypSelect
                    id="frequency"
                    value={formState.frequency}
                    onChange={(value) => setFormState((prev) => ({ ...prev, frequency: value }))}
                    options={FREQUENCY_OPTIONS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={formState.startDate}
                    onChange={(event) => setFormState((prev) => ({ ...prev, startDate: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={formState.endDate}
                    onChange={(event) => setFormState((prev) => ({ ...prev, endDate: event.target.value }))}
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Memo</label>
                  <textarea
                    value={formState.memo}
                    onChange={(event) => setFormState((prev) => ({ ...prev, memo: event.target.value }))}
                    className="min-h-[100px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Optional memo for this recurring expense"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {toast ? (
          <div className="fixed bottom-6 right-6 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
            {toast}
          </div>
        ) : null}
      </div>
    </div>
  )
}
