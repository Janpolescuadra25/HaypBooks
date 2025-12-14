"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'

export type DockItem = {
  id: string
  label: string
  color: 'teal' | 'indigo' | 'slate'
  dirty?: boolean
  icon: 'grid' | 'widgets'
}

export default function MinimizedDock({ items, onRestore, onClose }: {
  items: DockItem[]
  onRestore: (id: string) => void
  onClose: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const el = rootRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open])

  // (Dropdown height is capped via CSS to about 4 rows and scrolls beyond.)

  const count = items.length
  const sorted = useMemo(() => {
    // Dirty first, then by label for a stable order
    return [...items].sort((a, b) => {
      if (!!b.dirty !== !!a.dirty) return Number(!!b.dirty) - Number(!!a.dirty)
      return a.label.localeCompare(b.label)
    })
  }, [items])

  if (count === 0) return null

  const primary = items.find(i => i.dirty) ?? items[0]

  return (
    <div ref={rootRef} className="fixed bottom-4 right-4 z-[60]">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={
          `inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white px-3 py-2 text-sm font-medium ` +
          `shadow-[0_8px_16px_rgba(15,23,42,0.16),_0_24px_48px_rgba(15,23,42,0.20)] hover:bg-slate-50`
        }
        title="Minimized items"
      >
        <span className="-ml-0.5" aria-hidden>
          {primary.icon === 'grid' ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="8" height="8" rx="2"></rect>
              <rect x="13" y="3" width="8" height="8" rx="2"></rect>
              <rect x="3" y="13" width="8" height="8" rx="2"></rect>
              <rect x="13" y="13" width="8" height="8" rx="2"></rect>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </span>
        <span className="whitespace-nowrap">Minimized ({count})</span>
        <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-500" aria-hidden>
          <path fill="currentColor" d="M5.5 7.5l4.5 4.5 4.5-4.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-12 right-0 w-64 max-h-48 overflow-auto rounded-xl border border-slate-200/60 bg-white py-1 shadow-[0_12px_24px_rgba(15,23,42,0.18),_0_36px_72px_rgba(15,23,42,0.22)]"
        >
          {sorted.map((it) => (
            <div key={it.id} className="group flex items-center gap-2 px-2 py-2 hover:bg-slate-50">
              <button
                type="button"
                onClick={() => { setOpen(false); onRestore(it.id) }}
                className="flex-1 inline-flex items-center gap-2 text-left"
                title={`Restore ${it.label}`}
              >
                <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-700">
                  {it.icon === 'grid' ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="8" height="8" rx="2"></rect>
                      <rect x="13" y="3" width="8" height="8" rx="2"></rect>
                      <rect x="3" y="13" width="8" height="8" rx="2"></rect>
                      <rect x="13" y="13" width="8" height="8" rx="2"></rect>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-slate-800">{it.label}</span>
                {it.dirty && <span className="ml-1 inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden />}
              </button>
              <button
                type="button"
                aria-label={`Close ${it.label}`}
                title="Close"
                onClick={() => onClose(it.id)}
                className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>
          ))}
          {count > 1 && (
            <div className="mt-1 border-t border-slate-200/70 pt-1">
              <button
                type="button"
                className="w-full px-2 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => { setOpen(false); items.forEach(it => onClose(it.id)) }}
                title="Close all minimized"
              >
                Close all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
