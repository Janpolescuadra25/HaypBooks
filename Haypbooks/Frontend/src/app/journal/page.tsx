import { getBaseUrl } from '@/lib/server-url'
import Link from 'next/link'
import Notice from '@/components/Notice'
import BackBar from '@/components/BackBar'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'

async function fetchJournals() {
  const res = await fetch(`${getBaseUrl()}/api/journal`, { cache: 'no-store' })
  if (!res.ok) return { journals: [], total: 0 }
  return res.json()
}

export default async function JournalsPage() {
  const { journals = [] } = await fetchJournals()
  return (
    <div className="glass-card">
      <Notice />
      <BackBar href="/reports" label="Back" />
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold text-slate-900">Journals</h1>
        <div className="flex items-center gap-2 print:hidden">
          <ExportCsvButton exportPath="/api/journal/export" />
          <PrintButton />
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Number</th>
              <th className="px-3 py-2 text-left hidden md:table-cell">Memo</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-right">Debit</th>
              <th className="px-3 py-2 text-right">Credit</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {journals.length === 0 ? (
              <tr className="border-t border-slate-200"><td className="px-3 py-6 text-center text-slate-600" colSpan={5}>No journals yet.</td></tr>
            ) : (
              journals.map((j: any) => (
                <tr key={j.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-3 py-2"><Link className="text-sky-700 hover:underline" href={`/journal/${j.id}`}>{j.number}</Link></td>
                  <td className="px-3 py-2 hidden md:table-cell">{j.memo || ''}</td>
                  <td className="px-3 py-2">{formatMMDDYYYY(j.date)}</td>
                  <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(j.totals?.debit || 0)} /></td>
                  <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(j.totals?.credit || 0)} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
