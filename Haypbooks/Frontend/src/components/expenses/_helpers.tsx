'use client'

import React from 'react'

// ─── Date formatter ──────────────────────────────────────────────────────────
export function fmtDate(d: string | undefined): string {
  if (!d) return '—'
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return d
  }
}

// ─── CSV download ─────────────────────────────────────────────────────────────
export function csvDownload(filename: string, headers: string[], rows: string[][]): void {
  const lines = [headers, ...rows].map(row =>
    row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
  )
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── MenuBtn — single item inside a fixed-position action menu overlay ────────
// Usage: <MenuBtn icon={<Eye size={13}/>} label="View" onClick={...} />
export function MenuBtn({
  icon,
  label,
  onClick,
  danger,
  disabled,
}: {
  icon?: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors disabled:opacity-40 ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-gray-50'
      }`}
    >
      {icon && <span className="shrink-0 opacity-60">{icon}</span>}
      {label}
    </button>
  )
}

// ─── StatusPill ──────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  DRAFT:           'Draft',
  PENDING:         'Pending Approval',
  PENDING_APPROVAL:'Pending Approval',
  APPROVED:        'Approved',
  OPEN:            'Open',
  PAID:            'Paid',
  CLOSED:          'Closed',
  OVERDUE:         'Overdue',
  VOIDED:          'Voided',
  VOID:            'Voided',
  SUBMITTED:       'Submitted',
  REJECTED:        'Rejected',
  FAILED:          'Failed',
  PARTIALLY_PAID:  'Partially Paid',
  PARTIALLY_USED:  'Partially Used',
  ACTIVE:          'Open',
  COMPLETED:       'Closed',
  RECEIVED:        'Open',
  CANCELLED:       'Canceled',
  CANCELED:        'Canceled',
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT:           'bg-gray-100 text-gray-700 border-gray-200',
  PENDING:         'bg-amber-100 text-amber-700 border-amber-200',
  PENDING_APPROVAL:'bg-amber-100 text-amber-700 border-amber-200',
  APPROVED:        'bg-blue-100 text-blue-700 border-blue-200',
  OPEN:            'bg-blue-100 text-blue-700 border-blue-200',
  PAID:            'bg-emerald-100 text-emerald-700 border-emerald-200',
  CLOSED:          'bg-emerald-100 text-emerald-700 border-emerald-200',
  OVERDUE:         'bg-red-100 text-red-700 border-red-200',
  VOIDED:          'bg-gray-200 text-gray-500 border-gray-300',
  VOID:            'bg-gray-200 text-gray-500 border-gray-300',
  SUBMITTED:       'bg-blue-100 text-blue-700 border-blue-200',
  REJECTED:        'bg-red-100 text-red-700 border-red-200',
  FAILED:          'bg-red-100 text-red-700 border-red-200',
  PARTIALLY_PAID:  'bg-amber-100 text-amber-700 border-amber-200',
  PARTIALLY_USED:  'bg-amber-100 text-amber-700 border-amber-200',
  ACTIVE:          'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED:       'bg-emerald-100 text-emerald-700 border-emerald-200',
  RECEIVED:        'bg-blue-100 text-blue-700 border-blue-200',
  CANCELLED:       'bg-gray-100 text-gray-500 border-gray-300',
  CANCELED:        'bg-gray-100 text-gray-500 border-gray-300',
  INACTIVE:        'bg-gray-100 text-gray-500 border-gray-300',
  ENDED:           'bg-gray-100 text-gray-500 border-gray-300',
}

export function StatusPill({ status }: { status: string }) {
  const normalized = String(status ?? 'DRAFT').toUpperCase()
  const label = STATUS_LABELS[normalized] ?? normalized.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (t) => t.toUpperCase())
  const style = STATUS_STYLES[normalized] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  const isVoided = normalized === 'VOIDED' || normalized === 'VOID'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border whitespace-nowrap ${style} ${isVoided ? 'line-through' : ''}`}>
      {label}
    </span>
  )
}
