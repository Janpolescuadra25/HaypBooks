'use client'

import React, { useCallback, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import Popover from '@/components/Popover'
import { cn } from '@/lib/utils'

export interface HaypSelectOption {
  value: string
  label: string
}

interface HaypSelectProps {
  value: string
  onChange: (value: string) => void
  options: HaypSelectOption[]
  placeholder?: string
  label?: string
  disabled?: boolean
  required?: boolean
  className?: string
  id?: string
}

export default function HaypSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  disabled = false,
  required = false,
  className,
  id,
}: HaypSelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const selectedLabel = options.find((o) => o.value === value)?.label ?? null

  const close = useCallback(() => {
    setOpen(false)
    setHighlightedIndex(-1)
  }, [])

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange(optValue)
      close()
      triggerRef.current?.focus()
    },
    [onChange, close],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open && highlightedIndex >= 0) {
          handleSelect(options[highlightedIndex].value)
        } else {
          setOpen(true)
          setHighlightedIndex(options.findIndex((o) => o.value === value))
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setHighlightedIndex(0)
          return
        }
        setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setHighlightedIndex(options.length - 1)
          return
        }
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'Tab':
        close()
        break
    }
  }

  const isEmpty = !value && required

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          if (open) {
            close()
          } else {
            setOpen(true)
            setHighlightedIndex(options.findIndex((o) => o.value === value))
          }
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-left flex items-center justify-between gap-2 outline-none transition-all cursor-pointer',
          open ? 'border-emerald-500 ring-2 ring-emerald-500/10' : '',
          isEmpty ? 'border-rose-300' : '',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
      >
        <span className={cn('truncate', selectedLabel ? 'text-slate-900' : 'text-slate-400')}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-slate-400 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      <Popover
        open={open}
        anchorRef={triggerRef as unknown as React.RefObject<HTMLElement>}
        onClose={close}
        matchWidth
        className="bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[100050]"
      >
        <div role="listbox" className="max-h-56 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">No options</div>
          ) : (
            options.map((opt, idx) => {
              const isSelected = opt.value === value
              const isHighlighted = highlightedIndex === idx
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer flex items-center justify-between gap-2 select-none',
                    isSelected
                      ? 'text-emerald-600 font-medium bg-emerald-50'
                      : isHighlighted
                        ? 'bg-slate-50 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={13} className="shrink-0 text-emerald-500" />}
                </div>
              )
            })
          )}
        </div>
      </Popover>
    </div>
  )
}
