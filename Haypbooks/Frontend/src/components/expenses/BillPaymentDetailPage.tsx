'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { fmtDate } from './_helpers'
import ExpenseDetailLayout, { DetailSection } from './ExpenseDetailLayout'
import { expensesService } from '@/services/expenses.service'

interface BillPaymentDetail {
  id: string
  paymentNumber?: string
  referenceNumber?: string
  status?: string
  paymentDate?: string
  method?: string
  bankAccountName?: string
  memo?: string
  amount?: number
  currency?: string
  applications?: Array<{
    billId?: string
    amount?: number
    bill?: {
      id?: string
      billNumber?: string
      date?: string
      total?: number
      originalAmount?: number
      status?: string
    }
  }>
}

const STATUS_COLOR_MAP: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  COMPLETED: 'green',
  PAID: 'green',
  PENDING: 'amber',
  FAILED: 'red',
  VOIDED: 'gray',
}

export default function BillPaymentDetailPage({ paymentId: paymentIdProp }: { paymentId?: string }) {
  const paymentId = paymentIdProp ?? ''
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [payment, setPayment] = useState<BillPaymentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!companyId || !paymentId) return
    const companyIdValue = companyId as string
    const paymentIdValue = paymentId
    let active = true
    setLoading(true)
    setError('')

    async function fetchPayment() {
      try {
        const res = await expensesService.getBillPayment(companyIdValue, paymentIdValue)
        if (!active) return
        const data = res.data ?? res
        setPayment(data as BillPaymentDetail)
      } catch (err) {
        if (!active) return
        setError('Unable to load payment details')
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    fetchPayment()
    return () => { active = false }
  }, [companyId, paymentId])

  const status = payment?.status ?? 'Unknown'
  const statusColor = STATUS_COLOR_MAP[status] ?? 'gray'

  const paymentSection: DetailSection = {
    title: 'Payment Information',
    rows: [
      { label: 'Payment Date', value: payment?.paymentDate ?? '—', type: 'date' },
      { label: 'Method', value: payment?.method ?? '—', type: 'text' },
      { label: 'Reference', value: payment?.referenceNumber ?? '—', type: 'text' },
      { label: 'Bank Account', value: payment?.bankAccountName ?? '—', type: 'text' },
      { label: 'Memo', value: payment?.memo ?? '—', type: 'text' },
    ],
  }

  const financialSection: DetailSection = {
    title: 'Financial',
    rows: [
      { label: 'Total Payment', value: payment?.amount ?? 0, type: 'currency', currencyCode: payment?.currency || currency },
      { label: 'Currency', value: payment?.currency ?? currency, type: 'text' },
    ],
  }

  const billRows = useMemo(() => {
    return (payment?.applications ?? []).map((application) => {
      const bill = application.bill
      const original = bill?.total ?? 0
      const paid = application.amount ?? 0
      const fullyPaid = paid >= original && original > 0
      const statusLabel = fullyPaid ? 'Fully Paid' : 'Partial'
      return [
        bill?.billNumber ?? '—',
        bill?.date ? fmtDate(bill.date) : '—',
        formatCurrency(original, payment?.currency || currency),
        formatCurrency(paid, payment?.currency || currency),
        statusLabel,
      ]
    })
  }, [payment, currency])

  const billsPaidSection: DetailSection = {
    title: 'Bills Paid',
    fullWidth: true,
    table: {
      headers: ['Bill #', 'Bill Date', 'Original Amount', 'Amount Paid', 'Status'],
      rows: billRows,
      emptyMessage: 'No bills paid by this payment',
    },
  }

  return (
    <ExpenseDetailLayout
      title={payment?.referenceNumber ?? payment?.paymentNumber ?? 'Payment Details'}
      subtitle={payment?.method ?? ''}
      status={status}
      statusColor={statusColor}
      metadata={[{ label: 'Payment ID', value: payment?.id ?? '—' }]}
      sections={[paymentSection, financialSection, billsPaidSection]}
      actions={[]}
      backUrl="/expenses/bills-payments/bill-payments"
      loading={loading || cidLoading}
      error={error}
    />
  )
}
