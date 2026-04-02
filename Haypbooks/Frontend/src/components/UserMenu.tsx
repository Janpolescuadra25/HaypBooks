'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearProfileCache, getProfileCached } from '@/lib/profile-cache'

export default function UserMenu() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await getProfileCached()
        if (mounted) setName(data?.name ?? '')
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
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    } catch {}
    clearProfileCache()
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
    } catch {}

    // Also defensively clear auth-related cookies client-side to avoid races where
    // server-side Clear-Cookie headers haven't taken effect yet.
    try {
      const expire = '; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
      document.cookie = `token=;${expire}`
      document.cookie = `refreshToken=;${expire}`
      document.cookie = `authToken=;${expire}`
      document.cookie = `email=;${expire}`
      document.cookie = `userId=;${expire}`
      document.cookie = `role=;${expire}`
      document.cookie = `onboardingComplete=;${expire}`
      document.cookie = `onboardingOwnerComplete=;${expire}`
      document.cookie = `onboardingAccountantComplete=;${expire}`
      document.cookie = `isAccountant=;${expire}`
    } catch {}

    // Use loggedOut flag so middleware will allow showing the login form even if
    // if a cookie is still present due to a race. Use router.replace to avoid full-page navigation in tests.
    try {
      router.replace('/login?loggedOut=1')
    } catch {
      // Fallback to window.location.replace for environments without router
      try { window.location.replace('/login?loggedOut=1') } catch {}
    }
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
