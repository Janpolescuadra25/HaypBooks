import { ReactNode } from 'react'

// Prevent static generation — owner pages rely on React contexts
// provided by ClientRoot in the root layout. Without this, next build
// tries to pre-render these pages at build time and hits null useContext.
export const dynamic = 'force-dynamic'

// Owner/Company layout - wraps all (owner) routes with the owner sidebar + top nav.
// Replace the placeholder imports below with your real sidebar and header components.
// import OwnerSidebar from '@/components/layout/sidebar/owner-sidebar'
// import TopNav from '@/components/layout/top-nav'

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* <OwnerSidebar /> */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* <TopNav /> */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
