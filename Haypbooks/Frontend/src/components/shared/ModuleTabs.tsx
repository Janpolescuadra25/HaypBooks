'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Tab {
  label: string
  value: string
  path?: string  // optional full path override
}

interface ModuleTabsProps {
  tabs: Tab[]
  basePath: string
}

export default function ModuleTabs({ tabs, basePath }: ModuleTabsProps) {
  const pathname = usePathname() ?? ''

  return (
    <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm">
      <div className="px-6 overflow-x-auto">
        <nav className="flex gap-1 min-w-max" aria-label="Module tabs">
          {tabs.map((tab) => {
            const href = tab.path ?? `${basePath}/${tab.value}`
            const isActive = tab.path
              ? pathname === tab.path
              : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={tab.value}
                href={href}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
