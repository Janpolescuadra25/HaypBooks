import { getBaseUrl } from '@/lib/server-url'
import BackBar from '@/components/BackBar'
import Notice from '@/components/Notice'
import AuditEventsPanel from '@/components/AuditEventsPanel'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import JournalReverseButton from '@/components/JournalReverseButton'
import JournalReclassButton from '@/components/JournalReclassButton'
import { formatMMDDYYYY } from '@/lib/date'
import Link from 'next/link'
import Amount from '@/components/Amount'

import { redirect } from 'next/navigation'

async function fetchJournal(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/journal/${id}`, { cache: 'no-store' })
  if (res.status === 404) {
    redirect(`/journal?notice=${encodeURIComponent('Journal not found')}`)
  }
  if (!res.ok) throw new Error('Failed to load journal')
  return res.json()
}

export default async function JournalDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const data = await fetchJournal(id)
  const j = data.journal
  return (
    <div className="glass-card">
      <Notice />
      <BackBar href="/journal" label="Back" />
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-slate-900">Journal {j.number}</h1>
        <div className="flex items-center gap-2 print:hidden">
          <ExportCsvButton exportPath={`/api/journal/${j.id}/export`} />
          <JournalReverseButton id={j.id} />
          <JournalReclassButton />
          <PrintButton />
          <span className="text-sm text-slate-600">{formatMMDDYYYY(j.date)}</span>
        </div>
      </div>
      {(j.memo && <p className="text-slate-700 mb-3">{j.memo}</p>)}
      {(j.linkedType || j.reversesEntryId) && (
        <div className="mb-3 text-sm text-slate-700">
          {j.linkedType && j.linkedId && (
            <span className="inline-flex items-center gap-2">
              <span>Origin:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 text-slate-800 border border-slate-200 px-2 py-[1px] text-[11px]">
                <span className="uppercase text-[10px] text-slate-500">{j.linkedType}</span>
                {j.linkedType === 'invoice' && (<Link className="text-sky-700 hover:underline" href={`/invoices/${j.linkedId}` as any}>{j.linkedId}</Link>)}
                {j.linkedType === 'bill' && (<Link className="text-sky-700 hover:underline" href={`/bills/${j.linkedId}` as any}>{j.linkedId}</Link>)}
                {j.linkedType === 'payment' && (<span>{j.linkedId}</span>)}
              </span>
            </span>
          )}
          {j.reversesEntryId && (
            <span className="ml-3">Reverses: <Link className="text-sky-700 hover:underline" href={`/journal/${j.reversesEntryId}`}>{j.reversesEntryId}</Link></span>
          )}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm caption-top" aria-label={`Journal ${j.number}`}>
          <caption className="text-center py-3 print:py-1">
            <div className="text-base font-semibold text-slate-900">Journal {j.number}</div>
            <div className="text-xs text-slate-600">{formatMMDDYYYY(j.date)}</div>
          </caption>
          <thead>
            <tr className="text-slate-600">
              <th className="px-3 py-2 text-center">Account</th>
              <th className="px-3 py-2 text-center hidden sm:table-cell">Name</th>
              <th className="px-3 py-2 text-center hidden md:table-cell">Memo</th>
              <th className="px-3 py-2 text-center">Debit</th>
              <th className="px-3 py-2 text-center">Credit</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {j.lines.map((l: any, i: number) => (
              <tr key={i} className="border-t border-slate-200">
                <td className="px-3 py-2 text-center">
                  <Link href={`/reports/account-ledger?account=${encodeURIComponent(String(l.account).split('·')[0].trim())}&from=${encodeURIComponent(`/journal/${j.id}`)}`} className="text-sky-700 hover:underline">
                    {l.account}
                  </Link>
                </td>
                <td className="px-3 py-2 hidden sm:table-cell text-center">{l.name || ''}</td>
                <td className="px-3 py-2 hidden md:table-cell text-center">{l.memo || ''}</td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(l.debit || 0)} /></td>
                <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(l.credit || 0)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 text-slate-900 font-medium">
              <td className="px-3 py-2 text-center" colSpan={3}>Totals</td>
              <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(j.totals.debit || 0)} /></td>
              <td className="px-3 py-2 text-center tabular-nums"><Amount value={Number(j.totals.credit || 0)} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card bg-white/70">
          <h3 className="font-medium text-slate-900 mb-2">Reversing</h3>
          <p className="text-sm text-slate-700">{j.reversing?.enabled ? `Yes, on ${formatMMDDYYYY(j.reversing.date)}` : 'No'}</p>
        </div>
        <div className="glass-card bg-white/70">
          <h3 className="font-medium text-slate-900 mb-2">Recurring</h3>
          {j.recurring?.enabled ? (
            <div className="text-sm text-slate-700">
              <p className="mb-1">{j.recurring.frequency} × {j.recurring.count || 0}</p>
              {Array.isArray(j.recurring.schedule) && j.recurring.schedule.length > 0 ? (
                <ul className="list-disc pl-5">
                  {j.recurring.schedule.slice(0,5).map((d: string) => (
                    <li key={d}>{formatMMDDYYYY(d)}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-600">No upcoming dates</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-700">No</p>
          )}
        </div>
        <div className="glass-card bg-white/70 sm:col-span-2">
          <h3 className="font-medium text-slate-900 mb-2">Attachments</h3>
          {Array.isArray(j.attachments) && j.attachments.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-slate-700">
              {j.attachments.map((a: any) => (
                <li key={a.name}>{a.name} ({Math.round(a.size/1024)} KB)</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-700">None</p>
          )}
        </div>
        <div className="sm:col-span-2">
          {/* Audit trail for this journal */}
          <AuditEventsPanel entity="journal" entityId={j.id} title="Recent Activity" />
        </div>
      </div>
    </div>
  )
}
