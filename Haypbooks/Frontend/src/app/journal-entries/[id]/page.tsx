import { BackButton } from '@/components/BackButton'
import { getBaseUrl } from '@/lib/server-url'
import Amount from '@/components/Amount'

export default async function JournalEntryPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${getBaseUrl()}/api/journal-entries/${params.id}`, { cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="space-y-4">
        <div className="glass-card print:hidden">
          <div className="flex items-center justify-between gap-2">
            <BackButton ariaLabel="Back" />
          </div>
        </div>
        <div className="glass-card">
          <p className="text-slate-800">Entry not found or access denied.</p>
        </div>
      </div>
    )
  }
  const data = await res.json()
  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <BackButton ariaLabel="Back" />
          <div className="text-sm text-slate-600">{data.balanced ? 'Balanced' : 'Out of balance'}</div>
        </div>
      </div>
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600">Journal Entry</div>
            <div className="text-base font-medium text-slate-900">#{data.id}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">Date</div>
            <div className="text-base font-medium text-slate-900">{data.date}</div>
          </div>
        </div>
        {data.memo && <div className="mt-2 text-slate-700 text-sm">{data.memo}</div>}
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm caption-top">
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Account</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Memo</th>
              <th className="px-3 py-2 tabular-nums">Debit</th>
              <th className="px-3 py-2 tabular-nums">Credit</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {data.lines.map((l: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2">{l.accountNumber}</td>
                <td className="px-3 py-2">{l.accountName}</td>
                <td className="px-3 py-2">{l.memo || ''}</td>
                <td className="px-3 py-2 tabular-nums"><Amount value={Number(l.debit || 0)} /></td>
                <td className="px-3 py-2 tabular-nums"><Amount value={Number(l.credit || 0)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 bg-white/60">
              <td className="px-3 py-2 font-medium text-slate-900" colSpan={3}>Totals</td>
              <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.debit || 0)} /></td>
              <td className="px-3 py-2 tabular-nums font-medium"><Amount value={Number(data.totals.credit || 0)} /></td>
            </tr>
          </tfoot>
        </table>
        {!data.balanced && (
          <div className="text-red-700 text-sm mt-3">Warning: Entry does not balance</div>
        )}
      </div>
    </div>
  )
}
