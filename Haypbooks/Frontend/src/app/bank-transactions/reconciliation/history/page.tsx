import Amount from '@/components/Amount'
import { getBaseUrl } from '@/lib/server-url'
import { revalidatePath } from 'next/cache'

async function getSessions() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/reconciliation/sessions`, { cache: 'no-store' })
  if (!res.ok) return []
  const d = await res.json().catch(() => ({ sessions: [] }))
  return Array.isArray(d.sessions) ? d.sessions : []
}

export default async function ReconciliationHistoryPage() {
  const sessions = await getSessions()
  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h1 className="text-lg font-semibold">Reconciliation history</h1>
        <p className="text-sm text-slate-600">Recent sessions</p>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Period end</th>
              <th className="px-3 py-2 text-right">Ending balance</th>
              <th className="px-3 py-2 text-right">Service charge</th>
              <th className="px-3 py-2 text-right">Interest earned</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length > 0 ? sessions.map((s: any) => (
              <tr key={s.id} className="border-t border-slate-200">
                <td className="px-3 py-2 font-mono">{s.periodEnd}</td>
                <td className="px-3 py-2 text-right"><Amount value={Number(s.endingBalance || 0)} /></td>
                <td className="px-3 py-2 text-right"><Amount value={Number(s.serviceCharge || 0)} /></td>
                <td className="px-3 py-2 text-right"><Amount value={Number(s.interestEarned || 0)} /></td>
                <td className="px-3 py-2 font-mono">{(s.createdAt || '').slice(0,19).replace('T',' ')}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <a
                      className="btn-secondary"
                      href={`/api/reconciliation/sessions/${encodeURIComponent(String(s.id))}/export?csvVersion=true`}
                      title="Export this session to CSV"
                    >Export</a>
                    <form action={`/api/reconciliation/sessions/${encodeURIComponent(String(s.id))}`} method="post">
                      <button
                        className="btn-secondary"
                        formAction={async () => {
                          'use server'
                          // Best-effort undo via DELETE
                          await fetch(`${getBaseUrl()}/api/reconciliation/sessions/${encodeURIComponent(String(s.id))}`, { method: 'DELETE' })
                          revalidatePath('/bank-transactions/reconciliation/history')
                        }}
                        title="Undo (delete) this reconciliation session"
                      >Undo</button>
                    </form>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td className="px-3 py-4 text-center text-slate-500" colSpan={6}>No sessions</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
