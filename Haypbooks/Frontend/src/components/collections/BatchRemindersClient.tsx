"use client"
import React, { useState } from 'react'

async function postBatch(asOf: string) {
  const res = await fetch(`/api/collections/reminders/batch?asOf=${encodeURIComponent(asOf)}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed')
  return res.json()
}

export function BatchRemindersClient({ asOf }: { asOf: string }) {
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const run = async () => {
    setError(null); setPending(true)
    try {
      const json = await postBatch(asOf)
      setResult(json.result)
    } catch (e: any) {
      setError('Not permitted or failed')
    } finally { setPending(false) }
  }
  return (
    <div className="flex flex-col gap-2 mb-3">
      <div className="flex items-center gap-3">
        <button onClick={run} disabled={pending} className="px-3 py-1.5 rounded bg-sky-700 text-white text-sm disabled:opacity-60">
          {pending ? 'Sending reminders…' : 'Batch Send Reminders'}
        </button>
        {error && <span className="text-xs text-rose-600" role="alert">{error}</span>}
      </div>
      {result && (
        <div className="text-xs text-slate-600" aria-live="polite">
          Batch {result.batchId} queued: {result.count} invoice{result.count===1?'':'s'} updated.
        </div>
      )}
    </div>
  )
}
