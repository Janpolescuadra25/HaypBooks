'use client'
import { useEffect, useState, useRef } from 'react'

export default function CompanySwitcher() {
  const [open, setOpen] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/companies', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => { if (mounted) setCompanies(Array.isArray(data) ? data : []) })
      .catch(() => { if (mounted) setCompanies([]) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  function selectCompany(c: any) {
    // Persist selection in cookie for backend-friendly access
    try {
      document.cookie = `currentCompanyId=${encodeURIComponent(c.id)}; path=/`
      document.cookie = `currentCompanyName=${encodeURIComponent(c.name)}; path=/`
    } catch (e) {}
    setOpen(false)
    // Navigate to dashboard for the company
    window.location.href = `/dashboard?tenantId=${encodeURIComponent(c.id)}`
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm"
        title="Switch company"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18v10H3z"/><path d="M9 7v-2a2 2 0 114 0v2"/></svg>
        <span className="hidden md:inline">Companies</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg p-2 z-30">
          <div className="text-sm font-medium px-2 py-1 border-b border-slate-100">Switch company</div>
          <div className="max-h-60 overflow-auto">
            {loading && <div className="p-2 text-sm">Loading…</div>}
            {!loading && companies.length === 0 && <div className="p-2 text-sm">No companies found</div>}
            {!loading && companies.map((c) => (
              <button key={c.id} onClick={() => selectCompany(c)} className="w-full text-left px-2 py-2 hover:bg-slate-50">{c.name} {c.status ? <span className="text-xs text-slate-400">· {c.status}</span> : null}</button>
            ))}
          </div>
          <div className="border-t border-slate-100 mt-2 pt-2">
            <a href="/companies" className="block text-sm px-2 py-1 text-sky-700">Open Companies Hub</a>
          </div>
        </div>
      )}
    </div>
  )
}
