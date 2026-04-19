'use client'

import { render, screen } from '@testing-library/react'
import {
  StatusBadge,
  getInvoiceStatusProps,
  getJournalEntryStatusProps,
  getPaymentStatusProps,
} from '@/components/shared/StatusBadgeSet'

describe('StatusBadgeSet', () => {
  it('returns correct props for invoice statuses', () => {
    expect(getInvoiceStatusProps('DRAFT')).toMatchObject({
      label: 'Draft',
      className: 'bg-slate-100 text-slate-800',
    })
    expect(getInvoiceStatusProps('SENT')).toMatchObject({
      label: 'Sent',
      className: 'bg-blue-100 text-blue-800',
    })
    expect(getInvoiceStatusProps('PAID')).toMatchObject({
      label: 'Paid',
      className: 'bg-emerald-100 text-emerald-800',
    })
    expect(getInvoiceStatusProps('OVERDUE')).toMatchObject({
      label: 'Overdue',
      className: 'bg-red-100 text-red-800',
    })
    expect(getInvoiceStatusProps('VOID')).toMatchObject({
      label: 'Void',
      className: 'bg-red-100 text-red-800',
    })
    expect(getInvoiceStatusProps('PARTIAL')).toMatchObject({
      label: 'Partial',
      className: 'bg-amber-100 text-amber-800',
    })
  })

  it('returns correct props for journal entry statuses', () => {
    expect(getJournalEntryStatusProps('DRAFT')).toMatchObject({
      label: 'Draft',
      className: 'bg-slate-100 text-slate-800',
    })
    expect(getJournalEntryStatusProps('POSTED')).toMatchObject({
      label: 'Posted',
      className: 'bg-emerald-100 text-emerald-800',
    })
    expect(getJournalEntryStatusProps('VOID')).toMatchObject({
      label: 'Void',
      className: 'bg-red-100 text-red-800',
    })
  })

  it('returns correct props for payment statuses', () => {
    expect(getPaymentStatusProps('PENDING')).toMatchObject({
      label: 'Pending',
      className: 'bg-amber-100 text-amber-800',
    })
    expect(getPaymentStatusProps('COMPLETED')).toMatchObject({
      label: 'Completed',
      className: 'bg-emerald-100 text-emerald-800',
    })
    expect(getPaymentStatusProps('FAILED')).toMatchObject({
      label: 'Failed',
      className: 'bg-red-100 text-red-800',
    })
    expect(getPaymentStatusProps('REFUNDED')).toMatchObject({
      label: 'Refunded',
      className: 'bg-slate-100 text-slate-800',
    })
  })

  it('falls back gracefully for unknown statuses', () => {
    expect(getInvoiceStatusProps('UNKNOWN')).toMatchObject({
      label: 'Unknown',
      className: 'bg-slate-100 text-slate-800',
    })
    expect(getJournalEntryStatusProps('UNKNOWN')).toMatchObject({
      label: 'Unknown',
      className: 'bg-slate-100 text-slate-800',
    })
    expect(getPaymentStatusProps('UNKNOWN')).toMatchObject({
      label: 'Unknown',
      className: 'bg-slate-100 text-slate-800',
    })
  })

  it('renders StatusBadge with design system classes and correct text', () => {
    render(<StatusBadge status="SENT" domain="invoice" />)
    const badge = screen.getByText('Sent')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('px-2.5', 'py-0.5', 'rounded-full', 'text-xs', 'font-medium')
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
  })
})
