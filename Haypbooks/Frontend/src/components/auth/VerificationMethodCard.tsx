import React from 'react'

type Props = {
  title: string
  subtitle?: string
  onClick?: () => void
  icon?: React.ReactNode
  'data-testid'?: string
}

export default function VerificationMethodCard({ title, subtitle, onClick, icon, 'data-testid': testid }: Props) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className="w-full text-left p-4 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-shadow flex items-center gap-4"
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-emerald-50 flex-shrink-0">
        <div className="text-emerald-600">{icon}</div>
      </div>
      <div className="flex-1">
        <div className="text-lg font-semibold">{title}</div>
        {subtitle ? <div className="text-sm text-slate-500 mt-1">{subtitle}</div> : null}
      </div>
      <div className="text-slate-400">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
