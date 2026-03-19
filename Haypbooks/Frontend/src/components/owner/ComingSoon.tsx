import type { ReactNode } from 'react'

interface ComingSoonProps {
  title?: string
  description?: string
  icon?: ReactNode
  ent?: boolean
}

export default function ComingSoon({ title, description, icon, ent = false }: ComingSoonProps) {
  return (
    <div className="p-4">
      <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4">
          {icon ?? (
            <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <div className="flex items-center gap-2 justify-center mb-2">
          <h1 className="text-2xl font-bold text-emerald-900">{title ?? 'Coming Soon'}</h1>
          {ent && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 uppercase tracking-wide">
              ENT
            </span>
          )}
        </div>

        <p className="text-emerald-600/80 max-w-sm text-sm leading-relaxed">
          {description ?? "This page is currently under development. An all-new experience is on the way."}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            className="px-5 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors opacity-60 cursor-not-allowed"
            disabled
            title="Available when this module is released"
          >
            Add New Record
          </button>
          <button
            className="px-5 py-1.5 border border-emerald-200 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors opacity-60 cursor-not-allowed"
            disabled
            title="Available when this module is released"
          >
            View Reports
          </button>
        </div>

        <div className="mt-8 flex gap-2 items-center text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Under development
        </div>
      </div>
    </div>
  )
}
