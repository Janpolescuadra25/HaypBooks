import type { ReactNode } from 'react'

// Deprecated duplicate layout; keep as pass-through to avoid duplicate nav rendering.
export default function TransactionsSectionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
