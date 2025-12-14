import type { ReactNode } from 'react'
import SalesNav from '@/components/SalesNav'

export default function SalesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="glass-card print:hidden px-3 md:px-4 py-1.5 md:py-2">
        <SalesNav />
      </div>
      {children}
    </div>
  )
}
