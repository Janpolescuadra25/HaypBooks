"use client";
import { useState } from 'react'
import { BackButton } from '@/components/BackButton'

type PreviewRow = { index: number; action: 'create'|'update'|'skip'; errors: string[]; warnings: string[]; normalized?: any }

function parseCsv(text: string): Array<Record<string, string>> {
  // Very lightweight CSV parser for common cases (no embedded newlines)
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return []
  const header = lines[0].split(',').map(h => h.trim())
  const rows: Array<Record<string, string>> = []
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',')
    const row: Record<string,string> = {}
    for (let c = 0; c < header.length; c++) row[header[c]] = (cells[c] || '').trim().replace(/^\"|\"$/g, '')
    rows.push(row)
  }
  return rows
}

function toRowsFromCsv(records: Array<Record<string, string>>) {
  // Map common header labels to fields (case-insensitive)
  const mapKey = (k: string) => k.trim().toLowerCase()
  return records.map((r) => {
    const by: Record<string,string> = {}
    Object.keys(r).forEach(k => by[mapKey(k)] = r[k])
    return {
      number: by['number'],
      name: by['name'],
      type: by['type'],
      detailType: by['detail type'] || by['detailtype'],
      parentNumber: by['parent number'] || by['parent'],
      reconcilable: by['reconcilable'],
      openingBalance: by['opening balance'] || by['openingbalance'],
      openingBalanceDate: by['opening balance date'] || by['openingbalancedate'] || by['opening date']
    }
  })
}

export default function ImportAccountsPage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<{ summary: { creates: number; updates: number; errors: number; total: number }; rows: PreviewRow[] } | null>(null)
  const [applySummary, setApplySummary] = useState<{ created: number; updated: number; skipped: number; errors: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function previewJson(rows: any[]) {
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/accounts/import/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `Preview failed (${res.status})`)
      setResult(data)
      setApplySummary(null)
    } catch (e: any) {
      setError(e?.message || 'Preview failed')
      setResult(null)
      setApplySummary(null)
    } finally {
      setBusy(false)
    }
  }

  function handlePreviewCsv() {
    try {
      const records = parseCsv(text)
      const rows = toRowsFromCsv(records)
      previewJson(rows)
    } catch (e: any) {
      setError('Could not parse CSV. Ensure a header row like: Number,Name,Type,Detail Type,Parent Number,Reconcilable,Opening Balance,Opening Balance Date')
    }
  }

  function handlePreviewJson() {
    try {
      const rows = JSON.parse(text)
      if (!Array.isArray(rows)) throw new Error('JSON must be an array of rows')
      previewJson(rows)
    } catch (e: any) {
      setError('Invalid JSON. Provide an array of row objects.')
    }
  }

  async function handleApply() {
    if (!result) return
    // Use normalized rows from preview that have no errors
    const rows = result.rows
      .filter(r => (r.errors || []).length === 0 && (r.action === 'create' || r.action === 'update' || r.action === 'skip'))
      .map(r => r.normalized)
    if (rows.length === 0) { setError('No valid rows to apply'); return }
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/accounts/import/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `Apply failed (${res.status})`)
      setApplySummary(data.summary)
    } catch (e: any) {
      setError(e?.message || 'Apply failed')
      setApplySummary(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Import Chart of Accounts — Preview</h1>
        <div className="flex gap-2">
          <BackButton fallback="/transactions/chart-of-accounts" className="btn-secondary btn-sm" ariaLabel="Back to COA">Back</BackButton>
        </div>
      </div>

      <div className="glass-card p-3 space-y-3">
        <p className="text-sm text-slate-700">Paste CSV (with header) or JSON array of account rows, then run Preview. This does not make changes — it validates and shows what would be created or updated.</p>
        <textarea className="w-full h-48 rounded-md border border-slate-200 p-2 font-mono text-xs" placeholder={`Example CSV header:\nNumber,Name,Type,Detail Type,Parent Number,Reconcilable,Opening Balance,Opening Balance Date`} value={text} onChange={e => setText(e.target.value)} />
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm" onClick={handlePreviewCsv} disabled={busy}>Preview CSV</button>
          <button className="btn-secondary btn-sm" onClick={handlePreviewJson} disabled={busy}>Preview JSON</button>
          <button className="btn-primary btn-sm" onClick={handleApply} disabled={busy || !result || result.summary.errors > 0}>Apply</button>
        </div>
        {error && <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      </div>

      {result && (
        <div className="mt-4 glass-card p-3">
          <div className="mb-2 text-sm text-slate-700">Summary: {result.summary.creates} create(s), {result.summary.updates} update(s), {result.summary.errors} error(s) out of {result.summary.total} row(s)</div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">Action</th>
                <th className="px-2 py-1">Number</th>
                <th className="px-2 py-1">Name</th>
                <th className="px-2 py-1">Type</th>
                <th className="px-2 py-1">Detail</th>
                <th className="px-2 py-1">Parent</th>
                <th className="px-2 py-1">Errors</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map(r => (
                <tr key={r.index} className="border-t border-slate-100">
                  <td className="px-2 py-1">{r.index + 1}</td>
                  <td className="px-2 py-1">{r.action}</td>
                  <td className="px-2 py-1 font-mono">{r.normalized?.number}</td>
                  <td className="px-2 py-1">{r.normalized?.name}</td>
                  <td className="px-2 py-1">{r.normalized?.type}</td>
                  <td className="px-2 py-1">{r.normalized?.detailType || ''}</td>
                  <td className="px-2 py-1">{r.normalized?.parentNumber || ''}</td>
                  <td className="px-2 py-1 text-red-700">{r.errors.join('; ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {applySummary && (
        <div className="mt-4 glass-card p-3">
          <div className="mb-2 text-sm text-slate-700">Applied: {applySummary.created} created, {applySummary.updated} updated, {applySummary.skipped} skipped, {applySummary.errors} errors out of {applySummary.total}</div>
          <div className="text-xs text-slate-600">Refresh the Chart of Accounts to see changes.</div>
        </div>
      )}
    </div>
  )
}
