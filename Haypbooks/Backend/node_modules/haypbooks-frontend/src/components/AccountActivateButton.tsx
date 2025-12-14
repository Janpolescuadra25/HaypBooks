"use client"

import { useState } from 'react'

export function AccountActivateButton({ id, active, onDone }: { id: string; active?: boolean; onDone?: () => void }) {
  const [busy, setBusy] = useState(false)
  const next = active !== false ? false : true
  const label = next ? 'Make active' : 'Make inactive'
  const title = label
  return (
    <button
      type="button"
      className="text-slate-600 hover:underline disabled:opacity-50"
      disabled={busy}
      title={title}
      aria-label={title}
      onClick={async () => {
        if (busy) return
        setBusy(true)
        try {
          const res = await fetch('/api/accounts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, active: next }) })
          if (!res.ok) {
            // Best-effort alert
            const data = await res.json().catch(() => ({} as any))
            alert(data?.error || `Failed (${res.status})`)
            return
          }
          if (onDone) onDone()
          else if (typeof window !== 'undefined') window.location.replace(window.location.href)
        } finally {
          setBusy(false)
        }
      }}
    >
      {label}
    </button>
  )
}
