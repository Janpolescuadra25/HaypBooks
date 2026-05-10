'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'

export interface HaypAccountOption {
  value: string
  label: string
}

interface HaypAccountPickerProps {
  id?: string
  label?: string
  value: string
  options: HaypAccountOption[]
  loading?: boolean
  disabled?: boolean
  placeholder?: string
  createLabel?: string
  onChange: (value: string) => void
  onOpen?: () => void
  onCreateNew?: () => void
}

export default function HaypAccountPicker({
  id,
  label,
  value,
  options,
  loading = false,
  disabled = false,
  placeholder = 'Search accounts…',
  createLabel = '+ Create New Account',
  onChange,
  onOpen,
  onCreateNew,
}: HaypAccountPickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return
      if (rootRef.current.contains(event.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    if (open) onOpen?.()
  }, [open, onOpen])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (disabled && open) setOpen(false)
  }, [disabled, open])

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.label.toLowerCase().includes(q))
  }, [options, query])

  return (
    <div ref={rootRef} className="relative">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        type="text"
        value={open ? query : selected?.label ?? query}
        onFocus={() => {
          if (disabled) return
          if (!open && selected && query === '') {
            setQuery(selected.label)
          }
          setOpen(true)
        }}
        onChange={(e) => {
          if (disabled) return
          setQuery(e.target.value)
          if (!open) setOpen(true)
        }}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500/50 focus:outline-none transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
      />

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-3 text-xs text-slate-500 text-center">Loading accounts...</p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-slate-500 text-center">No accounts found</p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors border-b border-slate-100 last:border-b-0"
                >
                  <span className="text-sm font-medium text-slate-900">{option.label}</span>
                </button>
              ))
            )}
          </div>

          {onCreateNew ? (
            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onCreateNew()
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Plus size={12} />
                {createLabel}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
