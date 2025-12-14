"use client"

import React, { useMemo, useState, useEffect } from 'react'

type StatementType = 'balance-forward' | 'transaction' | 'open-item'

export function ActionsClient({ customerId, asOfIso, startIso, stmtType, canSend }: { customerId: string; asOfIso: string; startIso?: string; stmtType?: StatementType; canSend: boolean }) {
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<string|undefined>()
  const [library, setLibrary] = useState<Array<{id:string,name:string,body:string}>>([])
  const [selectedMessageId, setSelectedMessageId] = useState<string|undefined>()
  const [customOverride, setCustomOverride] = useState<string|undefined>()

  useEffect(()=>{
    let mounted = true
    ;(async ()=>{
      try {
        const res = await fetch('/api/messages')
        if (!mounted) return
        if (res.ok) {
          const json = await res.json().catch(()=>({ messages: [] }))
          setLibrary(json.messages || [])
        }
      } catch {}
    })()
    return ()=> { mounted = false }
  }, [])

  const query = useMemo(() => {
    const sp = new URLSearchParams({ asOf: asOfIso })
    if (startIso) sp.set('start', startIso)
    // Map page statement type to send/export types
    if (stmtType) {
      sp.set('type', stmtType)
    }
    return sp.toString()
  }, [asOfIso, startIso, stmtType])

  const exportHref = useMemo(() => {
    return `/api/customers/${customerId}/statement/export?` + query
  }, [customerId, query])

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
              // Send endpoint accepts type=summary|detail; default to summary
              const q = new URLSearchParams(query)
              if (!q.get('type')) q.set('type', 'summary')
              const url = `/api/customers/${customerId}/statement/send?${q.toString()}`
              // include message selection/override in POST body
              const payload: any = {}
              if (selectedMessageId && selectedMessageId !== '__custom__') payload.messageId = selectedMessageId
              else if (selectedMessageId === '__custom__' && customOverride && String(customOverride).trim().length) payload.messageOverride = String(customOverride).trim()
              // simple retry with backoff (2 retries)
              let attempt = 0, ok = false
              let lastErr: any
              while (attempt < 3 && !ok) {
                try {
                  const res = await fetch(url, { method: 'POST', body: payload && Object.keys(payload).length ? JSON.stringify(payload) : undefined, headers: payload && Object.keys(payload).length ? { 'Content-Type': 'application/json' } : undefined })
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
      {/* Message selection / override UI */}
      {canSend && (
        <div className="flex items-start gap-2">
          <label className="text-xs text-slate-600">Message</label>
          <select
            value={selectedMessageId || ''}
            onChange={(e) => {
              const v = e.target.value
              setSelectedMessageId(v || undefined)
              // clearing selected resets custom override
              if (!v) setCustomOverride(undefined)
            }}
            className="rounded border px-2 py-1 text-sm"
            aria-label="Select message"
          >
            <option value="">(Use default)</option>
            {library.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            <option value="__custom__">Custom…</option>
          </select>
          {selectedMessageId === '__custom__' && (
            <textarea aria-label="Custom message override" rows={2} className="rounded border px-2 py-1 text-sm" value={customOverride||''} onChange={e=>setCustomOverride(e.target.value)} />
          )}
        </div>
      )}
      {msg && <span className="text-xs text-slate-600">{msg}</span>}
    </div>
  )
}

export default ActionsClient
