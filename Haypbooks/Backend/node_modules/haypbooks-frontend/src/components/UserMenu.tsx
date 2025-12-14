'use client'
import { useEffect, useState } from 'react'
import { clearProfileCache, getProfileCached } from '@/lib/profile-cache'

export default function UserMenu() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await getProfileCached()
        if (mounted) setName(data?.name ?? 'User')
      } catch (e: any) {
        if (mounted) setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    clearProfileCache()
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
    } catch {}
    // Prefer replace to avoid back navigation into protected page
    window.location.replace('/login')
  }

  return (
    <div className="flex items-center gap-2">
  <span className="text-slate-800 text-sm">
        {loading ? 'Loading…' : error ? '—' : name}
      </span>
  <button onClick={logout} className="btn-secondary !px-3 !py-1.5 text-sm">Logout</button>
    </div>
  )
}
