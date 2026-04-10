'use client'

import { Clock } from 'lucide-react'

interface TabComingSoonProps {
  title?: string
  description?: string
}

export default function TabComingSoon({
  title = 'Coming Soon',
  description = 'This feature is under development.',
}: TabComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
        <Clock className="w-6 h-6 text-emerald-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs">{description}</p>
    </div>
  )
}
