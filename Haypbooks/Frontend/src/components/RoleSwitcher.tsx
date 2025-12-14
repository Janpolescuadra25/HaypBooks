'use client'
import { useEffect, useState } from 'react'

const roles = ['admin','manager','ap-clerk','viewer'] as const

export function RoleSwitcher() {
  const [role, setRole] = useState<string>('admin')

  useEffect(() => {
    // read cookie if present
    const m = document.cookie.match(/(?:^|; )role=([^;]+)/)
    if (m) setRole(decodeURIComponent(m[1]))
  }, [])

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const r = e.target.value
    setRole(r)
    const expires = new Date(Date.now() + 30*24*60*60*1000).toUTCString()
    document.cookie = `role=${encodeURIComponent(r)}; Path=/; Expires=${expires}`
    // Soft refresh to ensure server routes read new cookie
    if (typeof window !== 'undefined') window.location.reload()
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700" title="Switch role for RBAC testing">
      <span className="hidden lg:inline">Role</span>
  <select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" value={role} onChange={onChange} aria-label="Select role">
        {roles.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
    </label>
  )
}
