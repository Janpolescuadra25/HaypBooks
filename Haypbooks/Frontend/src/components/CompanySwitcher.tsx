'use client'
import { useEffect, useRef, useState } from 'react'
import Popover from '@/components/Popover'

export default function CompanySwitcher() {
  const [open, setOpen] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const btnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/companies/recent', { cache: 'no-store' })
        if (!res.ok) return
        const d = await res.json()
        if (mounted) setCompanies(Array.isArray(d) ? d : [])
      } catch {}
    }
    load()
    return () => { mounted = false }
  }, [])

  async function visitCompany(company: any) {
    // Optimistic nav: update lastAccessed then navigate
    try {
      await fetch(`/api/companies/${company.id}/last-accessed`, { method: 'PATCH' })
    } catch {}
    window.location.href = `/dashboard?company=${encodeURIComponent(company.id)}`
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-slate-200 bg-white text-sm"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="company-switcher"
        title="Switch company"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        <span className="hidden md:inline">Companies</span>
      </button>

      {open && (
        <Popover
          open={open}
          anchorRef={btnRef}
          onClose={() => setOpen(false)}
          matchWidth={false}
          className="mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg text-sm z-20 p-2"
        >
          <div id="company-switcher" role="menu" aria-labelledby="company-switcher-button">
            <div className="px-3 py-2 font-medium text-slate-700">Recent</div>
            <div className="divide-y divide-slate-100">
              {companies.length === 0 && <div className="px-3 py-2 text-slate-500">No recent companies</div>}
              {companies.map((c) => (
                <button key={c.id} onClick={() => visitCompany(c)} className="w-full text-left px-3 py-2 hover:bg-slate-50">{c.name}</button>
              ))}
            </div>
          </div>
        </Popover>
      )}
    </div>
  )
}
