"use client"
import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { formatMMDDYYYY } from '@/lib/date'
import { api } from '@/lib/api'
import { useToast } from '@/components/ToastProvider'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'

const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })

type DepositPayment = { id: string; invoiceId: string; invoiceNumber: string; amount: number; date: string }
type DepositDetail = { id: string; date: string; total: number; memo?: string; reversingEntryId?: string; voidedAt?: string; journalEntryId?: string; depositToAccount?: { number: string; name: string }; payments: DepositPayment[] }
type UndepositedPayment = { id: string; invoiceId: string; invoiceNumber: string; amount: number; date: string }

export default function DepositDetailPage({ params }: { params: { id: string } }) {
  const { push } = useToast()
  const [loading, setLoading] = useState(true)
  const [deposit, setDeposit] = useState<DepositDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const role = useMemo(() => getRoleFromCookies(), [])
  const canWrite = hasPermission(role, 'invoices:write')
  const [voiding, setVoiding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [addPanelOpen, setAddPanelOpen] = useState(false)
  const [undeposited, setUndeposited] = useState<UndepositedPayment[]>([])
  const [addSelected, setAddSelected] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await api<{ deposit: DepositDetail }>(`/api/deposits/${params.id}`)
        if (!mounted) return
        setDeposit(data.deposit)
      } catch (e: any) {
        const msg = e?.message || 'Failed to load deposit'
        setError(msg)
        push({ type: 'error', message: msg })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [params.id, push])

  async function loadUndeposited() {
    try {
      const data = await api<{ payments: UndepositedPayment[] }>(`/api/undeposited-payments`)
      setUndeposited(data.payments)
      // prune selections
      setAddSelected(prev => new Set(Array.from(prev).filter(id => data.payments.some(p => p.id === id))))
    } catch {}
  }

  async function onVoid() {
    if (!deposit) return
    if (!confirm('Void this deposit? This will move payments back to Undeposited Funds and post a reversing entry.')) return
    setVoiding(true)
    try {
      await api(`/api/deposits/${deposit.id}/void`, { method: 'DELETE' })
      push({ type: 'success', message: 'Deposit voided' })
      // Reload detail
      const data = await api<{ deposit: DepositDetail }>(`/api/deposits/${params.id}`)
      setDeposit(data.deposit)
    } catch (e: any) {
      push({ type: 'error', message: e?.message || 'Failed to void deposit' })
    } finally {
      setVoiding(false)
    }
  }

  async function removePayment(paymentId: string) {
    if (!deposit) return
    if (deposit.voidedAt) return
    if (!confirm('Remove this payment from the deposit? It will be returned to Undeposited Funds and an adjusting entry will be posted.')) return
    setRemoving(paymentId)
    try {
      const data = await api<{ deposit: DepositDetail }>(`/api/deposits/${deposit.id}`, { method: 'PATCH', body: JSON.stringify({ removePaymentIds: [paymentId] }) })
      setDeposit(data.deposit)
      push({ type: 'success', message: 'Payment removed from deposit' })
    } catch (e: any) {
      push({ type: 'error', message: e?.message || 'Failed to remove payment' })
    } finally {
      setRemoving(null)
    }
  }

  async function addPayments() {
    if (!deposit) return
    const ids = Array.from(addSelected)
    if (!ids.length) return
    setAdding(true)
    try {
      const data = await api<{ deposit: DepositDetail }>(`/api/deposits/${deposit.id}`, { method: 'PATCH', body: JSON.stringify({ addPaymentIds: ids }) })
      setDeposit(data.deposit)
      setAddSelected(new Set())
      push({ type: 'success', message: `Added ${ids.length} payment(s)` })
      await loadUndeposited()
    } catch (e: any) {
      push({ type: 'error', message: e?.message || 'Failed to add payments' })
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="glass-card print:hidden">
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900">Deposit</h1>
              {deposit?.voidedAt && (
                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] uppercase tracking-wide">Voided</span>
              )}
            </div>
            {deposit && (
              <p className="text-slate-600 text-sm">ID: <span className="font-mono">{deposit.id}</span> • Date: {formatMMDDYYYY(deposit.date)} {deposit.memo ? `• ${deposit.memo}` : ''} {deposit.voidedAt ? `• Voided ${formatMMDDYYYY(deposit.voidedAt.slice(0,10))}` : ''}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link className="btn-secondary" href="/sales/deposits">Back</Link>
            {deposit && (
              <>
                <ExportCsvButton exportPath={`/api/deposits/${deposit.id}/export`} title="Export deposit CSV" />
                <PrintButton />
              </>
            )}
            <button className="btn-danger" disabled={!canWrite || voiding || !!deposit?.voidedAt} onClick={onVoid}>{voiding ? 'Voiding…' : 'Void'}</button>
          </div>
        </div>

        {loading && (
          <div className="rounded border border-sky-100 bg-sky-50 text-sky-900 p-3 text-sm">Loading…</div>
        )}
        {error && !loading && (
          <div className="rounded border border-amber-200 bg-amber-50 text-amber-900 p-3 text-sm">{error}</div>
        )}

        {deposit && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-500">Deposit ID</div>
                  <div className="font-mono break-all">{deposit.id}</div>
                </div>
                <div>
                  <div className="text-slate-500">Date</div>
                  <div>{formatMMDDYYYY(deposit.date)}</div>
                </div>
                {deposit.reversingEntryId && (
                  <div>
                    <div className="text-slate-500">Reversing JE</div>
                    <a className="text-sky-700 hover:underline font-mono" href={`/journal/${deposit.reversingEntryId}`}>{deposit.reversingEntryId}</a>
                  </div>
                )}
                <div>
                  <div className="text-slate-500">Payments</div>
                  <div className="tabular-nums">{deposit.payments.length}</div>
                </div>
                <div>
                  <div className="text-slate-500">Total</div>
                  <div className="font-mono tabular-nums"><Amount value={deposit.total} /></div>
                </div>
                {deposit.depositToAccount && (
                  <div>
                    <div className="text-slate-500">Deposit to</div>
                    <div className="text-slate-700">{deposit.depositToAccount.number} · {deposit.depositToAccount.name}</div>
                  </div>
                )}
                {deposit.journalEntryId && (
                  <div>
                    <div className="text-slate-500">Original JE</div>
                    <a className="text-sky-700 hover:underline font-mono" href={`/journal/${deposit.journalEntryId}`}>{deposit.journalEntryId}</a>
                  </div>
                )}
                {deposit.memo && (
                  <div className="md:col-span-4">
                    <div className="text-slate-500">Memo</div>
                    <div className="text-slate-700 break-words">{deposit.memo}</div>
                  </div>
                )}
              </div>
            </div>

            {canWrite && !deposit.voidedAt && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">Add payments to deposit</h2>
                  <div className="flex items-center gap-2 text-xs">
                    <button className="btn-tertiary !py-1 !px-2" onClick={() => { setAddPanelOpen(v => !v); if (!addPanelOpen) void loadUndeposited() }}>{addPanelOpen ? 'Hide' : 'Show'}</button>
                    <button className="btn-secondary !py-1 !px-2" disabled={!addSelected.size || adding} onClick={addPayments}>{adding ? 'Adding…' : 'Add selected'}</button>
                  </div>
                </div>
                {addPanelOpen && (
                  <div className="overflow-x-auto border rounded">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-2"></th>
                          <th className="text-left font-medium px-3 py-2">Invoice</th>
                          <th className="text-right font-medium px-3 py-2">Amount</th>
                          <th className="text-left font-medium px-3 py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {undeposited.map(p => (
                          <tr key={p.id} className="border-t">
                            <td className="px-3 py-2"><input aria-label={`Select payment ${p.id}`} type="checkbox" checked={addSelected.has(p.id)} onChange={() => setAddSelected(prev => { const n = new Set(prev); if (n.has(p.id)) n.delete(p.id); else n.add(p.id); return n })} /></td>
                            <td className="px-3 py-2"><a className="text-sky-700 hover:underline" href={`/invoices/${p.invoiceId}?from=/sales/deposits/${deposit.id}`}>{p.invoiceNumber}</a></td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums"><Amount value={p.amount} /></td>
                            <td className="px-3 py-2 text-xs">{formatMMDDYYYY(p.date)}</td>
                          </tr>
                        ))}
                        {!undeposited.length && (
                          <tr>
                            <td colSpan={4} className="px-3 py-8 text-center text-slate-500">No undeposited payments</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">Invoice</th>
                    <th className="text-left font-medium px-3 py-2">Payment ID</th>
                    <th className="text-right font-medium px-3 py-2">Amount</th>
                    <th className="text-left font-medium px-3 py-2">Date</th>
                    <th className="text-right font-medium px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deposit.payments.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2">
                        <a className="text-sky-700 hover:underline" href={`/invoices/${p.invoiceId}?from=/sales/deposits/${deposit.id}`}>{p.invoiceNumber}</a>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{p.id}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums"><Amount value={p.amount} /></td>
                      <td className="px-3 py-2 text-xs">{formatMMDDYYYY(p.date)}</td>
                      <td className="px-3 py-2 text-right">
                        <button className="btn-tertiary !py-1 !px-2" disabled={!canWrite || !!deposit.voidedAt || removing === p.id} onClick={() => removePayment(p.id)}>
                          {removing === p.id ? 'Removing…' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {deposit.payments.length === 0 && (
                    <tr>
                      <td className="px-3 py-8 text-center text-slate-500" colSpan={5}>No payments in this deposit</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-slate-50">
                    <td className="px-3 py-2 text-right" colSpan={3}>Total</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums"><Amount value={deposit.total} /></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {!canWrite && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 text-slate-600 p-3 text-xs">
                You have read-only access. Deposit creation and edits are disabled for your role.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
