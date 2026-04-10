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

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await authService.getCurrentUser()
        setUser(data)
      } catch (err: any) {
        // On 401, try a silent token refresh before giving up
        if (err?.response?.status === 401) {
          try {
            await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
            const data = await authService.getCurrentUser()
            setUser(data)
          } catch {
            setUser(null)
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

  return { user, loading }
}
