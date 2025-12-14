import { getBaseUrl } from '@/lib/server-url'
import { ReportHeader } from '@/components/ReportHeader'

async function loadData(searchParams?: { q?: string }) {
  const base = getBaseUrl()
  const q = searchParams?.q ? `?q=${encodeURIComponent(searchParams.q)}` : ''
  const res = await fetch(`${base}/api/reports/product-service-list${q}`, { next: { revalidate: 0 } })
  if (res.status === 403) return null
  return res.json()
}

export default async function ProductServiceListPage({ searchParams }: { searchParams: { q?: string } }) {
  const data = await loadData(searchParams)
  if (!data) {
    return (
      <div className="space-y-4">
        <ReportHeader exportPath="/api/reports/product-service-list/export" showPeriodControls={false} />
        <div className="glass-card"><p className="text-slate-800">Access denied. You don’t have permission to view this report.</p></div>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <ReportHeader exportPath="/api/reports/product-service-list/export" showPeriodControls={false} />
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top" aria-label="Product/Service List">
          <caption className="text-center py-3">
            <div className="text-base font-semibold text-slate-900">Product/Service List</div>
          </caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-center">Name</th>
              <th className="px-3 py-2 text-center">Type</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 text-center">{r.name}</td>
                <td className="px-3 py-2 text-center">{r.type}</td>
              </tr>
            ))}
            {data.rows.length === 0 && (
              <tr><td colSpan={2} className="px-3 py-6 text-slate-500 text-center">No items.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
