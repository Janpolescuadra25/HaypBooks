import { getBaseUrl } from '@/lib/server-url'
import { formatMMDDYYYY } from '@/lib/date'
import Link from 'next/link'
import { BackButton } from '@/components/BackButton'
import { MarkBillPaid } from '@/components/MarkBillPaid'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import AuditEventsPanel from '@/components/AuditEventsPanel'
import BillActions from '@/components/BillActions'
import Notice from '@/components/Notice'
import dynamic from 'next/dynamic'
const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })
import { redirect } from 'next/navigation'

interface BillVoidProps { id: string }
const BillVoidControls = dynamic<BillVoidProps>(() => import('./void-client').then(m=>m.default), { ssr: false })

async function fetchBill(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/bills/${id}`, { cache: 'no-store' })
  if (res.status === 404) {
    redirect(`/bills?notice=${encodeURIComponent('Bill not found')}`)
  }
  if (!res.ok) throw new Error('Failed to load bill')
  return res.json()
}

async function fetchRecentVoidMeta(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/audit?entity=bill&entityId=${id}&limit=20`, { cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json()
  const voidEvt = (data.rows || data.events || []).find((e: any) => e.action === 'void' && e.entityId === id)
  if (!voidEvt) return null
  const { reversingId, reversalDate, reason } = voidEvt.meta || {}
  return { reversingId, reversalDate, reason }
}

export default async function BillDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const data = await fetchBill(id)
  const bill = data.bill
  const voidMeta = bill.status === 'void' ? await fetchRecentVoidMeta(id) : null
  const role = getRoleFromCookies()
  const canWrite = hasPermission(role, 'bills:write')
  const canApprove = hasPermission(role, 'bills:approve')
  return (
    <div className="glass-card">
      <Notice />
  <div className="mb-3 print:hidden"><BackButton fallback="/bills" ariaLabel="Back to Bills" /></div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-slate-900">Bill {bill.number}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-700">Due {formatMMDDYYYY(bill.dueDate)}</span>
          {canWrite && <BillActions id={id} />}
        </div>
      </div>
  <p className="text-slate-700 mb-3">Vendor: <Link className="font-medium text-sky-700 hover:underline" href={`/vendors/${(bill.vendorId||bill.vendor)}` as any}>{bill.vendor}</Link></p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
          <tbody className="text-slate-800">
            {bill.items?.map((it: any, i: number) => (
              <tr key={i} className="border-t border-slate-200">
                <td className="px-3 py-2">{it.description}</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(it.amount)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 text-slate-900 font-medium">
              <td className="px-3 py-2">Total</td>
              <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(bill.total)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className={`text-sm font-medium ${bill.status==='paid' ? 'text-emerald-700' : bill.status==='open' ? 'text-sky-700' : bill.status==='void' ? 'text-rose-700' : 'text-amber-700'}`}>
          Status: {bill.status}{bill.scheduledDate ? ` · scheduled ${formatMMDDYYYY(bill.scheduledDate)}` : ''}
          {bill.status==='void' && (
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
        </span>
        {canWrite ? (
          <div className="flex gap-2 items-center">
            {bill.status !== 'paid' && bill.status !== 'void' && <ScheduleBill id={id} scheduledDate={bill.scheduledDate || undefined} />}
            {bill.status !== 'paid' && bill.status !== 'void' && <MarkBillPaid id={id} />}
            {bill.status !== 'void' && (bill.payments||[]).length === 0 && <BillVoidControls id={id} />}
          </div>
        ) : null}
      </div>
      {/* Approval Actions */}
      <div className="mt-3 flex items-center gap-2">
        {bill.status === 'open' && canWrite && (
          <form action={async () => { 'use server'; await fetch(`${getBaseUrl()}/api/bills/${id}/approval`, { method: 'POST', body: JSON.stringify({ action: 'submit' }) });
            redirect(`/bills/${id}?notice=${encodeURIComponent('Bill submitted for approval')}`)
          }}>
            <button type="submit" className="btn-secondary text-sm">Submit for approval</button>
          </form>
        )}
        {bill.status === 'pending_approval' && canApprove && (
          <>
            <form action={async () => { 'use server'; await fetch(`${getBaseUrl()}/api/bills/${id}/approval`, { method: 'POST', body: JSON.stringify({ action: 'approve' }) });
              redirect(`/bills/${id}?notice=${encodeURIComponent('Bill approved')}`)
            }}>
              <button type="submit" className="btn-secondary text-sm">Approve</button>
            </form>
            <form action={async () => { 'use server'; await fetch(`${getBaseUrl()}/api/bills/${id}/approval`, { method: 'POST', body: JSON.stringify({ action: 'reject', note: 'Insufficient docs' }) });
              redirect(`/bills/${id}?notice=${encodeURIComponent('Bill rejected')}`)
            }}>
              <button type="submit" className="btn-secondary text-sm">Reject</button>
            </form>
          </>
        )}
      </div>
      <div className="mt-6">
        <AuditEventsPanel entity="bill" entityId={id} title="Recent Activity" />
      </div>
  {/* Vendor Credits Application */}
  <VendorCreditsClient billId={id} vendorId={bill.vendorId} />
      {/* Payments History */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Payments</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
            <tbody className="text-slate-800">
              {(bill.payments || []).length === 0 ? (
                <tr className="border-t border-slate-200"><td className="px-3 py-2" colSpan={2}>No payments recorded</td></tr>
              ) : (
                (bill.payments || []).map((p: any) => (
                  <tr key={p.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{formatMMDDYYYY(p.date)}</td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(p.amount)} /></td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="text-slate-900 font-medium">
              <tr className="border-t border-slate-200">
                <td className="px-3 py-2">Total paid</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number((bill.payments||[]).reduce((s:number,p:any)=>s+Number(p.amount||0),0))} /></td>
              </tr>
              <tr>
                <td className="px-3 py-2">Balance</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(bill.total - (bill.payments||[]).reduce((s:number,p:any)=>s+Number(p.amount||0),0))} /></td>
              </tr>
            </tfoot>
          </table>
        </div>
        {bill.status !== 'paid' && (
      <form
            action={async (formData: FormData) => {
              'use server'
              const amt = Number(formData.get('amount'))
              if (Number.isFinite(amt) && amt > 0) {
                await fetch(`${getBaseUrl()}/api/bills/${id}/payments`, { method: 'POST', body: JSON.stringify({ amount: amt }) })
                redirect(`/bills/${id}?notice=${encodeURIComponent('Payment recorded')}`)
              }
            }}
            className="mt-3 inline-flex items-center gap-2"
          >
            <label htmlFor={`bill-pay-${id}`} className="text-sm text-slate-700">Record payment</label>
            <input id={`bill-pay-${id}`} name="amount" type="number" step="0.01" className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" />
            <button type="submit" className="btn-secondary text-sm">Add payment</button>
          </form>
        )}
      </div>
    </div>
  )
}

function ScheduleBill({ id, scheduledDate }: { id: string; scheduledDate?: string }) {
  return (
    <form
      action={async (formData: FormData) => {
        'use server'
        const date = formData.get('date') as string | null
        if (date) {
          await fetch(`${getBaseUrl()}/api/bills/${id}/schedule`, { method: 'POST', body: JSON.stringify({ date }) })
        } else {
          await fetch(`${getBaseUrl()}/api/bills/${id}/schedule`, { method: 'DELETE' })
        }
      }}
      className="inline-flex items-center gap-2"
    >
      <label htmlFor={`sched-${id}`} className="sr-only">Schedule date</label>
      <input id={`sched-${id}`} type="date" name="date" defaultValue={scheduledDate?.slice(0,10)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" />
      <button className="btn-secondary text-sm" type="submit">{scheduledDate ? 'Update schedule' : 'Schedule payment'}</button>
      {scheduledDate && (
        <button className="btn-secondary text-sm" name="date" value="" type="submit">Cancel</button>
      )}
    </form>
  )
}

// BillActions moved to client component

const VendorCreditsClient = dynamic<{ billId: string; vendorId: string }>(() => import('./vendor-credits-client'), { ssr: false })
