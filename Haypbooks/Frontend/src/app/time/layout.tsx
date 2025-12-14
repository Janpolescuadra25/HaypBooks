import type { ReactNode } from 'react'
import TimeNav from '@/components/TimeNav'

export default function TimeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="glass-card print:hidden px-3 md:px-4 py-1.5 md:py-2"><TimeNav /></div>
      {children}
    </div>
  )
}
