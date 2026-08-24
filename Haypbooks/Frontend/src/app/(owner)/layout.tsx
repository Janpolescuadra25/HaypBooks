'use client'

import { ReactNode } from 'react'

// Prevent static generation — owner pages rely on React contexts
// provided by ClientRoot in the root layout. Without this, next build
// tries to pre-render these pages at build time and hits null useContext.
export const dynamic = 'force-dynamic'

// Owner/Company layout - wraps all (owner) routes with the owner sidebar + top nav.
// Platform admin pages now live under app/(platform-admin)/platform-admin.
export default function OwnerLayout({ children }: { children: ReactNode }) {
  return <div className="h-full">{children}</div>
}
