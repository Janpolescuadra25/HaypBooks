'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, CheckCircle, CreditCard } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { fmtDate } from './_helpers'
import ExpenseDetailLayout, { DetailSection } from './ExpenseDetailLayout'
import { expensesService } from '@/services/expenses.service'

interface ExpenseClaimLine {
  id?: string
  date?: string
  category?: string
  description?: string
  merchant?: string
  amount?: number
  accountName?: string
}

interface ExpenseReportDetail {
  id: string
  expenseNumber?: string
  status?: string
  description?: string
  businessPurpose?: string
  notes?: string
  employeeId?: string
  employeeName?: string
  departmentName?: string
  fromDate?: string
  toDate?: string
  submittedAt?: string
  approvedAt?: string
  reimbursedAt?: string
  totalAmount?: number
  advancePayment?: number
  reimbursementMethod?: string
  currency?: string
  lines?: ExpenseClaimLine[]
}

const STATUS_COLOR_MAP: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  DRAFT: 'gray',
  SUBMITTED: 'amber',
  APPROVED: 'blue',
  REJECTED: 'red',
  PAID: 'green',
  REIMBURSED: 'green',
}

const approvableStatuses = new Set(['SUBMITTED'])
const reimbursableStatuses = new Set(['APPROVED'])

export default function ExpenseReportDetailPage({ expenseId: expenseIdProp }: { expenseId?: string }) {
  const expenseId = expenseIdProp ?? ''
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [report, setReport] = useState<ExpenseReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approving, setApproving] = useState(false)
  const [reimbursing, setReimbursing] = useState(false)

  useEffect(() => {
    if (!companyId || !expenseId) return
    const companyIdValue = companyId as string
    let active = true
    setLoading(true)
    setError('')

    async function fetchReport() {
      try {
        const res = await expensesService.getExpenseReport(companyIdValue, expenseId)
        if (!active) return
        const data = res.data ?? res
        setReport(data as ExpenseReportDetail)
      } catch {
        if (!active) return
        setError('Unable to load expense report details')
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    fetchReport()
    return () => { active = false }
  }, [companyId, expenseId])

  const status = report?.status ?? 'DRAFT'
  const statusColor = STATUS_COLOR_MAP[status] ?? 'gray'
  const reportCurrency = report?.currency ?? currency

  const overviewSection: DetailSection = useMemo(() => ({
    title: 'Overview',
    rows: [
      { label: 'Description', value: report?.description ?? '—', type: 'text' },
      { label: 'Business Purpose', value: report?.businessPurpose ?? '—', type: 'text' },
      { label: 'Employee', value: report?.employeeName ?? '—', type: 'text' },
      { label: 'Department', value: report?.departmentName ?? '—', type: 'text' },
      { label: 'Period From', value: report?.fromDate, type: 'date' },
      { label: 'Period To', value: report?.toDate, type: 'date' },
    ],
  }), [report])

  const financialSection: DetailSection = useMemo(() => ({
    title: 'Financial Summary',
    rows: [
      { label: 'Total Amount', value: Number(report?.totalAmount ?? 0), type: 'currency', currencyCode: reportCurrency },
      { label: 'Advance Payment', value: Number(report?.advancePayment ?? 0), type: 'currency', currencyCode: reportCurrency },
      { label: 'Reimbursement Method', value: report?.reimbursementMethod ?? '—', type: 'text' },
    ],
  }), [report, reportCurrency])

  const datesSection: DetailSection = useMemo(() => ({
    title: 'Dates',
    rows: [
      { label: 'Submitted', value: report?.submittedAt, type: 'date' },
      { label: 'Approved', value: report?.approvedAt, type: 'date' },
      { label: 'Reimbursed', value: report?.reimbursedAt, type: 'date' },
    ],
  }), [report])

  const notesSection: DetailSection = useMemo(() => ({
    title: 'Notes',
    rows: [
      { label: 'Notes', value: report?.notes ?? '—', type: 'text' },
    ],
  }), [report])

  const linesSection: DetailSection = useMemo(() => ({
    title: 'Expense Lines',
    fullWidth: true,
    table: {
      headers: ['Date', 'Category', 'Description', 'Merchant', 'Amount'],
      rows: (report?.lines ?? []).map((line) => [
        fmtDate(line.date),
        line.category ?? '—',
        line.description ?? '—',
        line.merchant ?? '—',
        formatCurrency(Number(line.amount ?? 0), reportCurrency),
      ]),
      emptyMessage: 'No expense lines recorded.',
    },
  }), [report, reportCurrency])

  const actions = useMemo(() => {
    const result = [
      {
        label: 'Edit',
        icon: <Edit2 size={14} />,
        onClick: () => router.push(`/expenses/${expenseId}/edit`),
        variant: 'default' as const,
        disabled: status !== 'DRAFT',
      },
    ] as Array<{ label: string; icon: React.ReactNode; onClick: () => void; variant: 'default' | 'primary'; disabled: boolean }>

    if (approvableStatuses.has(status)) {
      result.push({
        label: approving ? 'Approving…' : 'Approve',
        icon: <CheckCircle size={14} />,
        onClick: async () => {
          if (!companyId) return
          setApproving(true)
          try {
            await expensesService.approveExpenseReport(companyId, expenseId)
            toast.success('Expense report approved')
            setReport((prev) => prev ? { ...prev, status: 'APPROVED', approvedAt: new Date().toISOString() } : prev)
          } catch {
            toast.error('Failed to approve expense report')
          } finally {
            setApproving(false)
          }
        },
        variant: 'primary' as const,
        disabled: approving,
      })
    }

    if (reimbursableStatuses.has(status)) {
      result.push({
        label: reimbursing ? 'Reimbursing…' : 'Mark Reimbursed',
        icon: <CreditCard size={14} />,
        onClick: async () => {
          if (!companyId) return
          setReimbursing(true)
          try {
            await expensesService.reimburseExpenseReport(companyId, expenseId, { method: 'SEPARATE_CHECK' })
            toast.success('Expense report marked as reimbursed')
            setReport((prev) => prev ? { ...prev, status: 'PAID', reimbursedAt: new Date().toISOString() } : prev)
          } catch {
            toast.error('Failed to mark expense report as reimbursed')
          } finally {
            setReimbursing(false)
          }
        },
        variant: 'primary' as const,
        disabled: reimbursing,
      })
    }

    return result
  }, [router, expenseId, status, approving, reimbursing, companyId, toast])

  return (
    <ExpenseDetailLayout
      title={report?.expenseNumber ?? 'Expense'}
      subtitle={report?.description ?? ''}
      status={status}
      statusColor={statusColor}
      metadata={[
        { label: 'Report ID', value: report?.id ?? '—' },
        { label: 'Employee', value: report?.employeeName ?? '—' },
      ]}
      sections={[overviewSection, financialSection, datesSection, notesSection, linesSection]}
      actions={actions}
      backUrl="/expenses/employee-expenses/expenses"
      backLabel="Expenses"
      loading={loading || cidLoading}
      error={error}
    />
  )
}
