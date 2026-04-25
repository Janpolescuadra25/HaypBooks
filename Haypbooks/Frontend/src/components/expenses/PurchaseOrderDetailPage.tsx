'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Trash2 } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { fmtDate } from './_helpers'
import ExpenseDetailLayout, { DetailSection } from './ExpenseDetailLayout'
import { expensesService } from '@/services/expenses.service'

interface PurchaseOrderDetail {
  id: string
  poNumber?: string
  status?: string
  vendorId?: string
  vendorName?: string
  vendor?: {
    displayName?: string
    email?: string
    phone?: string
  }
  date?: string
  expectedDeliveryDate?: string
  receivedDate?: string
  reference?: string
  subtotal?: number
  tax?: number
  total?: number
  currency?: string
  items?: Array<{
    id?: string
    itemName?: string
    description?: string
    quantity?: number
    unitPrice?: number
    amount?: number
  }>
  linkedBills?: Array<{
    id?: string
    billNumber?: string
    date?: string
    amount?: number
    status?: string
  }>
}

const STATUS_COLOR_MAP: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  DRAFT: 'gray',
  PENDING: 'amber',
  APPROVED: 'blue',
  CONFIRMED: 'blue',
  RECEIVED: 'green',
  VOIDED: 'gray',
  CANCELLED: 'red',
}

const convertibleStatuses = new Set(['APPROVED', 'CONFIRMED', 'RECEIVED'])

export default function PurchaseOrderDetailPage({ purchaseOrderId: purchaseOrderIdProp }: { purchaseOrderId?: string }) {
  const purchaseOrderId = purchaseOrderIdProp ?? ''
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [po, setPo] = useState<PurchaseOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [converting, setConverting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!companyId || !purchaseOrderId) return
    const companyIdValue = companyId as string
    const poIdValue = purchaseOrderId
    let active = true
    setLoading(true)
    setError('')

    async function fetchPurchaseOrder() {
      try {
        const res = await expensesService.getPurchaseOrder(companyIdValue, poIdValue)
        if (!active) return
        const data = res.data ?? res
        setPo(data as PurchaseOrderDetail)
      } catch (err) {
        console.error(err)
        if (!active) return
        setError('Unable to load purchase order details')
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    fetchPurchaseOrder()
    return () => { active = false }
  }, [companyId, purchaseOrderId])

  const status = po?.status ?? 'Unknown'
  const statusColor = STATUS_COLOR_MAP[status] ?? 'gray'
  const canConvert = convertibleStatuses.has(status)
  const canDelete = status === 'DRAFT'

  const generalSection: DetailSection = {
    title: 'General',
    rows: [
      { label: 'PO Date', value: po?.date ?? '—', type: 'date' },
      { label: 'Expected Delivery', value: po?.expectedDeliveryDate ?? '—', type: 'date' },
      { label: 'Received Date', value: po?.receivedDate ?? '—', type: 'date' },
      { label: 'Status', value: status, type: 'text' },
      { label: 'Reference', value: po?.reference ?? '—', type: 'text' },
    ],
  }

  const vendorSection: DetailSection = {
    title: 'Vendor',
    rows: [
      { label: 'Name', value: po?.vendorName ?? po?.vendor?.displayName ?? '—', type: 'text' },
      { label: 'Email', value: po?.vendor?.email ?? '—', type: 'text' },
      { label: 'Phone', value: po?.vendor?.phone ?? '—', type: 'text' },
    ],
  }

  const financialSection: DetailSection = {
    title: 'Financial',
    rows: [
      { label: 'Subtotal', value: po?.subtotal ?? 0, type: 'currency', currencyCode: po?.currency || currency },
      { label: 'Tax', value: po?.tax ?? 0, type: 'currency', currencyCode: po?.currency || currency },
      { label: 'Total', value: po?.total ?? 0, type: 'currency', currencyCode: po?.currency || currency },
      { label: 'Currency', value: po?.currency ?? currency, type: 'text' },
    ],
  }

  const itemsSection: DetailSection = {
    title: 'Line Items',
    fullWidth: true,
    table: {
      headers: ['Item', 'Description', 'Qty', 'Rate', 'Amount'],
      rows: (po?.items ?? []).map((item) => [
        item.itemName ?? '—',
        item.description ?? '—',
        item.quantity ?? 0,
        formatCurrency(item.unitPrice ?? 0, po?.currency || currency),
        formatCurrency(item.amount ?? 0, po?.currency || currency),
      ]),
      emptyMessage: 'No line items available',
    },
  }

  const linkedBills = po?.linkedBills ?? []
  const linkedBillsSection: DetailSection = {
    title: 'Linked Bills',
    fullWidth: true,
    table: {
      headers: ['Bill #', 'Bill Date', 'Amount', 'Status'],
      rows: linkedBills.map((bill) => [
        bill.billNumber ?? '—',
        bill.date ? fmtDate(bill.date) : '—',
        formatCurrency(bill.amount ?? 0, po?.currency || currency),
        bill.status ?? '—',
      ]),
      emptyMessage: 'No bills linked to this purchase order',
    },
  }

  const actions = [
    {
      label: 'Edit',
      icon: <Edit2 size={14} />,
      onClick: () => router.push(`/expenses/procurement/orders/${purchaseOrderId}/edit`),
      variant: 'primary' as const,
      disabled: !purchaseOrderId,
    },
    ...(canConvert ? [{
      label: 'Convert to Bill',
      icon: <Edit2 size={14} />,
      onClick: async () => {
        if (!companyId || !purchaseOrderId) return
        if (!window.confirm('Convert this purchase order to a bill?')) return
        setConverting(true)
        try {
          const res = await expensesService.convertPurchaseOrderToBill(companyId, purchaseOrderId)
          const data = res.data ?? res
          const newBillId = (data as any)?.id || (data as any)?.billId
          toast.success('Purchase order converted to bill')
          if (newBillId) {
            router.push(`/expenses/bills-payments/bills/${newBillId}`)
          } else {
            router.push('/expenses/bills-payments/bills')
          }
        } catch (err) {
          console.error(err)
          toast.error('Failed to convert purchase order')
        } finally {
          setConverting(false)
        }
      },
      variant: 'default' as const,
      disabled: converting,
    }] : []),
    ...(canDelete ? [{
      label: 'Delete',
      icon: <Trash2 size={14} />,
      onClick: async () => {
        if (!companyId || !purchaseOrderId) return
        if (!window.confirm('Delete this purchase order? This cannot be undone.')) return
        setDeleting(true)
        try {
          await expensesService.deletePurchaseOrder(companyId, purchaseOrderId)
          toast.success('Purchase order deleted')
          router.push('/expenses/procurement/orders')
        } catch (err) {
          console.error(err)
          toast.error('Failed to delete purchase order')
        } finally {
          setDeleting(false)
        }
      },
      variant: 'danger' as const,
      disabled: deleting,
    }] : []),
  ]

  return (
    <ExpenseDetailLayout
      title={po?.poNumber ?? 'Purchase Order Details'}
      subtitle={po?.vendorName ?? po?.vendor?.displayName ?? ''}
      status={status}
      statusColor={statusColor}
      metadata={[{ label: 'PO ID', value: po?.id ?? '—' }]}
      sections={[generalSection, vendorSection, financialSection, itemsSection, linkedBillsSection]}
      actions={actions}
      backUrl="/expenses/procurement/orders"
      loading={loading || cidLoading}
      error={error}
    />
  )
}
