'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus } from 'lucide-react'

export interface HaypAccount {
  id: string
  code?: string
  name?: string
}

interface HaypAccountPickerProps {
  label?: string
  value: string
  accounts: HaypAccount[]
  placeholder?: string
  disabled?: boolean
  onChange: (accountId: string) => void
  onCreateNew?: () => void
  createLabel?: string
}

export default function HaypAccountPicker({
  label,
  value,
  accounts,
  placeholder = 'Search accounts…',
  disabled = false,
  onChange,
  onCreateNew,
  createLabel = '+ New Account',
}: HaypAccountPickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLInputElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    const updatePosition = () => {
      if (!open || !triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }

    updatePosition()

    if (!open) return

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (dropdownRef.current?.contains(target)) return
      setOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (disabled && open) setOpen(false)
  }, [disabled, open])

  const selected = useMemo(
    () => accounts.find((account) => account.id === value) ?? null,
    [accounts, value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return accounts
    return accounts.filter((account) => {
      const label = `${account.code ? `${account.code} ` : ''}${account.name ?? ''}`.toLowerCase()
      return label.includes(q)
    })
  }, [accounts, query])

  const selectedLabel = selected ? `${selected.code ? `${selected.code} ` : ''}${selected.name ?? ''}` : ''

  const dropdown = open && !disabled ? createPortal(
    <div
      ref={dropdownRef}
      style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
      className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
    >
      <div className="max-h-60 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-3 py-3 text-xs text-slate-500 text-center">No accounts found</p>
        ) : (
          filtered.map((account) => {
            const label = `${account.code ? `${account.code} ` : ''}${account.name ?? ''}`
            return (
              <button
                key={account.id}
                type="button"
                onClick={() => {
                  onChange(account.id)
                  setOpen(false)
                }}
                className={`w-full px-3 py-2 text-left transition-colors border-b border-slate-100 last:border-b-0 ${value === account.id ? 'bg-emerald-50' : 'hover:bg-emerald-50'}`}
              >
                <span className="text-sm font-medium text-slate-900">{label}</span>
              </button>
            )
          })
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
    </div>,
    document.body,
  ) : null

  return (
    <div ref={rootRef} className="relative">
      {label ? (
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      ) : null}
      <input
        ref={triggerRef}
        type="text"
        value={open ? query : selectedLabel ?? query}
        onFocus={() => {
          if (disabled) return
          if (!open && selected && query === '') {
            setQuery(selectedLabel)
          }
          setOpen(true)
        }}
        onChange={(e) => {
          if (disabled) return
          setQuery(e.target.value)
          if (!open) setOpen(true)
        }}
        onKeyDown={(event) => {
          if (disabled) return
          if (event.key === 'Escape') {
            setOpen(false)
            return
          }
          if (event.key === 'Enter' && open) {
            event.preventDefault()
            const first = filtered[0]
            if (first) {
              onChange(first.id)
              setOpen(false)
            }
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
      />
      {dropdown}
    </div>
  )
}
