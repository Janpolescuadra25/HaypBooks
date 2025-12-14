import type { ReactNode } from 'react'
import ReportsNav from '@/components/ReportsNav'

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="glass-card print:hidden px-3 md:px-4 py-1.5 md:py-2">
        <ReportsNav />
      </div>
      {children}
    </div>
  )
}
