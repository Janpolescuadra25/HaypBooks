'use client'

import React from 'react'

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

export function csvDownload(filename: string, headers: string[], rows: string[][]): void {
  const lines = [headers, ...rows].map(row =>
    row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
  )
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  VOID: 'Voided',
  VOIDED: 'Voided',
  DUE_SOON: 'Due Soon',
  PENDING_APPROVAL: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  SENT: 'bg-blue-100 text-blue-700 border-blue-200',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  OVERDUE: 'bg-red-100 text-red-700 border-red-200',
  VOID: 'bg-gray-200 text-gray-500 border-gray-300',
  VOIDED: 'bg-gray-200 text-gray-500 border-gray-300',
  DUE_SOON: 'bg-amber-100 text-amber-700 border-amber-200',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-200 text-gray-500 border-gray-300',
}

export function StatusPill({ status }: { status: string }) {
  const normalized = String(status ?? 'DRAFT').toUpperCase()
  const label = STATUS_LABELS[normalized] ?? normalized.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, t => t.toUpperCase())
  const style = STATUS_STYLES[normalized] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  const isVoided = normalized === 'VOIDED' || normalized === 'VOID'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border whitespace-nowrap ${style} ${isVoided ? 'line-through' : ''}`}>
      {label}
    </span>
  )
}
