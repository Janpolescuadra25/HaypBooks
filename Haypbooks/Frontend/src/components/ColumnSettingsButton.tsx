"use client"

import { useEffect, useId, useRef, useState } from 'react'
import Popover from './Popover'

type ColumnOption = { key: string; label: string; required?: boolean }

export function ColumnSettingsButton({
  options,
  value,
  onChange,
  controlsId,
  disabled,
}: {
  options: ColumnOption[]
  value: string[]
  onChange: (next: string[]) => void
  controlsId?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popupId = useId()

  // click-outside handled by Popover

  useEffect(() => {
    if (open && panelRef.current) {
      // Focus first available checkbox for accessibility
      const first = panelRef.current.querySelector<HTMLInputElement>('input[type="checkbox"]:not(:disabled)')
      first?.focus()
    }
  }, [open])

  function toggle(k: string) {
    const opt = options.find(o => o.key === k)
    if (opt?.required) return
    if (value.includes(k)) onChange(value.filter(v => v !== k))
    else onChange([...value, k])
  }

  return (
    <div className="relative">
      {/* eslint-disable-next-line jsx-a11y/aria-proptypes */}
      <button
        ref={triggerRef}
        onClick={() => !disabled && setOpen(v => !v)}
        className="inline-flex items-center rounded-lg border border-slate-200 bg-white/80 p-1.5 hover:bg-white disabled:opacity-50"
        aria-haspopup="dialog"
        aria-label="Column settings"
        title="Column settings"
        aria-controls={controlsId || popupId}
        disabled={!!disabled}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-slate-700"><path fill="currentColor" d="M3 5h18v2H3V5Zm4 6h10v2H7v-2Zm-2 6h14v2H5v-2Z"/></svg>
        <span className="sr-only">Column settings</span>
      </button>
      <Popover open={open} anchorRef={triggerRef} onClose={() => { setOpen(false); triggerRef.current?.blur() }} matchWidth={false} className="right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
        <div
          id={controlsId || popupId}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          ref={panelRef}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation()
              setOpen(false)
            }
          }}
        >
          <div className="px-2 py-1 text-xs font-semibold text-slate-500">Columns</div>
          <ul className="max-h-64 overflow-auto">
            {options.map(opt => (
              <li key={opt.key} className="flex items-center gap-2 px-2 py-1">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={value.includes(opt.key) || !!opt.required}
                  onChange={() => toggle(opt.key)}
                  disabled={!!opt.required}
                  id={`col-${opt.key}`}
                />
                <label htmlFor={`col-${opt.key}`} className="select-none text-sm text-slate-800">
                  {opt.label}{opt.required ? ' (required)' : ''}
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-end gap-2 px-2">
            <button onClick={() => setOpen(false)} className="rounded-md border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50">Close</button>
          </div>
        </div>
      </Popover>
    </div>
  )
}
