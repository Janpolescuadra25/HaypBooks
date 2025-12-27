import React from 'react'
import HubHeader from '@/components/HubHeader'

export const metadata = {
  title: 'HaypBooks — Central Hub',
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header is extracted into a client component that hides itself on /hub/selection */}
      <HubHeader />
      <main className="p-8 max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
