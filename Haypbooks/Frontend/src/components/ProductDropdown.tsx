import React, { useEffect, useRef, useState } from 'react'
import Popover from './Popover'
import CreateProductModal from './CreateProductModal'
import { useRouter } from 'next/navigation'
import toHref from '@/lib/route'

export default function ProductDropdown({ id, value, onSelect, placeholder = 'Item…', triggerClassName }: { id?: string; value?: string; onSelect: (id: string) => void; placeholder?: string; triggerClassName?: string }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [items, setItems] = useState<Array<{ name: string; type?: string }>>([])
  const [q, setQ] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createPrefill, setCreatePrefill] = useState<string | undefined>(undefined)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLInputElement | null>(null)
  // menuStyle removed; Popover handles positioning
  const router = useRouter()

  // click-outside handled by Popover

  useEffect(() => {
    if (!open) return
    // defensive checks (previously logged during test debugging)
    let alive = true;
    (async () => {
      try {
        const url = '/api/reports/product-service-list' + (q ? '?q=' + encodeURIComponent(q) : '')
        // defend against non-callable global.fetch in tests / weird environments
        if (typeof fetch !== 'function') {
          // avoid throwing "true is not a function" when fetch has been clobbered
          if (alive) setItems([])
          return
        }
        const res = await fetch(url)
        if (!alive) return
        const json = await res.json()
        setItems(Array.isArray(json.rows) ? json.rows : [])
      } catch {
        if (alive) setItems([])
      }
    })()
    return () => { alive = false }
  }, [open, q])

  // Positioning and close-on-scroll handled by Popover wrapper

  function handleSelect(name: string) {
    onSelect(name)
    setOpen(false)
    setActiveIndex(null)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setOpen(true)
        setActiveIndex(0)
      }
      return
    }

    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); setActiveIndex(null); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(prev => (prev === null ? 0 : Math.min(items.length - 1, prev + 1))); return }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(prev => (prev === null ? items.length - 1 : Math.max(0, prev - 1))); return }
    if (e.key === 'Enter' && activeIndex !== null) { e.preventDefault(); handleSelect(items[activeIndex].name); return }
  }

  return (
    <div className="relative" ref={rootRef}>
      <div className="flex items-center gap-2">
        <input
          ref={triggerRef}
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          value={q || value || ''}
          placeholder={placeholder}
          onChange={(e) => { setQ(e.target.value); if (!open) setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          type="text"
          className={`w-full text-left bg-white border border-slate-200 flex items-center justify-between focus:ring-2 focus:ring-sky-400/50 ${triggerClassName ?? 'rounded-none px-1 py-1 text-[13.5px]'}`}
        />
      </div>
      <Popover
        open={open}
        anchorRef={triggerRef}
        onClose={() => {
          const trimmed = q.trim()
          const hasMatches = items.length > 0
          setOpen(false)
          setActiveIndex(null)
          triggerRef.current?.blur()
          if (trimmed !== '' && !hasMatches) {
            setQ('')
            setCreatePrefill(trimmed)
            setShowCreateModal(true)
          }
        }}
        matchWidth
        className={`bg-white rounded-xl border border-slate-200 shadow-lg transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="max-h-44 overflow-auto py-1">
          {items.length === 0 ? (
            <div className="text-sm text-slate-500 px-3 py-2">No items</div>
          ) : items.map((c, i) => (
            <button key={`${c.name}-${i}`} role="option" aria-selected={activeIndex === i} type="button" onMouseEnter={() => setActiveIndex(i)} onClick={() => handleSelect(c.name)} className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${activeIndex === i ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' : 'hover:bg-slate-50'}`}>{c.name}</button>
          ))}
          </div>
          <div className="border-t border-slate-100 px-3 py-2">
            <button type="button" className="w-full text-sm text-sky-600 hover:underline" onClick={() => { setOpen(false); router.push(toHref('/sales/products-services/new')) }}>+ Add new</button>
          </div>
        </Popover>
      <CreateProductModal
        open={showCreateModal}
        defaultName={createPrefill}
        onClose={() => setShowCreateModal(false)}
        onCreated={(created: any) => {
          if (created?.name) {
            onSelect(created.name)
            setQ(created.name)
          }
        }}
      />
    </div>
  )
}
