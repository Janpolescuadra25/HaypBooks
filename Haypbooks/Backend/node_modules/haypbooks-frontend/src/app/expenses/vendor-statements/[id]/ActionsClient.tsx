"use client"

import React, { useMemo, useState } from 'react'

type StatementType = 'balance-forward' | 'transaction' | 'open-item'

export default function VendorActionsClient({ vendorId, asOfIso, startIso, stmtType, canSend }: { vendorId: string; asOfIso: string; startIso?: string | null; stmtType?: StatementType; canSend: boolean }) {
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<string|undefined>()

  const query = useMemo(() => {
    const sp = new URLSearchParams({ asOf: asOfIso })
    if (startIso) sp.set('start', startIso)
    if (stmtType) sp.set('type', stmtType)
    return sp.toString()
  }, [asOfIso, startIso, stmtType])

  const exportHref = useMemo(() => {
    return `/api/vendors/${vendorId}/statement/export?` + query
  }, [vendorId, query])

  return (
    <div className="flex gap-2 items-center">
      <button className="btn-secondary" onClick={() => { if (typeof window !== 'undefined') window.print() }}>Print</button>
      <a className="btn-secondary" href={exportHref} download>
        Export CSV
      </a>
      {canSend && (
        <button
          className="btn-primary disabled:opacity-50"
          disabled={sending}
          onClick={async () => {
            try {
              setSending(true)
              const url = `/api/vendors/${vendorId}/statement/send?${query}`
              let attempt = 0, ok = false
              let lastErr: any
              while (attempt < 3 && !ok) {
                try {
                  const res = await fetch(url, { method: 'POST' })
                  ok = res.ok
                  if (ok) {
                    const j = await res.json().catch(()=>null)
                    setMsg(j?.result?.messageId ? `Queued (${j.result.messageId})` : 'Queued')
                  }
                } catch (e:any) { lastErr = e }
                if (!ok) { await new Promise(r=> setTimeout(r, 250 * Math.pow(2, attempt))) }
                attempt++
              }
              if (!ok) setMsg(lastErr?.message || 'Failed to queue')
            } catch {
              setMsg('Failed to queue')
            } finally {
              setSending(false)
            }
          }}
        >{sending ? 'Sending…' : 'Send'}</button>
      )}
      {msg && <span className="text-xs text-slate-600">{msg}</span>}
    </div>
  )
}
