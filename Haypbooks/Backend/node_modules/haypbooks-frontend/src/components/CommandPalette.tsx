"use client"
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { buildDefaultCommands, filterAndRank, useCommandPalette } from '@/stores/commandPalette'
import type { Route } from 'next'

export default function CommandPalette() {
  const { open, closePalette, query, setQuery, items, setItems, recent, markUsed } = useCommandPalette()
  const [mounted, setMounted] = useState(false)
  const listRef = useRef<HTMLUListElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const allItems = items

  useEffect(() => { setMounted(true) }, [])
  // Initialize default commands on first mount if none present
  useEffect(() => {
    if (!mounted) return
    // Only seed if list empty to avoid repeated state churn w/ StrictMode double invoke
    if (allItems.length === 0) {
      const base = buildDefaultCommands((href: Route) => router.push(href))
      setItems(base)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, /* intentionally omit dependencies that would re-seed */, allItems.length])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  // Global keyboard: ESC closes while palette open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        e.preventDefault(); closePalette()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closePalette])

  if (!open) return null
  const ranked = filterAndRank(allItems, query, recent)

  function onSelect(idx: number) {
    const item = ranked[idx]
    if (!item) return
    markUsed(item.id)
    closePalette()
    // Run outside of closing animation
    setTimeout(() => item.action(), 0)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Command palette" className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closePalette} />
      <div className="relative w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            aria-label="Command palette search"
            className="w-full bg-transparent outline-none text-sm py-1"
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); (listRef.current?.querySelector('[data-idx="0"]') as HTMLElement | null)?.focus() }
              if (e.key === 'Enter') { e.preventDefault(); onSelect(0) }
            }}
          />
          <kbd className="hidden md:inline-flex items-center gap-1 rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">ESC</kbd>
        </div>
        <ul ref={listRef} className="max-h-80 overflow-auto py-1" role="list" aria-label="Command results">
          {ranked.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">No results.</li>
          )}
          {ranked.map((item, i) => (
            <li
              key={item.id}
              tabIndex={0}
              data-idx={i}
              className="px-3 py-2 text-sm cursor-pointer flex items-center justify-between gap-3 focus:bg-sky-50 hover:bg-sky-50 outline-none"
              onClick={() => onSelect(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); onSelect(i) }
                if (e.key === 'ArrowDown') { e.preventDefault(); (listRef.current?.querySelector(`[data-idx="${i+1}"]`) as HTMLElement | null)?.focus() }
                if (e.key === 'ArrowUp') { e.preventDefault(); (i === 0 ? inputRef.current : (listRef.current?.querySelector(`[data-idx="${i-1}"]`) as HTMLElement | null))?.focus() }
              }}
            >
              <span className="truncate"><span className="text-slate-700">{item.label}</span>{item.hint && <span className="ml-2 text-slate-400 text-xs">{item.hint}</span>}</span>
              <span className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">{item.group}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-200 bg-slate-50/60 px-3 py-1.5 text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
          <span><strong>Enter</strong> run</span>
          <span><strong>↑↓</strong> navigate</span>
          <span><strong>Esc</strong> close</span>
        </div>
      </div>
    </div>
  )
}
