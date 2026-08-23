'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/hooks/use-user'

// Prevent static generation — owner pages rely on React contexts
// provided by ClientRoot in the root layout. Without this, next build
// tries to pre-render these pages at build time and hits null useContext.
export const dynamic = 'force-dynamic'

// Owner/Company layout - wraps all (owner) routes with the owner sidebar + top nav.
// Replace the placeholder imports below with your real sidebar and header components.
// import OwnerSidebar from '@/components/layout/sidebar/owner-sidebar'
// import TopNav from '@/components/layout/top-nav'

const PLATFORM_ADMIN_ROUTES = ['/owner/storage', '/owner/metrics', '/owner/users']

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  const isPlatformRoute = PLATFORM_ADMIN_ROUTES.some((route) => pathname?.startsWith(route))
  const shouldRedirect = isPlatformRoute && !loading && (!user || user.systemRole !== 'SUPER_ADMIN')

  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/owner/dashboard')
    }
  }, [shouldRedirect, router])

  if (isPlatformRoute && loading) return null
  if (shouldRedirect) return null

  return <div className="h-full">{children}</div>
}
