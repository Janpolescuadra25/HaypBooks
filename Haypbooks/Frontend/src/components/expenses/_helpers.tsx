'use client'

import React from 'react'

// ─── Date formatter ──────────────────────────────────────────────────────────
export function fmtDate(d: string): string {
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
const STATUS_STYLES: Record<string, string> = {
  DRAFT:           'bg-gray-50 text-gray-700 border-gray-200',
  PENDING:         'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE:          'bg-emerald-50 text-emerald-700 border-emerald-200',
  APPROVED:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAID:            'bg-emerald-50 text-emerald-700 border-emerald-200',
  MATCHED:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  APPLIED:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  RECEIVED:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  REIMBURSED:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  AWARDED:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  SUBMITTED:       'bg-blue-50 text-blue-700 border-blue-200',
  SENT:            'bg-blue-50 text-blue-700 border-blue-200',
  ORDERED:         'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING:      'bg-blue-50 text-blue-700 border-blue-200',
  OPEN:            'bg-blue-50 text-blue-700 border-blue-200',
  ATTACHED:        'bg-purple-50 text-purple-700 border-purple-200',
  PARTIALLY_PAID:  'bg-amber-50 text-amber-700 border-amber-200',
  PARTIALLY_USED:  'bg-amber-50 text-amber-700 border-amber-200',
  PAUSED:          'bg-amber-50 text-amber-700 border-amber-200',
  UNMATCHED:       'bg-orange-50 text-orange-700 border-orange-200',
  REJECTED:        'bg-red-50 text-red-700 border-red-200',
  FAILED:          'bg-red-50 text-red-700 border-red-200',
  OVERDUE:         'bg-red-50 text-red-700 border-red-200',
  CANCELLED:       'bg-gray-100 text-gray-500 border-gray-300',
  CANCELED:        'bg-gray-100 text-gray-500 border-gray-300',
  VOIDED:          'bg-gray-100 text-gray-500 border-gray-300',
  VOID:            'bg-gray-100 text-gray-500 border-gray-300',
  INACTIVE:        'bg-gray-100 text-gray-500 border-gray-300',
  ENDED:           'bg-gray-100 text-gray-500 border-gray-300',
  CLOSED:          'bg-gray-100 text-gray-500 border-gray-300',
}

export function StatusPill({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ')
  const style = STATUS_STYLES[status] ?? 'bg-gray-50 text-gray-700 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border whitespace-nowrap ${style}`}>
      {label}
    </span>
  )
}
