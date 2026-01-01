"use client"
import HubSwitcher from '@/components/HubSwitcher'
import CompanySwitcher from '@/components/CompanySwitcher'
import { usePathname } from 'next/navigation'

export default function HubHeader() {
  const pathname = usePathname() || ''

  // Hide header on the hub selection and central hub pages to keep the hub chrome minimal
  if (pathname.startsWith('/hub/selection') || pathname.startsWith('/hub')) return null

  return (
    <header className="bg-white border-b py-3 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <a href="/" className="font-bold text-lg">HaypBooks</a>
        <nav className="text-sm text-slate-600">Central Hub</nav>
      </div>
      <div className="flex items-center gap-4">
        <HubSwitcher />
        <CompanySwitcher />
      </div>
    </header>
  )
}
