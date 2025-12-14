"use client"
import { useEffect, useState, useCallback, useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import HelpPopover from '@/components/HelpPopover'
import { formatMMDDYYYY } from '@/lib/date'
import { api } from '@/lib/api'
import { useToast } from '@/components/ToastProvider'
import { useCurrency } from '@/components/CurrencyProvider'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'

interface UndepositedPayment { id: string; invoiceId: string; invoiceNumber: string; customerId: string; customer: string; amount: number; date: string }
interface DepositRow { id: string; date: string; total: number; paymentCount: number; depositToAccount?: { number: string; name: string }; voidedAt?: string }

type Account = { id: string; number: string; name: string; type: string }

const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })

function DepositsPageInner() {
  const { formatCurrency } = useCurrency()
  const [undeposited, setUndeposited] = useState<UndepositedPayment[]>([])
  const [deposits, setDeposits] = useState<DepositRow[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountNumber, setAccountNumber] = useState<string>('1000')
  const [memo, setMemo] = useState<string>('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [depositDate, setDepositDate] = useState<string>(new Date().toISOString().slice(0,10))
  const { push } = useToast()
  const role = getRoleFromCookies()
  const canWrite = hasPermission(role, 'invoices:write')
  const [closedThrough, setClosedThrough] = useState<string | null>(null)
  const [voidingId, setVoidingId] = useState<string | null>(null)

  // Recent deposits filters
  const [depAccountFilter, setDepAccountFilter] = useState<string>('all')
  const [depFrom, setDepFrom] = useState<string>('')
  const [depTo, setDepTo] = useState<string>('')

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const up = await api<{ payments: UndepositedPayment[] }>('/api/undeposited-payments')
      setUndeposited(up.payments)
      const deps = await api<{ deposits: DepositRow[] }>('/api/deposits')
      setDeposits(deps.deposits)
      // Load asset accounts for deposit target selection
      const acc = await api<{ accounts: Account[] }>('/api/accounts')
      const assets = (acc.accounts || []).filter(a => a.type === 'Asset' && a.number !== '1010')
      setAccounts(assets)
      if (!assets.some(a => a.number === accountNumber)) {
        const fallback = assets.find(a => a.number === '1000')?.number || assets[0]?.number
        if (fallback) setAccountNumber(fallback)
      }
      // Prune selections that no longer exist
      setSelected(prev => new Set(Array.from(prev).filter(id => up.payments.some(p => p.id === id))))
    } catch (e: any) {
      push({ type: 'error', message: e?.message || 'Failed to load deposits data' })
    } finally {
      setLoading(false)
    }
  }, [push, accountNumber])

  useEffect(()=> { void loadAll() }, [loadAll])

  // Load closed-through date for client-side feedback; ignore if forbidden
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await api<{ closedThrough: string | null }>('/api/periods')
        if (!active) return
        setClosedThrough(res.closedThrough || null)
      } catch {
        // Best-effort; server will still enforce closed periods
      }
    })()
    return () => { active = false }
  }, [])

  function toggle(id: string) {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }
  function toggleAll() {
    if (selected.size === undeposited.length) setSelected(new Set())
    else setSelected(new Set(undeposited.map(p=>p.id)))
  }

  async function createDeposit() {
    const ids = Array.from(selected)
    if (!ids.length) return
    const date = depositDate && /\d{4}-\d{2}-\d{2}/.test(depositDate) ? depositDate : new Date().toISOString().slice(0,10)
    setCreating(true)
    try {
  await api('/api/deposits', { method: 'POST', body: JSON.stringify({ paymentIds: ids, date, accountNumber, memo: memo?.trim() || undefined }) })
      push({ type: 'success', message: `Deposit created (${ids.length} payments)` })
      setSelected(new Set())
      await loadAll()
    } catch (e: any) {
      push({ type: 'error', message: e?.message || 'Failed to create deposit' })
    } finally {
      setCreating(false)
    }
  }

  const totalSelected = undeposited.filter(p => selected.has(p.id)).reduce((s,p)=>s+p.amount,0)
  const dateIsAllowed = useMemo(() => {
    if (!depositDate) return true
    if (!closedThrough) return true
    try {
      const d = new Date(depositDate + 'T00:00:00Z').getTime()
      const c = new Date(closedThrough + 'T00:00:00Z').getTime()
      if (isNaN(d) || isNaN(c)) return true
      return d > c
    } catch { return true }
  }, [depositDate, closedThrough])

  const filteredDeposits = useMemo(() => {
    let rows = deposits.slice()
    if (depAccountFilter !== 'all') {
      rows = rows.filter(d => d.depositToAccount?.number === depAccountFilter)
    }
    if (depFrom) rows = rows.filter(d => d.date >= depFrom)
    if (depTo) rows = rows.filter(d => d.date <= depTo)
    return rows
  }, [deposits, depAccountFilter, depFrom, depTo])

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900">Deposits</h1>
          <p className="text-slate-600 text-xs">Group undeposited customer payments into bank deposits.</p>
        </header>
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-800">Undeposited Payments</h2>
              <HelpPopover ariaLabel="About Undeposited Funds" buttonAriaLabel="Show info about Undeposited Funds" storageKey="deposits-udf-help">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">About Undeposited Funds</h3>
                  <p className="text-xs text-slate-700">Use this holding account to group individual customer payments into a single bank deposit that matches your bank activity.</p>
                  <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                    <li>Select one or more payments and choose a target account in “Deposit to”.</li>
                    <li>Posting a deposit moves money from the holding account to the selected asset account.</li>
                    <li>Voids and partial edits automatically post adjusting journals and return payments to the holding account when applicable.</li>
                  </ul>
                </div>
              </HelpPopover>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1">
                <span className="text-slate-600">Deposit to</span>
                <select aria-label="Deposit to account" value={accountNumber} onChange={(e)=>setAccountNumber(e.target.value)} className="input !py-1 !px-2">
                  {accounts.map(a => (
                    <option key={a.id} value={a.number}>{a.number} · {a.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1">
                <span className="text-slate-600">Deposit date</span>
                <input aria-label="Deposit date" type="date" value={depositDate} onChange={(e)=>setDepositDate(e.target.value)} className="input !py-1 !px-2 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100" />
              </label>
              {closedThrough && (
                <div className={`text-[11px] ${dateIsAllowed ? 'text-slate-500' : 'text-rose-700'}`} aria-live="polite">
                  Closed through {formatMMDDYYYY(closedThrough)}{!dateIsAllowed ? ' • choose a later date' : ''}
                </div>
              )}
              <label className="flex items-center gap-1">
                <span className="text-slate-600">Memo</span>
                <input aria-label="Deposit memo" type="text" value={memo} onChange={(e)=>setMemo(e.target.value)} placeholder="Optional description" className="input !py-1 !px-2 w-56" />
              </label>
              <button className="btn-tertiary !py-1 !px-2" onClick={loadAll} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
              <button className="btn-secondary !py-1 !px-2" disabled={!selected.size || creating || !canWrite || !dateIsAllowed} onClick={createDeposit}>{creating ? 'Creating…' : 'Create Deposit'}</button>
            </div>
          </div>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2"><input aria-label="Select all" type="checkbox" checked={selected.size===undeposited.length && undeposited.length>0} onChange={toggleAll} /></th>
                  <th className="text-left font-medium px-3 py-2">Invoice</th>
                  <th className="text-left font-medium px-3 py-2">Customer</th>
                  <th className="text-right font-medium px-3 py-2">Amount</th>
                  <th className="text-left font-medium px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {undeposited.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2"><input aria-label={`Select payment ${p.id}`} type="checkbox" checked={selected.has(p.id)} onChange={()=>toggle(p.id)} /></td>
                    <td className="px-3 py-2 text-sky-700"><a className="hover:underline" href={`/invoices/${p.invoiceId}?from=/sales/deposits`}>{p.invoiceNumber}</a></td>
                    <td className="px-3 py-2">{p.customer}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums"><Amount value={p.amount} /></td>
                    <td className="px-3 py-2 text-xs">{formatMMDDYYYY(p.date)}</td>
                  </tr>
                ))}
                {!undeposited.length && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-500">No undeposited payments</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div><strong>{selected.size}</strong> selected</div>
            <div>Total selected: <span className="font-mono tabular-nums"><Amount value={totalSelected} /></span></div>
          </div>
        </section>
        {!canWrite && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 text-slate-600 p-3 text-xs">
            You have read-only access. Deposit creation is disabled for your role.
          </div>
        )}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Recent Deposits</h2>
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1">
                <span className="text-slate-600">Account</span>
                <select aria-label="Filter deposits by account" value={depAccountFilter} onChange={(e)=>setDepAccountFilter(e.target.value)} className="input !py-1 !px-2">
                  <option value="all">All</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.number}>{a.number} · {a.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1">
                <span className="text-slate-600">From</span>
                <input aria-label="Filter from date" type="date" value={depFrom} onChange={(e)=>setDepFrom(e.target.value)} className="input !py-1 !px-2 w-36" />
              </label>
              <label className="flex items-center gap-1">
                <span className="text-slate-600">To</span>
                <input aria-label="Filter to date" type="date" value={depTo} onChange={(e)=>setDepTo(e.target.value)} className="input !py-1 !px-2 w-36" />
              </label>
              <ExportCsvButton exportPath="/api/deposits/export" />
              <PrintButton />
            </div>
          </div>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-3 py-2">Date</th>
                  <th className="text-left font-medium px-3 py-2">Deposit #</th>
                  <th className="text-left font-medium px-3 py-2">Deposit to</th>
                  <th className="text-right font-medium px-3 py-2">Payments</th>
                  <th className="text-right font-medium px-3 py-2">Total</th>
                  <th className="text-right font-medium px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.map(d => (
                  <tr key={d.id} className="border-t">
                    <td className="px-3 py-2 text-xs">{formatMMDDYYYY(d.date)}</td>
                    <td className="px-3 py-2">
                      <a href={`/sales/deposits/${d.id}`} className="text-sky-700 hover:underline">{d.id}</a>
                      {d.voidedAt && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] uppercase tracking-wide">Voided</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{d.depositToAccount ? `${d.depositToAccount.number} · ${d.depositToAccount.name}` : '—'}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{d.paymentCount}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums"><Amount value={d.total} /></td>
                    <td className="px-3 py-2 text-right">
                      <button
                        className="btn-tertiary !py-1 !px-2"
                        disabled={!canWrite || !!d.voidedAt || voidingId === d.id}
                        onClick={async () => {
                          if (!canWrite || d.voidedAt) return
                          const ok = confirm('Void this deposit? Payments will return to Undeposited Funds and a reversing entry will be posted.')
                          if (!ok) return
                          try {
                            setVoidingId(d.id)
                            await api(`/api/deposits/${d.id}/void`, { method: 'DELETE' })
                            push({ type: 'success', message: 'Deposit voided' })
                            await loadAll()
                          } catch (e: any) {
                            push({ type: 'error', message: e?.message || 'Failed to void deposit' })
                          } finally {
                            setVoidingId(null)
                          }
                        }}
                      >{voidingId === d.id ? 'Voiding…' : 'Void'}</button>
                    </td>
                  </tr>
                ))}
                {!filteredDeposits.length && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-slate-500">No deposits yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function DepositsPage() {
  return (
    <Suspense fallback={<div className="glass-card" aria-busy="true">Loading…</div>}>
      <DepositsPageInner />
    </Suspense>
  )
}
