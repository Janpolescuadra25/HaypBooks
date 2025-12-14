import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'

async function loadData(searchParams?: { q?: string }) {
  const sp = new URLSearchParams()
  if (searchParams?.q) sp.set('q', searchParams.q)
  const res = await fetch(`${getBaseUrl()}/api/reports/employee-phone-list${sp.size ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function EmployeePhoneListPage({ searchParams }: { searchParams: { q?: string } }) {
  const data = await loadData(searchParams)
  if (!data) {
    return (
      <div className="space-y-4">
  <ReportHeader exportPath="/api/reports/employee-phone-list/export" showPeriodControls={false} />
        <div className="glass-card"><p className="text-slate-800">Access denied. You don’t have permission to view this report.</p></div>
      </div>
    )
  }
  return (
    <div className="space-y-4">
  <ReportHeader exportPath="/api/reports/employee-phone-list/export" showPeriodControls={false} />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Employee Phone List">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Employee Phone List</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-center">Name</th>
              <th className="px-3 py-2 text-center">Phone</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-center">{r.name}</td>
                <td className="px-3 py-2 text-center">{r.phone}</td>
              </tr>
            ))}
            {data.rows.length === 0 && (
              <tr><td className="px-3 py-6 text-slate-500 text-center" colSpan={2}>No employees.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
