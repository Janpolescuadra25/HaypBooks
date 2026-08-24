'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/use-user'

export const dynamic = 'force-dynamic'

export default function PlatformAdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()

  const shouldRedirect = !loading && (!user || user.systemRole !== 'SUPER_ADMIN')

  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/home/dashboard')
    }
  }, [shouldRedirect, router])

  if (loading) return null
  if (shouldRedirect) return null

  return <div className="h-full">{children}</div>
}
