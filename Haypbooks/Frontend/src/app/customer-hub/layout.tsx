import type { ReactNode } from 'react'
import CustomerHubNav from '@/components/CustomerHubNav'

export default function CustomerHubLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="glass-card print:hidden px-3 md:px-4 py-1.5 md:py-2">
        <CustomerHubNav />
      </div>
      {children}
    </div>
  )
}
