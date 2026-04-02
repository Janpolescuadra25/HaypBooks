'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Account {
  id: string
  code: string
  name: string
  type?: string
}

interface AccountSelectProps {
  value: string
  accounts: Account[]
  onChange: (value: string) => void
  disabled?: boolean
}

interface DropdownPos {
  top: number
  left: number
  width: number
  openUp: boolean
}

export default function AccountSelect({ value, accounts, onChange, disabled }: AccountSelectProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [pos, setPos] = useState<DropdownPos | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = accounts.find(a => a.id === value)

  const filtered = search.trim()
    ? accounts.filter(
        a =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.code.toLowerCase().includes(search.toLowerCase())
      )
    : accounts

  const calcPos = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const dropHeight = 260 // approx panel height
    const openUp = spaceBelow < dropHeight && rect.top > dropHeight
    setPos({
      top: openUp ? rect.top + window.scrollY - dropHeight - 4 : rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
      openUp,
    })
  }, [])

  function handleOpen() {
    calcPos()
    setOpen(o => !o)
  }

  useEffect(() => {
    if (!open) return
    if (searchRef.current) searchRef.current.focus()

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setOpen(false)
        setSearch('')
      }
    }
    function handleScroll() { calcPos() }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', calcPos)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [open, calcPos])

  function handleSelect(id: string) {
    onChange(id)
    setOpen(false)
    setSearch('')
  }

  const panel = open && pos ? (
    <div
      ref={panelRef}
      style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
      className="bg-white border border-gray-200 rounded-lg shadow-xl"
    >
      {/* Search */}
      <div className="p-1.5 border-b border-gray-100">
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search accounts…"
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>

      {/* Options – capped at 192px */}
      <ul className="max-h-48 overflow-y-auto py-0.5">
        <li>
          <button
            type="button"
            onClick={() => handleSelect('')}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-400 hover:bg-emerald-50"
          >
            Select account…
          </button>
        </li>
        {filtered.length === 0 && (
          <li className="px-3 py-2 text-xs text-gray-400">No accounts found</li>
        )}
        {filtered.map(a => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => handleSelect(a.id)}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-emerald-50 transition-colors ${
                a.id === value ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-gray-700'
              }`}
            >
              <span className="font-mono text-xs text-gray-500 mr-1.5">{a.code}</span>
              {a.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Create new account footer */}
      <div className="border-t border-gray-100 p-1">
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            router.push('/accounting/core-accounting/chart-of-accounts')
          }}
          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
        >
          <Plus size={13} />
          Create new account
        </button>
      </div>
    </div>
  ) : null

  return (
    <div className="relative w-full">
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={disabled ? undefined : handleOpen}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1.5 text-sm text-left border rounded focus:outline-none transition-colors ${
          disabled
            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white border-gray-200 hover:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30'
        }`}
      >
        <span className={selected ? 'text-gray-800 truncate' : 'text-gray-400'}>
          {selected ? `${selected.code} – ${selected.name}` : 'Select account…'}
        </span>
        <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Portal-rendered dropdown — escapes table overflow clipping */}
      {typeof document !== 'undefined' && panel
        ? createPortal(panel, document.body)
        : null}
    </div>
  )
}
