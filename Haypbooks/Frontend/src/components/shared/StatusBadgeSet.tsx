'use client'

import { Badge } from '@/components/ui/badge'

export type StatusDomain = 'invoice' | 'journal-entry' | 'payment' | 'customer' | 'generic'
export type StatusVariant = 'draft' | 'pending' | 'approved' | 'partial' | 'rejected' | 'overdue'

interface StatusProps {
  label: string
  className: string
}

const STATUS_VARIANT_CLASSES: Record<StatusVariant, string> = {
  draft: 'border-slate-200 bg-slate-50 text-slate-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  partial: 'border-blue-200 bg-blue-50 text-blue-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  overdue: 'border-red-300 bg-red-100 text-red-800 font-semibold',
} as const

const BASE_CLASSES = 'px-2.5 py-0.5 rounded-full text-xs font-medium border'

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

function fromVariant(status: string, variant: StatusVariant): StatusProps {
  return {
    label: formatLabel(normalizeStatus(status)),
    className: STATUS_VARIANT_CLASSES[variant],
  }
}

export function getStatusVariant(status: string): StatusVariant {
  const normalized = normalizeStatus(status)
  const compact = normalized.replace(/[\s_]+/g, '')

  if (compact.includes('OVERDUE')) return 'overdue'
  if (compact.includes('PARTIAL') || compact.includes('INPROGRESS')) return 'partial'
  if (compact.includes('PENDING') || compact.includes('SUBMITTED') || compact.includes('OPEN') || compact.includes('SENT') || compact.includes('ONHOLD')) return 'pending'
  if (compact.includes('APPROVED') || compact.includes('ACTIVE') || compact.includes('PAID') || compact.includes('CONFIRMED') || compact.includes('COMPLETED')) return 'approved'
  if (compact.includes('REJECTED') || compact.includes('VOID') || compact.includes('CLOSED') || compact.includes('ENDED') || compact.includes('FAILED') || compact.includes('CANCELLED')) return 'rejected'
  if (compact.includes('DRAFT') || compact.includes('NEW') || compact.includes('INACTIVE')) return 'draft'
  return 'draft'
}

export function getInvoiceStatusProps(status: string): StatusProps {
  return fromVariant(status, getStatusVariant(status))
}

export function getJournalEntryStatusProps(status: string): StatusProps {
  return fromVariant(status, getStatusVariant(status))
}

export function getPaymentStatusProps(status: string): StatusProps {
  return fromVariant(status, getStatusVariant(status))
}

export function getCustomerStatusProps(status: string): StatusProps {
  return fromVariant(status, getStatusVariant(status))
}

interface StatusBadgeProps {
  status: string
  domain?: StatusDomain
  variant?: StatusVariant
  className?: string
}

export function StatusBadge({ status, domain = 'generic', variant, className = '' }: StatusBadgeProps) {
  const props = variant
    ? fromVariant(status || variant, variant)
    : domain === 'journal-entry'
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
