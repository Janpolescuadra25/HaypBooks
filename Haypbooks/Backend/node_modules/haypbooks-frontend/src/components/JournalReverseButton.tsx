"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'

export default function JournalReverseButton({ id }: { id: string }) {
  const { loading, has } = usePermissions()
  const canWrite = !loading && has('journal:write' as any)
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [memo, setMemo] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const router = useRouter()

  async function submit() {
    if (!canWrite || busy) return
    setBusy(true)
    setError(null)
    setAnnouncement('Creating reversing entry…')
    try {
      const res = await fetch(`/api/journal/${id}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: date || undefined, memo: memo || undefined }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || `Failed (${res.status})`)
        return
      }
      const rid = json?.reversingEntryId
      setOpen(false)
      setAnnouncement('Reversing entry created')
      if (rid) {
        router.push(`/journal/${encodeURIComponent(rid)}`)
      } else {
        router.refresh()
      }
    } catch (e: any) {
      setError(e?.message || 'Error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-lg border border-slate-200 bg-white/80 p-1.5 hover:bg-white disabled:opacity-50"
        aria-label="Create reversing entry"
        title="Create reversing entry"
        disabled={!canWrite}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-slate-700"><path fill="currentColor" d="M12 6V3L8 7l4 4V8a4 4 0 1 1-3.46 2H6.42a6 6 0 1 0 5.58-4Z"/></svg>
        <span className="sr-only">Create reversing entry</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reverse-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
        >
          <form
            className="w-full max-w-lg rounded-md shadow-lg bg-white p-5 space-y-4"
            onSubmit={(e) => { e.preventDefault(); void submit() }}
            aria-describedby={error ? 'reverse-error' : undefined}
          >
            <h2 id="reverse-title" className="text-lg font-semibold">Create reversing entry</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col text-sm gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="reverse-date">Reversal Date (optional)</label>
                <input
                  id="reverse-date"
                  aria-label="Reversal Date"
                  type="date"
                  className="border rounded p-1"
                  value={date}
                  onChange={e=>setDate(e.target.value)}
                />
                <span className="text-xs text-slate-500">Leave blank to use the next open day.</span>
              </div>
              <div className="flex flex-col text-sm gap-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="reverse-memo">Memo (optional)</label>
                <input
                  id="reverse-memo"
                  aria-label="Memo"
                  type="text"
                  className="border rounded p-1"
                  value={memo}
                  onChange={e=>setMemo(e.target.value)}
                  placeholder="Reversal note"
                />
              </div>
            </div>
            {error && <div id="reverse-error" className="text-sm text-red-600">{error}</div>}
            <div className="sr-only" aria-live="polite">{announcement}</div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
