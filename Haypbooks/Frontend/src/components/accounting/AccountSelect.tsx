'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

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
}

export default function AccountSelect({ value, accounts, onChange }: AccountSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = accounts.find(a => a.id === value)

  const filtered = search.trim()
    ? accounts.filter(
        a =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.code.toLowerCase().includes(search.toLowerCase())
      )
    : accounts

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(id: string) {
    onChange(id)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-1 px-2 py-1.5 text-sm text-left bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30 hover:border-emerald-400 transition-colors"
      >
        <span className={selected ? 'text-gray-800 truncate' : 'text-gray-400'}>
          {selected ? `${selected.code} – ${selected.name}` : 'Select account…'}
        </span>
        <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Search box */}
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
          {/* Options list – capped at 192px (~8 rows) */}
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
        </div>
      )}
    </div>
  )
}
