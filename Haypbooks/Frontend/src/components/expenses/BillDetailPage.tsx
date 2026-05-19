'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Edit2, Trash2, Send, Check, X, Ban } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { fmtDate } from './_helpers'
import ExpenseDetailLayout, { DetailSection } from './ExpenseDetailLayout'
import RejectionReasonModal from '@/components/shared/RejectionReasonModal'

interface BillDetail {
  id: string
  billNumber?: string
  status?: string
  vendorId?: string
  vendorName?: string
  vendor?: {
    id?: string
    displayName?: string
    address?: string
  }
  date?: string
  dueDate?: string
  paymentTerms?: string
  terms?: string
  reference?: string
  subtotal?: number
  tax?: number
  total?: number
  balanceDue?: number
  currency?: string
  memo?: string
  description?: string
  billDate?: string
  dueAt?: string
  createdAt?: string
  createdBy?: string
  items?: Array<{
    id?: string
    description?: string
    accountName?: string
    account?: string
    quantity?: number
    unitPrice?: number
    rate?: number
    amount?: number
    taxAmount?: number
    taxRate?: number
  }>
}

interface BillPayment {
  id: string
  date?: string
  referenceNumber?: string
  method?: string
  amount?: number
}

const STATUS_COLOR_MAP: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  DRAFT: 'gray',
  PENDING: 'amber',
  APPROVED: 'blue',
  PARTIALLY_PAID: 'amber',
  PAID: 'green',
  VOIDED: 'gray',
  OVERDUE: 'red',
  CANCELED: 'gray',
  REJECTED: 'red',
}

