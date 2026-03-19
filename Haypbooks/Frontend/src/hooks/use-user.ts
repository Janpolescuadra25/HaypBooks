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
    authService.getCurrentUser()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}
