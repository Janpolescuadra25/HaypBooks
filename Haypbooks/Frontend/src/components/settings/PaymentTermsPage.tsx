'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react'
import { salesService, PaymentTerm } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypColumn } from '@/components/shared/HaypDataTable.types'
import HaypModal from '@/components/shared/HaypModal'

function TermFormModal({
  mode,
  initial,
  companyId,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit'
  initial: PaymentTerm | null
  companyId: string
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const [name, setName] = useState(initial?.name ?? '')
  const [dueDays, setDueDays] = useState(initial?.dueDays.toString() ?? '0')
  const [discountDays, setDiscountDays] = useState(initial?.discountDays?.toString() ?? '')
  const [discountPct, setDiscountPct] = useState(initial?.discountPct?.toString() ?? '')
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(initial?.name ?? '')
    setDueDays(initial?.dueDays.toString() ?? '0')
    setDiscountDays(initial?.discountDays?.toString() ?? '')
    setDiscountPct(initial?.discountPct?.toString() ?? '')
    setIsDefault(initial?.isDefault ?? false)
  }, [initial])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    const dueDaysValue = Number(dueDays)
    if (Number.isNaN(dueDaysValue) || dueDaysValue < 0) {
      toast.error('Due days must be 0 or greater')
      return
    }
    const discountDaysValue = Number(discountDays)
    const discountPctValue = Number(discountPct)
    const payload: any = {
      name: name.trim(),
      dueDays: dueDaysValue,
      discountDays: discountDaysValue > 0 ? discountDaysValue : null,
      discountPct: discountPctValue > 0 ? discountPctValue : null,
      isDefault,
    }

    setSaving(true)
    try {
      if (mode === 'create') {
        await salesService.createArPaymentTerm(companyId, payload)
        toast.success('Payment term created')
      } else {
        await salesService.updateArPaymentTerm(companyId, initial!.id, payload)
        toast.success('Payment term updated')
      }
      onSaved()
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save payment term')
    } finally {
      setSaving(false)
    }
  }

  return (
    <HaypModal
      open={true}
      onClose={onClose}
      title={mode === 'create' ? 'New Payment Term' : 'Edit Payment Term'}
      size="sm"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Net 30"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Due Days <span className="text-red-500">*</span></label>
          <input
            type="number"
            min={0}
            value={dueDays}
            onChange={e => setDueDays(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Discount %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={discountPct}
              onChange={e => setDiscountPct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Discount Days</label>
            <input
              type="number"
              min={0}
              value={discountDays}
              onChange={e => setDiscountDays(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="default-term"
            type="checkbox"
            checked={isDefault}
            onChange={e => setIsDefault(e.target.checked)}
            className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="default-term" className="text-sm text-gray-700">Set as default payment term</label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Term'}
          </button>
        </div>
      </form>
    </HaypModal>
  )
}

export default function PaymentTermsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const toast = useToast()

  const [terms, setTerms] = useState<PaymentTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; term: PaymentTerm } | null>(null)

  const fetchTerms = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const response = await salesService.listArPaymentTerms(companyId)
      const result = response.data as any
      setTerms(Array.isArray(result) ? result : [])
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load payment terms')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchTerms() }, [fetchTerms])

  const handleDelete = async (term: PaymentTerm) => {
    if (!confirm(`Are you sure you want to delete the payment term "${term.name}"?`)) return
    try {
      await salesService.deleteArPaymentTerm(companyId!, term.id)
      toast.success('Payment term deleted')
      fetchTerms()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete payment term')
    }
  }

  const columns: HaypColumn<PaymentTerm>[] = useMemo(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      render: (value: any) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      id: 'dueDays',
      accessorKey: 'dueDays',
      header: 'Due Days',
      render: (value: any) => <span className="text-gray-700">{value} days</span>,
    },
    {
      id: 'discount',
      header: 'Discount',
      render: (_value: any, row: PaymentTerm) => {
        const hasDiscount = row.discountPct != null && row.discountPct > 0 && row.discountDays != null && row.discountDays > 0
        return hasDiscount ? <span className="text-gray-700">{row.discountPct}% / {row.discountDays} days</span> : <span className="text-gray-400">—</span>
      },
    },
    {
      id: 'default',
      header: 'Default',
      render: (_value: any, row: PaymentTerm) => (
        row.isDefault ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Default</span> : <span className="text-gray-400">—</span>
      ),
    },
  ], [])

  const rowActions: HaypActionItem[] = useMemo(() => [
    {
      label: 'Edit',
      icon: <Edit2 size={14} />,
      onClick: (_rowId: string, row: any) => setModal({ mode: 'edit', term: row }),
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: (_rowId: string, row: any) => handleDelete(row),
    },
  ], [handleDelete])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Plus size={22} className="text-emerald-600" />
              Payment Terms
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage payment terms for invoices and bills</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTerms}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setModal({ mode: 'create' })}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              <Plus size={14} />
              Create Term
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <HaypDataTable
          tableId="payment-terms"
          title="Payment Terms"
          description="Manage payment terms for invoices and bills"
          data={terms}
          columns={columns}
          actions={rowActions}
          loading={loading || companyLoading}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          searchPlaceholder="Search payment terms…"
          emptyTitle="No payment terms yet"
          emptySubtitle="Create your first payment term to get started"
          onRefresh={fetchTerms}
          className="bg-white rounded-xl border border-gray-200"
        />
      </div>

      {modal && (
        <TermFormModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.term : null}
          companyId={companyId!}
          onClose={() => setModal(null)}
          onSaved={fetchTerms}
        />
      )}
    </div>
  )
}
