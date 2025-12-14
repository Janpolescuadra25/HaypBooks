import { ReportHeader } from '@/components/ReportHeader'
import { getBaseUrl } from '@/lib/server-url'

export const dynamic = 'force-dynamic'

export default async function ClosingDateReportPage() {
  const res = await fetch(`${getBaseUrl()}/api/settings`, { cache: 'no-store' })
  const data = res.ok ? await res.json() : { settings: { closeDate: null } }
  const closeDate: string | null = data?.settings?.closeDate || null
  return (
    <div className="space-y-4">
      <ReportHeader exportPath="/api/reports/closing-date/export" />
      <div className="glass-card overflow-x-auto">
        <div className="text-center py-3">
          <div className="text-base font-semibold text-slate-900">Closing Date</div>
          <div className="text-xs text-slate-600">Closed through: <span className="font-mono">{closeDate || '—'}</span></div>
        </div>
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Setting</th>
              <th className="px-3 py-2 text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200">
              <td className="px-3 py-2">Closed through</td>
              <td className="px-3 py-2 font-mono">{closeDate || '—'}</td>
            </tr>
          </tbody>
        </table>
        <div className="p-3 text-xs text-slate-500">To change the date, go to Settings → Close books.</div>
      </div>
    </div>
  )
}
