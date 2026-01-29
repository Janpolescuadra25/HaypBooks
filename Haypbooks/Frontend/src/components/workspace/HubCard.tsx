import React from 'react'

type Props = {
  title: string
  subtitle?: string
  items?: string[]
  onItemClick?: (index: number) => void
  ctaLabel?: string
  ctaTestId?: string
  onCtaClick?: () => void
}

export default function HubCard({ title, subtitle, items = [], onItemClick, ctaLabel, ctaTestId, onCtaClick }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 p-6 rounded-t-3xl text-white">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-xs opacity-90 mt-1">{subtitle}</p>}
      </div>
      <div className="p-6">
        <p className="text-sm text-slate-600">{subtitle ? '' : null}</p>
        <ul className="mt-4 space-y-3">
          {items.length === 0 ? (
            <li className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-2 text-sm">No items yet</li>
          ) : (
            items.map((it, i) => (
              <li key={i}
                className={`rounded-xl px-3 py-2 text-sm cursor-pointer ${i === 0 ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-800'}`}
                onClick={() => onItemClick && onItemClick(i)}
              >{it}</li>
            ))
          )}
        </ul>
        <div className="mt-6">
          <button data-testid={ctaTestId} onClick={onCtaClick} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-2xl text-xs font-semibold tracking-wide">{ctaLabel}</button>
        </div>
      </div>
    </div>
  )
}
