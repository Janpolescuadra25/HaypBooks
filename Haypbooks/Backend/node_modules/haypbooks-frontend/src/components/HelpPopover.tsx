"use client"
import React from 'react'
import Popover from './Popover'

type HelpPopoverProps = {
  ariaLabel?: string
  buttonAriaLabel?: string
  children: React.ReactNode
  storageKey?: string // if provided, respect localStorage 'dontShowAgain' flag
}

export default function HelpPopover({ ariaLabel = 'Help', buttonAriaLabel = 'Show help', children, storageKey }: HelpPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const [dontShow, setDontShow] = React.useState(false)
  const btnRef = React.useRef<HTMLButtonElement | null>(null)
  const panelRef = React.useRef<HTMLDivElement | null>(null)

  // Initialize \"don't show again\" from localStorage
  React.useEffect(() => {
    if (!storageKey) return
    try {
      const v = localStorage.getItem(`help:${storageKey}:hide`)
      if (v === '1') setDontShow(true)
    } catch {}
  }, [storageKey])

  // Note: opting out prevents future opens, but does not auto-close an already open dialog

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="dialog"
        // omit aria-expanded to satisfy strict linting rules
        aria-label={buttonAriaLabel}
        onClick={() => { if (!dontShow) setOpen(v => !v) }}
        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 hover:bg-white h-8 w-8"
        title="Help"
      >
        ?
      </button>
      {open && (
        <Popover open={open} anchorRef={btnRef} onClose={() => { setOpen(false); btnRef.current?.focus() }} matchWidth={false} className="mt-2 w-96 max-w-[90vw] rounded-xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur p-4 text-sm text-slate-800 z-[9999]">
          <div
            ref={panelRef}
            role="dialog"
            aria-label={ariaLabel}
            onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); btnRef.current?.focus() } }}
          >
            <div className="max-h-[60vh] overflow-auto pr-1">
              {children}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              {storageKey && (
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={dontShow}
                    onChange={(e) => {
                      const val = e.target.checked
                      setDontShow(val)
                      try { localStorage.setItem(`help:${storageKey}:hide`, val ? '1' : '0') } catch {}
                    }}
                  />
                  Don’t show again
                </label>
              )}
              <button className="ml-auto rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-white" onClick={() => { setOpen(false); btnRef.current?.focus() }}>Close</button>
            </div>
          </div>
        </Popover>
      )}
    </div>
  )
}
