'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, User } from 'lucide-react'

export interface CustomerPickerOption {
  id: string
  name: string
  email?: string
}

interface CustomerPickerFieldProps {
  label: string
  value: string
  customers: CustomerPickerOption[]
  loading?: boolean
  disabled?: boolean
  placeholder?: string
  createLabel?: string
  onChange: (id: string) => void
  onOpen?: () => void
  onCreateNew?: () => void
}

export default function CustomerPickerField({
  label,
  value,
  customers,
  loading = false,
  disabled = false,
  placeholder = 'Select customer...',
  createLabel = '+ Create New',
  onChange,
  onOpen,
  onCreateNew,
}: CustomerPickerFieldProps) {
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
    () => customers.find((c) => c.id === value) ?? null,
    [customers, value]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => {
      return c.name.toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q)
    })
  }, [customers, query])

  return (
    <div ref={rootRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={open ? query : selected?.name ?? query}
        onFocus={() => {
          if (disabled) return
          if (!open && selected && query === '') {
            setQuery(selected.name)
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
        className="w-full h-10 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/10 bg-white focus:border-emerald-400/50 transition-all disabled:bg-gray-50 disabled:text-gray-500"
      />

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-3 text-xs text-gray-500 text-center">Loading customers...</p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-500 text-center">No customers found</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onChange(c.id)
                    setQuery(c.name)
                    setOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  {c.email ? <p className="text-xs text-gray-500">{c.email}</p> : null}
                </button>
              ))
            )}
          </div>

          {onCreateNew ? (
            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onCreateNew()
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Plus size={12} />
                {createLabel}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {!selected && !open ? (
        <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
          <User size={11} />
          Choose a customer before saving
        </p>
      ) : null}
    </div>
  )
}
