'use client'
import { Suspense, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { DataTable } from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import Link from 'next/link'
import type { Route } from 'next'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { usePathname, useSearchParams } from 'next/navigation'
import SalesNav from '@/components/SalesNav'
import { formatMMDDYYYY } from '@/lib/date'
import { useCurrency } from '@/components/CurrencyProvider'
import InvoicesFilters from '@/components/InvoicesFilters'
import ActiveFilterBar from '@/components/ActiveFilterBar'
import InvoicesPager from '@/components/InvoicesPager'
import Notice from '@/components/Notice'
import { useToast } from '@/components/ToastProvider'
import RecordCustomerPaymentModal from '@/components/RecordCustomerPaymentModal'

type Invoice = { id: string; number: string; customer: string; status: string; total: number; date: string; balance?: number; daysPastDue?: number }
type AgingTotals = { current: number; 30: number; 60: number; 90: number; '120+': number; total: number }

function InvoicesContent() {
  const { formatCurrency } = useCurrency()
  const pathname = usePathname()
  const showLocalNav = !(pathname || '').startsWith('/sales')
  const [rows, setRows] = useState<Invoice[]>([])
  const [error, setError] = useState<string | null>(null)
  const [canCreate, setCanCreate] = useState(false)
  // Selection state for batch reminders
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sendingBatch, setSendingBatch] = useState(false)
  const { push } = useToast()
  const sp = useSearchParams()
  const start = sp.get('start') || ''
  const end = sp.get('end') || ''
  const status = sp.get('status') || ''
  const tag = sp.get('tag') || ''
  const from = sp.get('from') || ''
  const page = parseInt(sp.get('page') || '1')
  const limit = parseInt(sp.get('limit') || '20')
  const [total, setTotal] = useState<number | undefined>(undefined)
  const [respPage, setRespPage] = useState<number | undefined>(undefined)
  const [respLimit, setRespLimit] = useState<number | undefined>(undefined)
  const [arAsOf, setArAsOf] = useState<string | null>(null)
  const [arTotals, setArTotals] = useState<AgingTotals | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const aging = sp.get('aging') || ''

  useEffect(() => {
    const qs = new URLSearchParams()
    if (start) qs.set('start', start)
    if (end) qs.set('end', end)
    if (status) qs.set('status', status)
    if (tag) qs.set('tag', tag)
    if (aging) qs.set('aging', aging)
    qs.set('page', String(page))
    qs.set('limit', String(limit))
    api<{ invoices: Invoice[]; total?: number; page?: number; limit?: number }>(`/api/invoices${qs.toString() ? `?${qs.toString()}` : ''}`)
      .then((d) => {
        setRows(d.invoices)
        setTotal(d.total)
        setRespPage(d.page)
        setRespLimit(d.limit)
        // Remove selections that are no longer present on this page
        setSelected(prev => {
          const next = new Set<string>()
            ;(d.invoices || []).forEach(inv => { if (prev.has(inv.id)) next.add(inv.id) })
          return next
        })
      })
      .catch((e) => setError(e.message))
  }, [start, end, status, tag, aging, page, limit])

  useEffect(() => {
    // Fetch user profile to determine permissions client-side
    let alive = true
    fetch('/api/user/profile', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load profile')))
      .then((p) => {
        if (!alive) return
        const perms: string[] = Array.isArray(p?.permissions) ? p.permissions : []
        setCanCreate(perms.includes('invoices:write'))
      })
      .catch(() => { /* noop: keep default false */ })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    // Fetch A/R aging summary (respect end filter) for the summary card
    const qs = new URLSearchParams()
    qs.set('period', 'YTD')
    if (end) qs.set('end', end)
    api<{ period: string; asOf: string; totals: AgingTotals }>(`/api/reports/ar-aging?${qs.toString()}`)
      .then((d) => {
        setArAsOf(d.asOf)
        setArTotals(d.totals)
      })
      .catch(() => { /* ignore card errors */ })
  }, [end])

  function QuickPayCell({ row }: { row: Invoice }) {
    const { push } = useToast()
    const { formatCurrency } = useCurrency()
    const [amount, setAmount] = useState<string>(
      typeof row.balance === 'number' && row.balance > 0 ? String(Number(row.balance).toFixed(2)) : ''
    )
    const [submitting, setSubmitting] = useState(false)
    const disabled = submitting || !canCreate || row.status === 'paid' || (row.balance ?? 0) <= 0

    async function onSubmit(e: React.FormEvent) {
      e.preventDefault()
      const n = Number(amount)
      if (!n || n <= 0) return
      try {
        setSubmitting(true)
        const res = await api<{ invoice: { id: string; status: string; balance?: number } }>(
          `/api/invoices/${row.id}/payments`,
          { method: 'POST', body: JSON.stringify({ amount: n }) }
        )
        const updated = res.invoice
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: updated.status, balance: updated.balance } : r))
        push({ type: 'success', message: `Payment recorded (${formatCurrency(n)})` })
      } catch (e: any) {
        const msg = e?.message || 'Failed to record payment'
        setError(msg)
        push({ type: 'error', message: msg })
      } finally {
        setSubmitting(false)
      }
    }

    if (row.status === 'paid') return <span className="text-xs text-emerald-700">Paid</span>
    if ((row.balance ?? 0) <= 0) return <span className="text-xs text-slate-500">—</span>

    return (
      <form onSubmit={onSubmit} className="inline-flex items-center gap-2">
        <label className="sr-only" htmlFor={`qp-${row.id}`}>Payment amount</label>
        <input
          id={`qp-${row.id}`}
          type="number"
          step="0.01"
          min={0.01}
          max={Math.max(0.01, Number(row.balance || 0))}
          value={amount}
          onChange={(e) => setAmount(e.currentTarget.value)}
          className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-right tabular-nums font-mono"
          placeholder="Amount"
          disabled={disabled}
        />
        {row.balance && row.balance > 0 && (
          <button
            type="button"
            onClick={() => setAmount(Number(row.balance || 0).toFixed(2))}
            className="btn-tertiary !px-2 !py-1 text-xs"
            disabled={disabled}
            title="Fill full remaining balance"
          >Pay remaining</button>
        )}
        <button type="submit" className="btn-secondary !px-2 !py-1 text-xs" disabled={disabled}>
          {submitting ? 'Saving…' : 'Record'}
        </button>
      </form>
    )
  }

  function ReminderButton({ row }: { row: Invoice }) {
    const { push } = useToast()
    const [sending, setSending] = useState(false)
    const disabled = sending || !canCreate || row.status === 'paid'
    async function onClick() {
      try {
        setSending(true)
        const res = await api<{ ok: boolean; invoice: { id: string }; message?: string }>(`/api/invoices/${row.id}/remind`, { method: 'POST' })
        if (res.ok) {
          push({ type: 'success', message: 'Reminder sent' })
        } else {
          push({ type: 'error', message: res.message || 'Reminder throttled' })
        }
      } catch (e: any) {
        const msg = e?.message || 'Failed to send reminder'
        setError(msg)
        push({ type: 'error', message: msg })
      } finally {
        setSending(false)
      }
    }
    if (disabled) return null
    return (
      <button onClick={onClick} className="btn-tertiary !px-2 !py-1 text-xs" disabled={sending} title="Send payment reminder">
        {sending ? 'Sending…' : 'Send reminder'}
      </button>
    )
  }

  // Batch reminder handling
  async function sendBatchReminders() {
    const ids = Array.from(selected)
    if (!ids.length) return
    try {
      setSendingBatch(true)
      const res = await api<{ results: { id: string; ok: boolean; message?: string }[] }>(
        '/api/invoices/reminders',
        { method: 'POST', body: JSON.stringify({ ids }) }
      )
      const successes = res.results.filter(r => r.ok).map(r => r.id)
      const failures = res.results.filter(r => !r.ok)
      if (successes.length) {
        push({ type: 'success', message: `Reminders sent: ${successes.length}` })
      }
      if (failures.length) {
        push({ type: 'error', message: `Failed: ${failures.length}` })
      }
      // Keep only failures selected so user can retry easily
      setSelected(new Set(failures.map(f => f.id)))
    } catch (e: any) {
      push({ type: 'error', message: e?.message || 'Batch reminder failed' })
    } finally {
      setSendingBatch(false)
    }
  }

  function toggleRow(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function handleToggleRow(id: string, isSelected: boolean) {
    setSelected(prev => {
      const next = new Set(prev)
      if (isSelected) next.add(id); else next.delete(id)
      return next
    })
  }

  function handleToggleAll(isSelected: boolean, ids: string[]) {
    setSelected(prev => {
      const next = new Set(prev)
      if (isSelected) ids.forEach(id => next.add(id))
      else ids.forEach(id => next.delete(id))
      return next
    })
  }

  return (
    <div className="space-y-2">
      {/* Sub-navigation: if we're under /sales, layout renders it; otherwise show local SalesNav for direct /invoices route. */}
      {showLocalNav && (
        <div className="glass-card print:hidden px-3 md:px-4 py-1.5 md:py-2">
          <SalesNav activeHref="/sales/invoices" />
        </div>
      )}

      <div className="glass-card space-y-5">
      {arTotals && (
        <div className="glass-card !p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Receivables Aging Summary</h2>
              <p className="text-xs text-slate-600">{arAsOf ? formatMMDDYYYY(arAsOf) : ''}</p>
            </div>
            <Link href={'/reports/ar-aging?from=/invoices' as Route} className="btn-secondary" aria-label="Open receivables aging report" title="Open detailed receivables aging report">Open Report</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['current','30','60','90','120+'] as const).map((k) => {
              const q = new URLSearchParams()
              if (k !== 'current') q.set('aging', k)
              const active = (aging || 'current') === k
              return (
                <a
                  key={k}
                  href={`/invoices?${q.toString()}`}
                  className={`rounded-xl border p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${active ? 'bg-sky-50 border-sky-300 shadow-inner' : 'bg-white border-slate-200 hover:border-sky-300'}`}
                  aria-current={active ? 'true' : undefined}
                  aria-label={`Filter invoices by ${k === 'current' ? 'current' : k + ' day'} bucket`}
                >
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span>{k === 'current' ? 'Current' : `${k} days`}</span>
                    {active && <span className="text-[10px] uppercase text-sky-700 font-semibold tracking-wide">Active</span>}
                  </div>
                  <div className="text-sm font-medium tabular-nums">{formatCurrency(Number((arTotals as any)?.[k] || 0))}</div>
                </a>
              )
            })}
          </div>
          <div className="mt-2 text-right text-sm text-slate-900">
            <span className="font-medium">Total</span>
            <span className="ml-2 tabular-nums">{formatCurrency(Number(arTotals.total || 0))}</span>
          </div>
        </div>
      )}

  <div className="glass-card print:hidden overflow-x-auto !p-4">
        <div className="flex items-end gap-2 whitespace-nowrap text-sm">
          <div className="min-w-0 grow">
            <Suspense fallback={null}><InvoicesFilters /></Suspense>
          </div>
          <div className="flex items-center gap-1.5">
            <ExportCsvButton exportPath="/api/invoices/export" />
            <PrintButton />
            <Link href={'/activity/invoice' as Route} className="btn-secondary !px-2 !py-1 text-xs" aria-label="View invoice activity">Activity</Link>
            {canCreate && (<Link href={'/invoices/new' as Route} className="btn-primary !px-2 !py-1 text-xs">New Invoice</Link>)}
          </div>
        </div>
      </div>
  <ActiveFilterBar slug="list:invoices" />

      {error ? (
        <div className="glass-card text-red-600">{error}</div>
      ) : (
  <div className="glass-card !p-4">
          <DataTable<Invoice>
            keyField="id"
            selectableRows={canCreate}
            selectedKeys={Array.from(selected)}
            onToggleRow={(key, isSel) => handleToggleRow(String(key), isSel)}
            onToggleAll={(isSel, keys) => handleToggleAll(isSel, keys.map(k => String(k)))}
            columns={[
              { key: 'number', header: 'Invoice #', render: (_: any, row: Invoice) => <Link className="text-sky-700 hover:underline" href={`/invoices/${row.id}?from=/invoices` as Route}>{row.number}</Link> },
              { key: 'customer', header: 'Customer', hideBelow: 'sm', cellClassName: 'inline-block max-w-[16ch] truncate align-top' },
              { key: 'date', header: 'Date', hideBelow: 'md', render: (v) => formatMMDDYYYY(String(v)) },
              { key: 'daysPastDue', header: 'Days Past Due', hideBelow: 'lg', align: 'right', cellClassName: 'tabular-nums font-mono', render: (v, row: Invoice) => row.status === 'paid' ? '—' : (typeof row.daysPastDue === 'number' ? row.daysPastDue : '—') },
              { key: 'status', header: 'Status', render: (v) => <StatusBadge value={String(v)} /> },
              { key: 'total', header: 'Total', align: 'right', cellClassName: 'tabular-nums font-mono', render: (v) => formatCurrency(v as number) },
              { key: 'balance', header: 'Balance', hideBelow: 'md', align: 'right', cellClassName: 'tabular-nums font-mono', render: (v) => formatCurrency(Number(v || 0)) },
              { key: 'actions' as any, header: 'Actions', hideBelow: 'md', render: (_: any, row: Invoice) => (
                canCreate ? (
                  <div className="flex items-center gap-2">
                    <QuickPayCell row={row} />
                    <ReminderButton row={row} />
                  </div>
                ) : null
              ) },
            ]}
            rows={rows}
          />
          {canCreate && selected.size > 0 && (
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
              <div className="text-sm text-slate-700">
                <strong>{selected.size}</strong> selected
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary !px-3 !py-1 text-sm"
                  onClick={() => setShowPaymentModal(true)}
                  title="Record payment across selected invoices"
                >Record Payment…</button>
                <button
                  type="button"
                  className="btn-secondary !px-3 !py-1 text-sm"
                  disabled={sendingBatch}
                  onClick={sendBatchReminders}
                >
                  {sendingBatch ? 'Sending…' : 'Send Reminders'}
                </button>
                <button
                  type="button"
                  className="btn-tertiary !px-3 !py-1 text-xs"
                  onClick={() => setSelected(new Set())}
                  disabled={sendingBatch}
                >Clear</button>
              </div>
            </div>
          )}
          {showPaymentModal && (() => {
            const selIds = new Set(selected)
            const selectedInvoices = rows.filter(r => selIds.has(r.id)) as (Invoice & { customerId?: string })[]
            const customerIds = Array.from(new Set(selectedInvoices.map(r => (r as any).customerId).filter(Boolean)))
            if (customerIds.length !== 1) {
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="alertdialog" aria-modal="true" aria-label="Cannot record multi-customer payment">
                  <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full space-y-4">
                    <h2 className="text-base font-semibold">Select invoices for a single customer</h2>
                    <p className="text-sm text-slate-600">Multi-invoice payments can only be recorded when all selected invoices belong to the same customer. Deselect invoices from other customers and try again.</p>
                    <div className="flex justify-end gap-2">
                      <button className="btn" onClick={() => setShowPaymentModal(false)}>Close</button>
                    </div>
                  </div>
                </div>
              )
            }
            const customerId = customerIds[0] as string
            const customerName = selectedInvoices[0]?.customer || 'Customer'
            const openInvoices = selectedInvoices.filter(inv => (inv.balance ?? 0) > 0).map(inv => ({ id: inv.id, number: inv.number, balance: Number(inv.balance||0) }))
            return (
              <RecordCustomerPaymentModal
                customerId={customerId}
                customerName={customerName}
                invoices={openInvoices}
                onClose={() => setShowPaymentModal(false)}
                onApplied={(updated, cp) => {
                  setRows(prev => prev.map(r => {
                    const u = updated.find(i => i.id === r.id)
                    return u ? { ...r, balance: u.balance, status: u.status } : r
                  }))
                  setShowPaymentModal(false)
                  setSelected(prev => {
                    const next = new Set(prev)
                    updated.forEach(u => { if (u.balance <= 0) next.delete(u.id) })
                    return next
                  })
                }}
              />
            )
          })()}
          <InvoicesPager page={respPage ?? page} limit={respLimit ?? limit} total={total} />
        </div>
      )}
      </div>
    </div>
  )
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={null}>
      <>
        <Notice />
        <InvoicesContent />
      </>
    </Suspense>
  )
}
