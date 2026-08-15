import { ReactNode } from 'react'
import PracticeHubSidebar from '@/components/practice-hub/PracticeHubSidebar'

export const dynamic = 'force-dynamic'

export default function PracticeHubLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full min-h-screen bg-slate-50">
      <div className="flex h-full overflow-hidden">
        <PracticeHubSidebar />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
