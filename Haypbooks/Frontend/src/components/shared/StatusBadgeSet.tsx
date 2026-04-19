'use client'

import { Badge } from '@/components/ui/badge'

type StatusDomain = 'invoice' | 'journal-entry' | 'payment' | 'customer'

interface StatusProps {
  label: string
  className: string
}

const STATUS_CLASSES = {
  slate: 'bg-slate-100 text-slate-800',
  blue: 'bg-blue-100 text-blue-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  red: 'bg-red-100 text-red-800',
  amber: 'bg-amber-100 text-amber-800',
  destructive: 'bg-red-100 text-red-800',
} as const

const BASE_CLASSES = 'px-2.5 py-0.5 rounded-full text-xs font-medium'

function normalizeStatus(value?: string): string {
  return String(value ?? '').trim().toUpperCase()
}

function formatLabel(status: string): string {
  if (!status) return 'Unknown'
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

export function getInvoiceStatusProps(status: string): StatusProps {
  const normalized = normalizeStatus(status)

  switch (normalized) {
    case 'DRAFT':
      return { label: 'Draft', className: STATUS_CLASSES.slate }
    case 'SENT':
      return { label: 'Sent', className: STATUS_CLASSES.blue }
    case 'PAID':
      return { label: 'Paid', className: STATUS_CLASSES.emerald }
    case 'OVERDUE':
      return { label: 'Overdue', className: STATUS_CLASSES.red }
    case 'VOID':
      return { label: 'Void', className: STATUS_CLASSES.destructive }
    case 'PARTIAL':
      return { label: 'Partial', className: STATUS_CLASSES.amber }
    default:
      return { label: formatLabel(normalized), className: STATUS_CLASSES.slate }
  }
}

export function getJournalEntryStatusProps(status: string): StatusProps {
  const normalized = normalizeStatus(status)

  switch (normalized) {
    case 'DRAFT':
      return { label: 'Draft', className: STATUS_CLASSES.slate }
    case 'POSTED':
      return { label: 'Posted', className: STATUS_CLASSES.emerald }
    case 'VOID':
      return { label: 'Void', className: STATUS_CLASSES.red }
    default:
      return { label: formatLabel(normalized), className: STATUS_CLASSES.slate }
  }
}

export function getPaymentStatusProps(status: string): StatusProps {
  const normalized = normalizeStatus(status)

  switch (normalized) {
    case 'PENDING':
      return { label: 'Pending', className: STATUS_CLASSES.amber }
    case 'COMPLETED':
      return { label: 'Completed', className: STATUS_CLASSES.emerald }
    case 'FAILED':
      return { label: 'Failed', className: STATUS_CLASSES.red }
    case 'REFUNDED':
      return { label: 'Refunded', className: STATUS_CLASSES.slate }
    default:
      return { label: formatLabel(normalized), className: STATUS_CLASSES.slate }
  }
}

export function getCustomerStatusProps(status: string): StatusProps {
  const normalized = normalizeStatus(status)

  switch (normalized) {
    case 'ACTIVE':
      return { label: 'Active', className: STATUS_CLASSES.emerald }
    case 'INACTIVE':
      return { label: 'Inactive', className: STATUS_CLASSES.slate }
    default:
      return { label: formatLabel(normalized), className: STATUS_CLASSES.slate }
  }
}

interface StatusBadgeProps {
  status: string
  domain: StatusDomain
  className?: string
}

export function StatusBadge({ status, domain, className = '' }: StatusBadgeProps) {
  const props =
    domain === 'journal-entry'
      ? getJournalEntryStatusProps(status)
      : domain === 'payment'
      ? getPaymentStatusProps(status)
      : domain === 'customer'
      ? getCustomerStatusProps(status)
      : getInvoiceStatusProps(status)

  return (
    <Badge className={`${BASE_CLASSES} ${props.className} ${className}`.trim()}>
      {props.label}
    </Badge>
  )
}
