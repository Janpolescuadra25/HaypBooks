'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/use-user'
import { PlatformAdminSidebar } from '@/components/platform-admin/PlatformAdminSidebar'

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <PlatformAdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}
