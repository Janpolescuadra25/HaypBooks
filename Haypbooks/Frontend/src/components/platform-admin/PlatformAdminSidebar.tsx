'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Database, Users, ArrowLeft, Shield } from 'lucide-react'

export function PlatformAdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Metrics',
      href: '/platform-admin/metrics',
      icon: BarChart3,
    },
    {
      label: 'Storage Usage',
      href: '/platform-admin/storage',
      icon: Database,
    },
    {
      label: 'User Management',
      href: '/platform-admin/users',
      icon: Users,
    },
  ]

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white h-full flex flex-col justify-between">
      <div className="p-4">
        <div className="flex items-center gap-2 px-2 py-3 mb-4 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-tight">HaypBooks Platform Admin</h2>
            <p className="text-xs text-slate-500">System Management</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <Link
          href="/home/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Return to App</span>
        </Link>
      </div>
    </aside>
  )
}
