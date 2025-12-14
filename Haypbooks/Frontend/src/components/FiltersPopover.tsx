"use client"
import { useEffect, useId, useRef, useState } from 'react'
import Popover from './Popover'

export default function FiltersPopover({
  label = 'Filters',
  children,
}: {
  label?: string
  children: ({ close }: { close: () => void }) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const panelId = useId()

  // Move focus to panel on open and back to button on close
  useEffect(() => {
    if (open) {
      // Wait a tick to ensure panel is in DOM
      const t = setTimeout(() => {
        const panel = panelRef.current
        if (!panel) return
        // Try first focusable; fallback to panel
        const focusables = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusables[0]
        ;(first ?? panel).focus()
      }, 0)
      return () => clearTimeout(t)
    } else {
      btnRef.current?.focus()
    }
  }, [open])
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onClick(e: MouseEvent) {
      if (!open) return
      const t = e.target as Node
      if (panelRef.current && !panelRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  // Trap focus within the panel when open
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.hasAttribute('disabled'))
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          last.focus()
          e.preventDefault()
        }
      } else {
        if (active === last || !panel.contains(active)) {
          first.focus()
          e.preventDefault()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])
  return (
    <div className="relative inline-block">
      {open ? (
        <button
          ref={btnRef}
          type="button"
          className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white"
          onClick={() => setOpen(false)}
          aria-haspopup="dialog"
          aria-expanded="true"
          aria-controls={panelId}
        >
          {label}
        </button>
      ) : (
        <button
          ref={btnRef}
          type="button"
          className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-sm hover:bg-white"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded="false"
        >
          {label}
        </button>
      )}
      <Popover open={open} anchorRef={btnRef} onClose={()=> setOpen(false)} matchWidth={false} className="mt-2 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white p-3 shadow-glass">
        <div ref={panelRef} id={panelId} role="dialog" aria-modal="true" aria-label={`${label} panel`} tabIndex={-1}>
          {children({ close: () => setOpen(false) })}
        </div>
      </Popover>
    </div>
  )
}