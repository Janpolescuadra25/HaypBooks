"use client"

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import Amount from '@/components/Amount'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'

type Connector = { id: string; name: string; kind: string; status: string; lastSyncAt?: string | null; lastSyncStatus?: string | null }
type Posting = { id: string; connectorId: string; date: string; description?: string; type: string; amount: number; status: string }

export default function AppTransactionsPage() {
  const [loading, setLoading] = useState(false)
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [postings, setPostings] = useState<Posting[]>([])
  const [activeConnector, setActiveConnector] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<any | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // RBAC — derive capabilities from current role (client-safe)
  const role = getRoleFromCookies()
  const canReadReports = hasPermission(role, 'reports:read' as any)
  const canWrite = hasPermission(role, 'journal:write' as any)

  async function loadConnectors() {
    const res = await api<{ connectors: Connector[] }>('/api/apps/connectors')
    setConnectors(res.connectors || [])
    if (!activeConnector && (res.connectors || []).length > 0) setActiveConnector(res.connectors[0].id)
  }

  async function loadPostings(connectorId?: string | null) {
    const q = connectorId ? `?connectorId=${encodeURIComponent(connectorId)}` : ''
    const res = await api<{ postings: Posting[] }>(`/api/apps/postings${q}`)
    setPostings(res.postings || [])
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([loadConnectors()]).then(() => setLoading(false)).catch(err => { setError(String(err.message || err)); setLoading(false) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!activeConnector) return
    loadPostings(activeConnector).catch(() => {})
  }, [activeConnector])

  async function handleSync(id: string) {
    setError(null)
    try {
      setLoading(true)
      await api(`/api/apps/connectors/${id}/sync`, { method: 'POST' })
      await loadConnectors()
      await loadPostings(id)
    } catch (e: any) {
      setError(String(e?.message || 'Sync failed'))
    } finally {
      setLoading(false)
    }
  }

  async function handlePost(postingId: string) {
    setError(null)
    try {
      setLoading(true)
      await api(`/api/apps/postings/${postingId}/post`, { method: 'POST' })
      await loadPostings(activeConnector)
    } catch (e: any) {
      setError(String(e?.message || 'Post failed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleIgnore(postingId: string) {
    setError(null)
    try {
      setLoading(true)
      await api(`/api/apps/postings/${postingId}/ignore`, { method: 'POST' })
      await loadPostings(activeConnector)
    } catch (e: any) {
      setError(String(e?.message || 'Ignore failed'))
    } finally {
      setLoading(false)
    }
  }

  async function handlePreview(postingId: string) {
    setError(null)
    setPreviewLoading(true)
    try {
      const res = await api<{ preview: { postingId: string; date: string; normalizedDate: string; lines: Array<{ accountNumber: string; accountName: string; debit: number; credit: number; memo?: string }>; totalDebit: number; totalCredit: number; note?: string } }>(`/api/apps/postings/${postingId}/preview`)
      setPreview(res.preview)
    } catch (e: any) {
      setError(String(e?.message || 'Preview failed'))
    } finally {
      setPreviewLoading(false)
    }
  }

  const active = useMemo(() => connectors.find(c => c.id === activeConnector) || null, [connectors, activeConnector])

  return (
    <div className="space-y-4">
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">App transactions</h2>
          {loading && <span className="text-sm text-muted">Loading…</span>}
        </div>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {connectors.map(c => (
            <div key={c.id} className={`rounded-md border p-3 ${activeConnector === c.id ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted">{c.kind}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${c.status === 'connected' ? 'bg-green-100 text-green-700' : c.status === 'needs_auth' ? 'bg-yellow-100 text-yellow-700' : c.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{c.status}</span>
              </div>
              <div className="mt-2 text-xs text-muted">Last sync: {c.lastSyncAt ? new Date(c.lastSyncAt).toISOString().replace('T',' ').slice(0,19) : '—'}{c.lastSyncStatus ? ` (${c.lastSyncStatus})` : ''}</div>
              <div className="mt-3 flex gap-2">
                <button className="btn btn-sm" onClick={() => setActiveConnector(c.id)} disabled={loading}>{activeConnector === c.id ? 'Selected' : 'Select'}</button>
                <button className="btn btn-sm btn-primary" onClick={() => handleSync(c.id)} disabled={loading || c.status !== 'connected' || !canWrite} title={!canWrite ? 'You do not have permission to sync' : undefined}>Sync</button>
              </div>
            </div>
          ))}
          {connectors.length === 0 && !loading && (
            <div className="text-sm text-muted">No connectors yet. Add an app connector to get started.</div>
          )}
        </div>
      </div>

      <div className="glass-card">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent postings{active ? ` — ${active.name}` : ''}</h3>
          <div className="text-xs text-muted">{postings.length} items</div>
        </div>
        <div className="mt-3 overflow-x-auto">
          {!canReadReports && (
            <div className="mb-2 text-sm text-amber-700">You do not have permission to view or preview app postings.</div>
          )}
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {postings.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="py-2 pr-4 whitespace-nowrap">{String(p.date||'').slice(0,10)}</td>
                  <td className="py-2 pr-4">{p.description || '—'}</td>
                  <td className="py-2 pr-4 capitalize">{p.type}</td>
                  <td className="py-2 pr-4 text-right tabular-nums"><Amount value={Number(p.amount||0)} /></td>
                  <td className="py-2 pr-4"><span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{p.status}</span></td>
                  <td className="py-2 pr-4">
                    {p.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button className="btn btn-xs" onClick={() => handlePreview(p.id)} disabled={loading || previewLoading || !canReadReports} title={!canReadReports ? 'You do not have permission to preview' : undefined}>Preview</button>
                        <button className="btn btn-xs btn-primary" onClick={() => handlePost(p.id)} disabled={loading || !canWrite} title={!canWrite ? 'You do not have permission to post' : undefined}>Post</button>
                        <button className="btn btn-xs" onClick={() => handleIgnore(p.id)} disabled={loading || !canWrite} title={!canWrite ? 'You do not have permission to ignore' : undefined}>Ignore</button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {postings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-sm text-muted">No postings found for this connector.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="preview-title">
          <div className="w-full max-w-2xl rounded-md shadow-lg bg-white p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h2 id="preview-title" className="text-lg font-semibold">Posting preview</h2>
              <button className="btn" onClick={() => setPreview(null)} aria-label="Close">Close</button>
            </div>
            <div className="text-sm text-muted">
              Date: {preview.date} {preview.normalizedDate && preview.normalizedDate !== preview.date ? <span className="ml-2 text-amber-700">(will post on {preview.normalizedDate})</span> : null}
            </div>
            {preview.note && <div className="text-sm text-amber-700">{preview.note}</div>}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="py-2 pr-4">Account</th>
                    <th className="py-2 pr-4">Debit</th>
                    <th className="py-2 pr-4">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.lines.map((l: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2 pr-4">{l.accountNumber} · {l.accountName}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{l.debit ? <Amount value={l.debit} /> : ''}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{l.credit ? <Amount value={l.credit} /> : ''}</td>
                    </tr>
                  ))}
                  <tr className="border-t font-medium">
                    <td className="py-2 pr-4 text-right">Totals</td>
                    <td className="py-2 pr-4 text-right tabular-nums"><Amount value={preview.totalDebit || 0} /></td>
                    <td className="py-2 pr-4 text-right tabular-nums"><Amount value={preview.totalCredit || 0} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setPreview(null)} disabled={loading}>Cancel</button>
              <button className="btn btn-primary" onClick={async ()=> { const id = preview.postingId; setPreview(null); await handlePost(id) }} disabled={loading || (preview.totalDebit !== preview.totalCredit) || (preview.lines||[]).length === 0}>{loading ? 'Posting…' : 'Post'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
