'use client'
import { useEffect, useState } from 'react'
import { authService } from '@/services/auth.service'

interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role: string
  avatarUrl?: string
  companyName?: string
  preferredHub?: string
}

/** Returns the currently authenticated user from local state / API. */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await authService.getCurrentUser()
        setServerError(false)
        setUser(data)
      } catch (err: any) {
        const status = err?.response?.status ?? err?.status

        if (status === 401) {
          // Silent token refresh, then retry once
          try {
            await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
            const data = await authService.getCurrentUser()
            setServerError(false)
            setUser(data)
          } catch {
            setUser(null)
          }
        } else if (status >= 500 || status == null) {
          // Server error or network failure — do NOT redirect to login.
          // Wait 2s and retry once; if it still fails, surface error state.
          await new Promise(r => setTimeout(r, 2000))
          try {
            const data = await authService.getCurrentUser()
            setServerError(false)
            setUser(data)
          } catch {
            setServerError(true)
            // Keep user as null but caller should show a retry UI, not redirect to login
          }
        } else {
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  return { user, loading, serverError }
}