export default function BillDetailPage({ billId: billIdProp }: { billId?: string }) {
  const params = useParams() as Record<string, string | undefined>
  const billId = billIdProp ?? params.billId ?? params.id ?? ''
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [bill, setBill] = useState<BillDetail | null>(null)
  const [payments, setPayments] = useState<BillPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const billVendorName = bill?.vendorName || bill?.vendor?.displayName || 'Vendor'
  const billNumberTitle = bill?.billNumber || 'Bill Details'
  const status = bill?.status ?? ''
  const statusColor = status ? STATUS_COLOR_MAP[status] ?? 'gray' : 'gray'

  useEffect(() => {
    if (!companyId || !billId) return
    const companyIdValue = companyId as string
    const billIdValue = billId
    let active = true
    setLoading(true)
    setError('')

    async function fetchBill() {
      try {
        const res = await expensesService.getBill(companyIdValue, billIdValue)
        if (!active) return
        const data = res.data ?? res
        setBill(data as BillDetail)
      } catch (err) {
        if (!active) return
        setError('Unable to load bill details')
        setBill(null)
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    fetchBill()
    return () => { active = false }
  }, [companyId, billId, toast])

  useEffect(() => {
    if (!companyId || !billId) return
    const companyIdValue = companyId as string
    const billIdValue = billId
    let active = true

    async function fetchPayments() {
      try {
        const res = await expensesService.listBillPayments(companyIdValue, { billId: billIdValue, limit: 100 })
        if (!active) return
        const data = res.data ?? res
        const list = Array.isArray(data) ? data : data.data ?? []
        setPayments(list as BillPayment[])
      } catch (err) {
      }
    }

    fetchPayments()
    return () => { active = false }
  }, [companyId, billId])

  const lineItems = useMemo(() => {
    const raw = bill?.items ?? []
    return raw.map((item) => ({
      account: item.accountName ?? item.account ?? '—',
      description: item.description ?? '—',
      qty: item.quantity ?? 0,
      rate: item.unitPrice ?? item.rate ?? 0,
      amount: item.amount ?? 0,
      tax: item.taxAmount ?? ((item.unitPrice ?? item.rate ?? 0) * (item.taxRate ?? 0) / 100),
    }))
  }, [bill])

  const generalSection: DetailSection = {
    title: 'General',
    rows: [
      { label: 'Expense Date', value: bill?.date ?? bill?.billDate ?? '—', type: 'date' },
      { label: 'Due Date', value: bill?.dueDate ?? bill?.dueAt ?? '—', type: 'date' },
      { label: 'Memo', value: bill?.memo ?? bill?.description ?? '—', type: 'text' },
      { label: 'Payment Terms', value: bill?.paymentTerms ?? bill?.terms ?? '—', type: 'text' },
      { label: 'Reference', value: bill?.reference ?? '—', type: 'text' },
    ],
  }

  const financialSection: DetailSection = {
    title: 'Financial',
    rows: [
      { label: 'Subtotal', value: bill?.subtotal ?? 0, type: 'currency', currencyCode: bill?.currency || currency },
      { label: 'Tax', value: bill?.tax ?? 0, type: 'currency', currencyCode: bill?.currency || currency },
      { label: 'Total', value: bill?.total ?? 0, type: 'currency', currencyCode: bill?.currency || currency },
      { label: 'Balance Due', value: bill?.balanceDue ?? 0, type: 'currency', currencyCode: bill?.currency || currency },
      { label: 'Currency', value: bill?.currency ?? currency, type: 'text' },
    ],
  }

  const vendorSection: DetailSection = {
    title: 'Vendor',
    rows: [
      { label: 'Name', value: billVendorName, type: 'text' },
      { label: 'Address', value: bill?.vendor?.address ?? '—', type: 'text' },
    ],
  }

  const itemsSection: DetailSection = {
    title: 'Line Items',
    fullWidth: true,
    table: {
      headers: ['Account', 'Description', 'Qty', 'Rate', 'Amount', 'Tax'],
      rows: lineItems.map((item) => [
        item.account,
        item.description,
        item.qty,
        formatCurrency(item.rate, bill?.currency || currency),
        formatCurrency(item.amount, bill?.currency || currency),
        formatCurrency(item.tax, bill?.currency || currency),
      ]),
    },
  }

  const paymentsSection: DetailSection = {
    title: 'Payment History',
    fullWidth: true,
    table: {
      headers: ['Date', 'Reference', 'Method', 'Amount'],
      rows: payments.length > 0
        ? payments.map((payment) => [
            payment.date ? fmtDate(payment.date) : '—',
            payment.referenceNumber ?? '—',
            payment.method ?? '—',
            formatCurrency(payment.amount ?? 0, bill?.currency || currency),
          ])
        : [],
      emptyMessage: 'No payments recorded',
    },
  }

  const hasNoPayments = bill?.balanceDue !== undefined && bill?.total !== undefined && bill.balanceDue === bill.total

  const handleSubmitBill = useCallback(async () => {
    if (!companyId || !billId) return
    setActionLoading(true)
    try {
      await expensesService.submitBill(companyId, billId)
      toast.success('Bill submitted')
      router.refresh()
    } catch (err) {
      toast.error('Failed to submit bill')
    } finally {
      setActionLoading(false)
    }
  }, [companyId, billId, router, toast])

  const handleApproveBill = useCallback(async () => {
    if (!companyId || !billId) return
    setActionLoading(true)
    try {
      await expensesService.approveBill(companyId, billId)
      toast.success('Bill approved')
      router.refresh()
    } catch (err) {
      toast.error('Failed to approve bill')
    } finally {
      setActionLoading(false)
    }
  }, [companyId, billId, router, toast])

  const handleRejectBill = useCallback(async (reason: string) => {
    if (!companyId || !billId) return
    setActionLoading(true)
    try {
      await expensesService.rejectBill(companyId, billId, { reason })
      toast.success('Bill rejected')
      setRejectModalOpen(false)
      router.refresh()
    } catch (err) {
      toast.error('Failed to reject bill')
    } finally {
      setActionLoading(false)
    }
  }, [companyId, billId, router, toast])

  const handleUnapproveBill = useCallback(async () => {
    if (!companyId || !billId) return
    setActionLoading(true)
    try {
      await expensesService.unapproveBill(companyId, billId)
      toast.success('Bill unapproved')
      router.refresh()
    } catch (err) {
      toast.error('Failed to unapprove bill')
    } finally {
      setActionLoading(false)
    }
  }, [companyId, billId, router, toast])

  const actions = [
    {
      label: 'Edit',
      icon: <Edit2 size={14} />,
      onClick: () => router.push(`/expenses/bills-payments/bills/${billId}/edit`),
      variant: 'primary' as const,
      disabled: !billId || status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED',
    },
    ...(status === 'DRAFT' || status === 'REJECTED' ? [{
      label: status === 'DRAFT' ? 'Submit bill' : 'Resubmit bill',
      icon: <Send size={14} />,
      onClick: handleSubmitBill,
      variant: 'secondary' as const,
      disabled: actionLoading || !billId,
    }] : []),
    ...(status === 'PENDING' ? [{
      label: 'Approve bill',
      icon: <Check size={14} />,
      onClick: handleApproveBill,
      variant: 'success' as const,
      disabled: actionLoading || !billId,
    }, {
      label: 'Reject bill',
      icon: <X size={14} />,
      onClick: () => setRejectModalOpen(true),
      variant: 'danger' as const,
      disabled: actionLoading || !billId,
    }] : []),
    ...(status === 'APPROVED' && hasNoPayments ? [{
      label: 'Unapprove bill',
      icon: <Ban size={14} />,
      onClick: handleUnapproveBill,
      variant: 'warning' as const,
      disabled: actionLoading || !billId,
    }] : []),
    ...(status === 'DRAFT' || status === 'REJECTED' ? [{
      label: 'Delete',
      icon: <Trash2 size={14} />,
      onClick: async () => {
        if (!companyId || !billId) return
        if (!window.confirm('Delete this bill? This cannot be undone.')) return
        setDeleting(true)
        try {
          await expensesService.deleteBill(companyId, billId)
          toast.success('Bill deleted')
          router.push('/expenses/bills-payments/bills')
        } catch (err) {
          toast.error('Failed to delete bill')
        } finally {
          setDeleting(false)
        }
      },
      variant: 'danger' as const,
      disabled: deleting || !billId,
    }] : []),
  ]

  return (
    <>
      <ExpenseDetailLayout
        title={billNumberTitle}
        subtitle={billVendorName}
        status={status}
        statusColor={statusColor}
        metadata={[
          { label: 'Created', value: bill?.createdAt ? fmtDate(bill.createdAt) : '—' },
          { label: 'Vendor', value: billVendorName },
        ]}
        sections={[generalSection, financialSection, vendorSection, itemsSection, paymentsSection]}
        actions={actions}
        backUrl="/expenses/bills-payments/bills"
        loading={loading || cidLoading}
        error={error}
      />
      <RejectionReasonModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectBill}
        title="Reject bill"
        description="Provide a reason for rejecting this bill."
      />
    </>
  )
}
