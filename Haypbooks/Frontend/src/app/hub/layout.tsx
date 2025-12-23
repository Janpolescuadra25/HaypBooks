import React from 'react'
import CompanySwitcher from '@/components/CompanySwitcher'

export const metadata = {
  title: 'HaypBooks — Central Hub',
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="font-bold text-lg">HaypBooks</a>
          <nav className="text-sm text-slate-600">Central Hub</nav>
        </div>
        <div className="flex items-center gap-4">
          <CompanySwitcher />
        </div>
      </header>
      <main className="p-8 max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
