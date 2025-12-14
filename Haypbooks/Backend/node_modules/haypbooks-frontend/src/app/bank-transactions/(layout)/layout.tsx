import type { ReactNode } from 'react'

// Deprecated duplicate layout; keep as pass-through to avoid duplicate nav rendering.
export default function BankTransactionsSectionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
