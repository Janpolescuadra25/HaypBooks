import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
// Popover handles portal rendering
import Popover from './Popover'
import CreateCustomerModal from './CreateCustomerModal'
import toHref from '@/lib/route'

export default function CustomerDropdown({ id, value, onSelect, customers, ariaDescribedBy, placeholder = 'Select…' }: { id?: string; value: string; onSelect: (id: string) => void; customers: Array<{ id: string; name: string }> ; ariaDescribedBy?: string; placeholder?: string }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  // menu DOM handled by Popover
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createPrefill, setCreatePrefill] = useState<string | undefined>(undefined)

  // click-outside and scroll-close are handled by Popover wrapper

  function handleSelect(id: string) {
    onSelect(id)
    const found = customers.find(c => c.id === id)
    if (found) setQ(found.name)
    setOpen(false)
    setActiveIndex(null)
  }

  const filtered = q.trim() === '' ? customers : customers.filter(c => c.name.toLowerCase().includes(q.trim().toLowerCase()))

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
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(prev => (prev === null ? 0 : Math.min(filtered.length - 1, prev + 1))); return }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(prev => (prev === null ? filtered.length - 1 : Math.max(0, prev - 1))); return }
    if (e.key === 'Enter' && activeIndex !== null) { e.preventDefault(); handleSelect(filtered[activeIndex].id); return }
  }



  // Positioning handled by Popover; keep menuStyle for SSR inline fallback in case

  // When user can type: show a text input. Keep existing selected name in q when value changes.
  useEffect(() => {
    // if a specific customer is selected, reflect that in the search string
    const found = customers.find(c => c.id === value)
    if (found) setQ(found.name)
  }, [value, customers])

  

  return (
    <div className="relative" ref={rootRef}>
      <div className="flex items-center gap-2">
        <input
          id={id}
          ref={inputRef}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-describedby={ariaDescribedBy}
          value={q}
          placeholder={placeholder}
          onChange={(e) => { setQ(e.target.value); if (!open) setOpen(true) }}
          onKeyDown={(e) => {
            // delegate arrow/enter/escape behavior to existing handler
            handleKeyDown(e as any)
          }}
          onFocus={() => setOpen(true)}
          type="text"
          className="w-full text-left rounded-xl bg-white border border-slate-200 px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
        />
        <button type="button" aria-label="Clear search" title="Clear search" className="w-7 h-7 flex items-center justify-center" onClick={() => { setQ(''); setActiveIndex(null); }}>
          ×
        </button>
      </div>
      <Popover
        open={open}
        anchorRef={inputRef}
        onClose={() => {
          // When the dropdown closes (click outside / scroll), enforce that
          // unmatched typed text cannot remain — clear it and prompt creation.
          const trimmed = q.trim()
          const hasMatches = trimmed === '' ? customers.length > 0 : filtered.length > 0
          setOpen(false)
          setActiveIndex(null)
          inputRef.current?.blur()
          if (trimmed !== '' && !hasMatches) {
            // clear the typed value and show the modal to create a new customer
            setQ('')
            setCreatePrefill(trimmed)
            setShowCreateModal(true)
          }
        }}
        matchWidth
        className={`bg-white rounded-xl border border-slate-200 shadow-lg transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div role="listbox" aria-label="Customer list" className="bg-white rounded-xl border border-slate-200 shadow-lg">
          <div className="max-h-44 overflow-auto py-1">
            {filtered.length === 0 ? (
              q.trim() === '' ? (
                <div className="text-sm text-slate-500 px-3 py-2">No customers</div>
              ) : (
                <div className="px-3 py-2 text-sm text-slate-700">No matches for <strong>{q}</strong></div>
              )
            ) : filtered.map((c, idx) => (
              <button
                key={c.id}
                id={`cust-${c.id}`}
                role="option"
                aria-selected={activeIndex !== null && filtered[activeIndex]?.id === c.id}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelect(c.id)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${activeIndex !== null && filtered[activeIndex]?.id === c.id ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' : 'hover:bg-slate-50'}`}
              >{c.name}</button>
            ))}
          </div>
          <div className="border-t border-slate-100 px-3 py-2">
            {filtered.length === 0 && q.trim() !== '' ? (
              <div className="flex flex-col items-center gap-2">
                <div className="text-sm text-slate-600">No customers match<span className="font-medium"> "{q}"</span></div>
                <button type="button" className="w-full text-sm text-sky-600 hover:underline" onClick={() => { setOpen(false); setCreatePrefill(q.trim()); setShowCreateModal(true) }}>{`+ Add new customer "${q.trim()}"`}</button>
              </div>
            ) : (
              <button type="button" className="w-full text-sm text-sky-600 hover:underline" onClick={() => { setOpen(false); setCreatePrefill(undefined); setShowCreateModal(true) }}>+ Add new</button>
            )}
          </div>
        </div>
      </Popover>
      <CreateCustomerModal
        open={showCreateModal}
        defaultName={createPrefill}
        onClose={() => setShowCreateModal(false)}
        onCreated={(created: any) => {
          // If the dropdown provided an onSelect, use the created entity
          if (created?.id) {
            onSelect(created.id)
            setQ(created.name || '')
          }
        }}
      />
    </div>
  )
}
