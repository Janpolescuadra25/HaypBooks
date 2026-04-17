'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { ChevronDown, Loader2, Search, X } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { PickerOption, PickerProps } from './types'

interface BaseSearchablePickerProps extends PickerProps {
  searchEndpoint: (companyId: string, search: string, filters?: Record<string, string>) => string
  mapResponseToOptions: (responseData: any) => PickerOption[]
  emptyMessage?: string
}

const SEARCH_DEBOUNCE_MS = 300

export default function BaseSearchablePicker({
  companyId,
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  required = false,
  disabled = false,
  filters,
  error,
  className,
  testId,
  searchEndpoint,
  mapResponseToOptions,
  emptyMessage = 'No matching results',
}: BaseSearchablePickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 })

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<PickerOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<PickerOption | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [fetchError, setFetchError] = useState('')

  const hasValue = Boolean(value)

  const fetchOptions = useCallback(
    async (searchTerm: string) => {
      if (!companyId || disabled) return

      const requestId = ++requestIdRef.current
      setLoading(true)
      setFetchError('')

      try {
        const url = searchEndpoint(companyId, searchTerm.trim(), filters)
        const { data } = await apiClient.get(url)
        if (requestId !== requestIdRef.current) return

        const nextOptions = mapResponseToOptions(data)
        setOptions(nextOptions)
        setHighlightedIndex(nextOptions.length > 0 ? 0 : -1)

        if (value) {
          const matched = nextOptions.find((opt) => opt.id === value)
          if (matched) setSelectedOption(matched)
        }
      } catch (err: any) {
        if (requestId !== requestIdRef.current) return
        setOptions([])
        setHighlightedIndex(-1)
        setFetchError(err?.response?.data?.message ?? 'Failed to load options')
      } finally {
        if (requestId === requestIdRef.current) setLoading(false)
      }
    },
    [companyId, disabled, filters, mapResponseToOptions, searchEndpoint, value]
  )

  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const width = Math.min(rect.width, window.innerWidth - 16)
    const left = Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth - width - 8))
    setDropdownStyle({
      top: rect.bottom + window.scrollY,
      left,
      width,
    })
  }, [])

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      if (dropdownRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setHighlightedIndex(-1)
      return
    }

    updateDropdownPosition()
    window.addEventListener('resize', updateDropdownPosition)
    window.addEventListener('scroll', updateDropdownPosition, true)
    return () => {
      window.removeEventListener('resize', updateDropdownPosition)
      window.removeEventListener('scroll', updateDropdownPosition, true)
    }
  }, [open, updateDropdownPosition])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setHighlightedIndex(-1)
      return
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus()
      const len = inputRef.current?.value.length ?? 0
      inputRef.current?.setSelectionRange(len, len)
    })
  }, [open])

  useEffect(() => {
    if (!open) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void fetchOptions(query)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [fetchOptions, open, query])

  useEffect(() => {
    if (!value) {
      setSelectedOption(null)
      return
    }
    if (selectedOption?.id === value) return

    const matched = options.find((opt) => opt.id === value)
    if (matched) {
      setSelectedOption(matched)
      return
    }

    setSelectedOption((prev) => (prev && prev.id === value ? prev : { id: value, primaryLabel: value }))
  }, [options, selectedOption, value])

  useEffect(() => {
    if (!open || highlightedIndex < 0) return

    requestAnimationFrame(() => {
      optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    })
  }, [highlightedIndex, open])

  const triggerLabel = useMemo(() => {
    if (!hasValue || !selectedOption) return placeholder
    return selectedOption.primaryLabel
  }, [hasValue, placeholder, selectedOption])

  const shouldDisable = disabled || !companyId
  const triggerText = !companyId ? 'Loading company...' : triggerLabel

  const onTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (shouldDisable) return

      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        setOpen(true)
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
    },
    [shouldDisable]
  )

  const selectOption = useCallback(
    (option: PickerOption) => {
      setSelectedOption(option)
      setOpen(false)
      setQuery('')
      onChange(option.id, option)
    },
    [onChange]
  )

  const clearSelection = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      setSelectedOption(null)
      setQuery('')
      setOpen(false)
      setOptions([])
      onChange('', { id: '', primaryLabel: '' })
    },
    [onChange]
  )

  const onSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!options.length) {
        if (event.key === 'Escape') setOpen(false)
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1))
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          selectOption(options[highlightedIndex])
        }
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
    },
    [highlightedIndex, options, selectOption]
  )

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`.trim()} data-testid={testId}>
      {label ? (
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required ? ' *' : ''}
        </label>
      ) : null}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          disabled={shouldDisable}
          onClick={() => {
            if (shouldDisable) return
            setOpen((prev) => !prev)
          }}
          onKeyDown={onTriggerKeyDown}
          className="flex w-full items-center rounded-lg border border-emerald-100 bg-white px-3 py-2 pr-16 text-left text-sm outline-none transition-colors hover:bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          aria-expanded={open ? 'true' : 'false'}
          aria-haspopup="listbox"
        >
          <span className={hasValue ? 'text-slate-900' : 'text-slate-400'}>{triggerText}</span>
        </button>

        {hasValue && !disabled ? (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-emerald-50 hover:text-slate-600"
            aria-label="Clear selection"
          >
            <X size={14} />
          </button>
        ) : null}

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {shouldDisable ? null : open ? createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            width: dropdownStyle.width,
            zIndex: 9999,
          }}
          className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl"
        >
          <div className="border-b border-emerald-100 p-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="Search..."
                className="w-full rounded-md border border-emerald-100 py-1.5 pl-8 pr-8 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              {loading ? (
                <Loader2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-emerald-600" />
              ) : null}
            </div>
          </div>

          <div
            role="listbox"
            aria-activedescendant={highlightedIndex >= 0 ? `option-${options[highlightedIndex]?.id}` : undefined}
            className="max-h-64 overflow-y-auto"
          >
            {loading && options.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-slate-500">Searching...</p>
            ) : fetchError ? (
              <p className="px-3 py-4 text-center text-xs text-rose-500">{fetchError}</p>
            ) : options.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-slate-500">{emptyMessage}</p>
            ) : (
              options.map((option, index) => (
                <button
                  key={option.id}
                  id={`option-${option.id}`}
                  ref={(element) => {
                    optionRefs.current[index] = element
                  }}
                  type="button"
                  role="option"
                  aria-selected={highlightedIndex === index ? 'true' : 'false'}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectOption(option)}
                  className={`flex w-full items-start justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left last:border-b-0 ${
                    highlightedIndex === index ? 'bg-emerald-50' : 'hover:bg-emerald-50/70'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{option.primaryLabel}</p>
                    {option.secondaryLabel ? (
                      <p className="truncate text-xs text-slate-500">{option.secondaryLabel}</p>
                    ) : null}
                  </div>
                  {option.tertiaryLabel ? (
                    <span className="shrink-0 text-xs text-slate-500">{option.tertiaryLabel}</span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>, document.body
      ) : null}

      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : null}
    </div>
  )
}