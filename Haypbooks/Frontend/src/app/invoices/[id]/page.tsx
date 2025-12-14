import Link from 'next/link'
import dynamic from 'next/dynamic'
import { BackButton } from '@/components/BackButton'
import { getBaseUrl } from '@/lib/server-url'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import AuditEventsPanel from '@/components/AuditEventsPanel'
import InvoiceActions from '@/components/InvoiceActions'
import Notice from '@/components/Notice'
import { redirect } from 'next/navigation'
import { formatMMDDYYYY } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import InvoiceWriteoffButton from '@/components/InvoiceWriteoffButton'
const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })

interface VoidControlsProps { id: string }
const ClientVoidControls = dynamic<VoidControlsProps>(
  () => import('./void-client').then(mod => mod.default),
  { ssr: false }
)

async function fetchInvoice(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/invoices/${id}`, { cache: 'no-store' })
  if (res.status === 404) {
    redirect(`/invoices?notice=${encodeURIComponent('Invoice not found')}`)
  }
  if (!res.ok) throw new Error('Failed to load invoice')
  return res.json()
}

async function fetchCreditMemos(customerId: string) {
  const res = await fetch(`${getBaseUrl()}/api/credit-memos?customerId=${customerId}`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return data.creditMemos || []
}

async function fetchRecentVoidMeta(id: string) {
  // Pull latest audit events for this invoice and find the void meta
  const res = await fetch(`${getBaseUrl()}/api/audit?entity=invoice&entityId=${id}&limit=20`, { cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json()
  const voidEvt = (data.rows || data.events || []).find((e: any) => e.action === 'void' && e.entityId === id)
  if (!voidEvt) return null
  const { reversingId, reversalDate, reason } = voidEvt.meta || {}
  return { reversingId, reversalDate, reason }
}

async function fetchRecentWriteoffMeta(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/audit?entity=invoice&entityId=${id}&limit=20`, { cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json()
  const evt = (data.rows || data.events || []).find((e: any) => e.action === 'invoice:write-off' && e.entityId === id)
  if (!evt) return null
  const { jeId, amount } = evt.meta || {}
  return { journalEntryId: jeId, amount }
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [data, settingsRes] = await Promise.all([
    fetchInvoice(id),
    fetch(`${getBaseUrl()}/api/settings`, { cache: 'no-store' }).then(r => r.ok ? r.json() : { settings: { baseCurrency: 'USD' } }).catch(() => ({ settings: { baseCurrency: 'USD' } }))
  ])
  const inv = data.invoice
  const creditMemos = await fetchCreditMemos(inv.customerId)
  const availableCredits = creditMemos.filter((c: any) => c.remaining > 0)
  const baseCurrency: string = settingsRes?.settings?.baseCurrency || 'USD'
  const voidMeta = inv.status === 'void' ? await fetchRecentVoidMeta(id) : null
  const writeoffMeta = await fetchRecentWriteoffMeta(id)
  const role = getRoleFromCookies()
  const canWrite = hasPermission(role, 'invoices:write')
  const payments: Array<{ id: string; date: string; amount: number }> = inv.payments || []
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0)
  const balance = Math.max(0, Number(inv.total || 0) - totalPaid)
  return (
    <div className="glass-card">
      <Notice />
  <div className="mb-3 print:hidden"><BackButton fallback="/invoices" ariaLabel="Back to Invoices" /></div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-slate-900">Invoice {inv.number}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-700">Date {formatMMDDYYYY(inv.date)}</span>
          <InvoiceActions id={id} canWrite={canWrite} />
        </div>
      </div>
  <p className="text-slate-700 mb-3">Customer: <Link className="font-medium text-sky-700 hover:underline" href={`/sales/customers/${(inv.customerId||inv.customer)}` as any}>{inv.customer}</Link></p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
          <tbody className="text-slate-800">
            {inv.items?.map((it: any, i: number) => (
              <tr key={i} className="border-t border-slate-200">
                <td className="px-3 py-2">{it.description}</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(it.amount)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 text-slate-900 font-medium">
              <td className="px-3 py-2">Total</td>
              <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(inv.total)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className={`text-sm font-medium ${inv.status==='paid' ? 'text-emerald-700' : inv.status==='draft' ? 'text-amber-700' : inv.status==='void' ? 'text-rose-700' : 'text-sky-700'}`}>
          Status: {inv.status}
          {inv.status==='void' && (
            <>
              {voidMeta?.reversingId && (
                <>
                  {' '}· Reversed {voidMeta.reversalDate ? formatMMDDYYYY(voidMeta.reversalDate) : ''}
                  {' '}· <Link className="text-sky-700 hover:underline" href={`/journal/${voidMeta.reversingId}`}>View reversing journal</Link>
                </>
              )}
              {voidMeta?.reason && (
                <>
                  {' '}· Reason: <span className="text-slate-600">{voidMeta.reason}</span>
                </>
              )}
            </>
          )}
          {writeoffMeta?.journalEntryId && (
            <>
              {' '}· <Link className="text-sky-700 hover:underline" href={`/journal/${writeoffMeta.journalEntryId}`}>View write-off journal</Link>
            </>
          )}
        </span>
        {canWrite ? (
          <div className="flex gap-2 items-center">
            {inv.status === 'draft' && <SendInvoiceButton id={id} />}
            {inv.status !== 'paid' && inv.status !== 'void' && <RecordPaymentButton id={id} total={inv.total} />}
            {inv.status !== 'void' && inv.payments.length === 0 && <ClientVoidControls id={id} />}
            {inv.status !== 'void' && balance > 0 && (
              <InvoiceWriteoffButton id={id} defaultAmount={balance} />
            )}
          </div>
        ) : null}
      </div>
      <div className="mt-6">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Payments</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-600">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <caption className="sr-only">Payments history</caption>
              <thead className="text-slate-600">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left">Date</th>
                  <th scope="col" className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {[...payments]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((p) => (
                    <tr key={p.id} className="border-t border-slate-200">
                      <td className="px-3 py-2">{formatMMDDYYYY(p.date)}</td>
                      <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(p.amount)} /></td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 text-slate-900 font-medium">
                  <td className="px-3 py-2">Total paid</td>
                  <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(totalPaid)} /></td>
                </tr>
                <tr className="border-t border-slate-200 text-slate-900 font-medium">
                  <td className="px-3 py-2">Balance</td>
                  <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(balance)} /></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      {availableCredits.length > 0 && inv.status !== 'paid' && inv.status !== 'void' && balance > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-semibold text-slate-900 mb-2">Available Credits</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Credit Memo</th><th className="px-3 py-2 text-right">Remaining</th></tr></thead>
              <tbody className="text-slate-800">
                {availableCredits.map((cm: any) => (
                  <tr key={cm.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{cm.number}</td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(cm.remaining)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ApplyCreditForm invoiceId={id} maxInvoiceBalance={balance} creditMemos={availableCredits} baseCurrency={baseCurrency} />
        </div>
      )}
      <div className="mt-6">
        <AuditEventsPanel entity="invoice" entityId={id} title="Recent Activity" />
      </div>
    </div>
  )
}

function SendInvoiceButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        'use server'
        await fetch(`${getBaseUrl()}/api/invoices/${id}/send`, { method: 'POST' })
  redirect(`/invoices/${id}?notice=${encodeURIComponent('Invoice sent')}`)
      }}
    >
      <button className="btn-secondary" type="submit">Send</button>
    </form>
  )
}

function RecordPaymentButton({ id, total }: { id: string; total: number }) {
  return (
    <form
      action={async (formData: FormData) => {
        'use server'
        const amount = Number(formData.get('amount') || 0)
        if (amount > 0) {
          await fetch(`${getBaseUrl()}/api/invoices/${id}/payments`, { method: 'POST', body: JSON.stringify({ amount }) })
          redirect(`/invoices/${id}?notice=${encodeURIComponent('Payment recorded')}`)
        }
      }}
      className="inline-flex items-center gap-2"
    >
      <label htmlFor={`pay-${id}`} className="sr-only">Payment amount</label>
      <input id={`pay-${id}`} name="amount" type="number" step="0.01" min="0.01" max={total} placeholder="Amount" className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-right" />
      <button className="btn-primary text-sm" type="submit">Record payment</button>
    </form>
  )
}

function ApplyCreditForm({ invoiceId, maxInvoiceBalance, creditMemos, baseCurrency }: { invoiceId: string; maxInvoiceBalance: number; creditMemos: Array<{ id: string; number: string; remaining: number }> , baseCurrency: string }) {
  return (
    <form
      action={async (formData: FormData) => {
        'use server'
        const cmId = String(formData.get('cm') || '')
        const amt = Number(formData.get('amount') || 0)
        if (!cmId || !amt) return
        await fetch(`${getBaseUrl()}/api/invoices/${invoiceId}/apply-credit`, { method: 'POST', body: JSON.stringify({ creditMemoId: cmId, amount: amt }) })
        redirect(`/invoices/${invoiceId}?notice=${encodeURIComponent('Credit applied')}`)
      }}
      className="mt-4 flex flex-wrap items-end gap-3"
    >
      <div>
        <label htmlFor="cm" className="block text-xs font-medium text-slate-600 mb-1">Credit Memo</label>
        <select id="cm" name="cm" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm">
          <option value="">Select…</option>
          {creditMemos.map(cm => (
            <option key={cm.id} value={cm.id}>{cm.number} · {formatCurrency(Number(cm.remaining), baseCurrency)}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="credit-amt" className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
        <input id="credit-amt" name="amount" type="number" step="0.01" min="0.01" max={maxInvoiceBalance} placeholder="Amount" className="w-32 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-right" />
      </div>
      <button type="submit" className="btn-secondary text-sm">Apply Credit</button>
    </form>
  )
}
