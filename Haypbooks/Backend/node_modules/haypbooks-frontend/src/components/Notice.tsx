"use client"
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { Route } from 'next'

export default function Notice() {
  const sp = useSearchParams() ?? new URLSearchParams()
  const router = useRouter()
  const pathname = usePathname() ?? ''
  const message = sp.get('notice')
  const [open, setOpen] = useState<boolean>(!!message)
  useEffect(() => { setOpen(!!message) }, [message])
  const clear = () => {
    const next = new URLSearchParams(sp.toString()); next.delete('notice')
    const qs = next.toString()
  router.replace((qs ? `${pathname}?${qs}` : pathname) as Route)
  }
  if (!message || !open) return null
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="rounded-xl border border-slate-200 bg-white/90 shadow-lg backdrop-blur px-4 py-3 text-sm text-slate-800" role="status" aria-live="polite">
        <div className="flex items-start gap-3">
          <span className="mt-0.5">{message}</span>
          <button onClick={() => { setOpen(false); clear() }} aria-label="Dismiss notification" className="ml-auto rounded-md border border-slate-200 px-2 py-0.5 text-xs hover:bg-white">Close</button>
        </div>
      </div>
    </div>
  )
}
