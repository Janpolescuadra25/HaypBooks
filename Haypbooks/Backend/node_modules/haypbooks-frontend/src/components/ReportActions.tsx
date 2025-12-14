"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { downloadFromResponse } from '@/lib/download'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
  className="inline-flex items-center rounded-lg border border-slate-200 bg-white/80 p-1.5 hover:bg-white"
      aria-label="Print"
      title="Print"
    >
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-slate-700"><path fill="currentColor" d="M6 7V3h12v4h-2V5H8v2H6Zm-2 4h16a2 2 0 0 1 2 2v5h-4v3H8v-3H4v-5a2 2 0 0 1 2-2Zm2 5v1h12v-1H6Zm2 4h8v-1H8v1Z"/></svg>
  <span className="sr-only">Print</span>
    </button>
  )
}

export function ExportCsvButton({ exportPath, title = 'Export CSV' }: { exportPath: string; title?: string }) {
  const sp = useSearchParams()
  const qs = sp.toString()
  const href = `${exportPath}${qs ? (exportPath.includes('?') ? `&${qs}` : `?${qs}`) : ''}`
  return (
    <a
      href={href}
  className="inline-flex items-center rounded-lg border border-slate-200 bg-white/80 p-1.5 hover:bg-white"
      aria-label={title}
      title={title}
    >
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-slate-700"><path fill="currentColor" d="M12 16 7 11h3V4h4v7h3l-5 5Zm-7 4v-2h14v2H5Z"/></svg>
  <span className="sr-only">{title}</span>
    </a>
  )
}

// CopyLinkButton removed per UX policy update

export function RefreshButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.refresh()}
      className="inline-flex items-center rounded-lg border border-slate-200 bg-white/80 p-1.5 hover:bg-white"
      aria-label="Refresh"
      title="Refresh"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-slate-700"><path fill="currentColor" d="M12 6V3L8 7l4 4V8a4 4 0 1 1-3.46 2H6.42a6 6 0 1 0 5.58-4Z"/></svg>
      <span className="sr-only">Refresh</span>
    </button>
  )
}

export function PrintChecksButton({ accountName }: { accountName?: string }) {
  const { loading, has } = usePermissions()
  const disabled = loading || !has('bills:write' as any)
  const [busy, setBusy] = useState(false)
  return (
    <button
      onClick={async () => {
        if (disabled || busy) return
        setBusy(true)
        try {
          const body: any = { account: accountName }
          const res = await fetch('/api/checks/print', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
          if (!res.ok) {
            // Non-destructive: no toast infra here, rely on status for now
            return
          }
          await downloadFromResponse(res, 'checks.pdf')
        } finally {
          setBusy(false)
        }
      }}
      className="inline-flex items-center rounded-lg border border-slate-200 bg-white/80 p-1.5 hover:bg-white disabled:opacity-50"
      aria-label="Print checks"
      title="Print checks"
      disabled={disabled || busy}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-slate-700"><path fill="currentColor" d="M3 6h18v12H3V6Zm2 2v8h14V8H5Zm2 2h6v2H7v-2Zm0 3h4v2H7v-2Z"/></svg>
      <span className="sr-only">Print checks</span>
    </button>
  )
}
