'use client'

import React, { ReactNode } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/format'
import { fmtDate } from './_helpers'

export type DetailValueType = 'text' | 'currency' | 'date' | 'badge'

export interface DetailRow {
  label: string
  value: string | number | null | undefined
  type?: DetailValueType
  badgeColor?: 'green' | 'blue' | 'amber' | 'red' | 'gray'
  currencyCode?: string
}

export interface DetailTable {
  headers: string[]
  rows: Array<Array<string | number | null | undefined>>
  emptyMessage?: string
}

export interface DetailSection {
  title: string
  rows?: DetailRow[]
  table?: DetailTable
  fullWidth?: boolean
}

export interface DetailAction {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'primary' | 'danger' | 'default' | 'secondary' | 'success' | 'warning'
  disabled?: boolean
}

export interface ExpenseDetailLayoutProps {
  title: string
  subtitle?: string
  status?: string
  statusColor?: 'green' | 'blue' | 'amber' | 'red' | 'gray'
  metadata?: Array<{ label: string; value: string }>
  sections: DetailSection[]
  actions?: DetailAction[]
  backUrl: string
  backLabel?: string
  loading?: boolean
  error?: string | null
}

const ACTION_STYLES: Record<string, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent',
  warning: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 border-transparent',
  default: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200',
}

export default function ExpenseDetailLayout({
  title,
  subtitle,
  status,
  statusColor = 'gray',
  metadata,
  sections,
  actions,
  backUrl,
  backLabel = 'Back',
  loading,
  error,
}: ExpenseDetailLayoutProps) {
  const router = useRouter()

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push(backUrl)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
            <ArrowLeft size={16} /> {backLabel}
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {status && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                statusColor === 'green' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                statusColor === 'blue' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                statusColor === 'amber' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                statusColor === 'red' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>{status}</span>
            )}
            {metadata?.map((item) => (
              <span key={item.label} className="text-xs text-slate-500 bg-slate-50 rounded-full px-3 py-1 border border-slate-200">
                {item.label}: {item.value}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actions?.map((action) => (
              <button
                type="button"
                key={action.label}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${ACTION_STYLES[action.variant ?? 'default']} ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Loading bill details…</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">{error}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className={`${section.fullWidth ? 'sm:col-span-2' : ''} rounded-2xl border border-slate-200 bg-white p-6`}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 mb-4">{section.title}</h2>
              {section.rows && (
                <div className="grid gap-3">
                  {section.rows.map((row) => {
                    let display = '—'
                    if (row.value !== null && row.value !== undefined && row.value !== '') {
                      switch (row.type) {
                        case 'currency':
                          display = formatCurrency(Number(row.value), row.currencyCode ?? undefined)
                          break
                        case 'date':
                          display = fmtDate(String(row.value))
                          break
                        case 'badge':
                          display = String(row.value)
                          break
                        default:
                          display = String(row.value)
                      }
                    }
                    return (
                      <div key={row.label} className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400 uppercase tracking-[0.16em]">{row.label}</span>
                        {row.type === 'badge' ? (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${row.badgeColor === 'green' ? 'bg-emerald-100 text-emerald-700' : row.badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' : row.badgeColor === 'amber' ? 'bg-amber-100 text-amber-700' : row.badgeColor === 'red' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                            {display}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-700">{display}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {section.table && (() => {
                const table = section.table!
                return (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0 text-sm text-left">
                      <thead>
                        <tr>
                          {table.headers.map((header) => (
                            <th key={header} className="border-b border-slate-200 px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.length === 0 ? (
                          <tr>
                            <td colSpan={table.headers.length} className="px-3 py-4 text-sm text-slate-500">
                              {table.emptyMessage ?? 'No records available.'}
                            </td>
                          </tr>
                        ) : (
                          table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex < table.rows.length - 1 ? 'border-b border-slate-100' : ''}>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className={`px-3 py-3 align-top text-slate-700 ${typeof cell === 'number' ? 'tabular-nums text-right' : ''}`}>{cell ?? '—'}</td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
