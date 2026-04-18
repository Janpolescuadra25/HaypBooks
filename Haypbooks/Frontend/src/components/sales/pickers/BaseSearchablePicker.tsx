'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'
import apiClient from '@/lib/api-client'
import type { PickerOption, PickerProps } from './types'

interface BaseSearchablePickerProps extends PickerProps {
  searchEndpoint: (companyId: string, search: string, filters?: Record<string, string>) => string
  mapResponseToOptions: (responseData: any) => PickerOption[]
  emptyMessage?: string
  onAddNew?: (() => void)
  createLabel?: string
  compact?: boolean
}

const SEARCH_DEBOUNCE_MS = 300

export default function BaseSearchablePicker({
  companyId,
  value,
  onChange,
  label,
  placeholder = label ?? 'Select an option...',
  required = false,
  disabled = false,
  filters,
  error,
  className,
  testId,
  searchEndpoint,
  mapResponseToOptions,
  emptyMessage = 'No matching results',
  onAddNew,
  createLabel,
  compact = false,
}: BaseSearchablePickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
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
    const top = rect.bottom + 4

    if (compact) {
      setDropdownStyle({
        top,
        left: rect.left,
        width: Math.max(rect.width, 200),
      })
      return
    }

    const viewportPadding = 8
    const width = Math.min(Math.max(rect.width, 260), window.innerWidth - viewportPadding * 2)
    const left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - width - viewportPadding))

    setDropdownStyle({
      top,
      left,
      width,
    })
  }, [compact])

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
    if (!open || compact) {
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
  }, [compact, open])

  useEffect(() => {
    if (!open) return

    if (compact) {
      void fetchOptions('')
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void fetchOptions(query)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [compact, fetchOptions, open, query])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

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
  const inputValue = open ? query : triggerLabel
  const setTriggerRef = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node
  }, [])

  const toggleOpen = useCallback(() => {
    if (shouldDisable) return
    setOpen((prev) => {
      const next = !prev
      if (next) setQuery('')
      return next
    })
  }, [shouldDisable])

  const selectOption = useCallback(
    (option: PickerOption) => {
      setSelectedOption(option)
      setOpen(false)
      setQuery('')
      onChange(option.id, option)
    },
    [onChange]
  )

  const onInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (shouldDisable) return

      if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
        event.preventDefault()
        setOpen(true)
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }

      if (!open && (event.key === 'Backspace' || event.key === 'Delete') && selectedOption) {
        setSelectedOption(null)
        onChange('', { id: '', primaryLabel: '' })
        setQuery('')
      }

      if (options.length === 0) return
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

      if (event.key === 'Enter' && open) {
        event.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          selectOption(options[highlightedIndex])
        }
      }
    },
    [highlightedIndex, onChange, options.length, open, selectedOption, shouldDisable, selectOption]
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

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`.trim()} data-testid={testId}>
      {label ? (
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required ? ' *' : ''}
        </label>
      ) : null}

      {compact ? (
        <button
          ref={setTriggerRef}
          type="button"
          onClick={toggleOpen}
          disabled={shouldDisable}
          aria-label={label ?? placeholder}
          title={triggerLabel}
          data-testid={testId}
          className="flex h-8 w-full cursor-pointer items-center justify-between gap-2 rounded border border-gray-300 bg-white px-2.5 text-left text-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <span className={`min-w-0 flex-1 truncate ${hasValue ? 'text-slate-800' : 'text-slate-400'}`}>
            {triggerLabel}
          </span>
          <ChevronDown size={14} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <div
          ref={setTriggerRef}
          className="flex h-8 items-center rounded-lg border border-emerald-100 bg-white transition-colors focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-500/30"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(event) => {
              if (shouldDisable) return
              setQuery(event.target.value)
              if (!open) setOpen(true)
            }}
            onFocus={() => {
              if (shouldDisable) return
              setOpen(true)
              setQuery('')
            }}
            onKeyDown={onInputKeyDown}
            onBlur={() => {
              setTimeout(() => {
                if (!rootRef.current?.contains(document.activeElement as Node)) {
                  setOpen(false)
                }
              }, 100)
            }}
            placeholder={placeholder}
            disabled={shouldDisable}
            className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400"
            data-testid={testId}
          />

          {hasValue && !shouldDisable ? (
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex h-8 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-emerald-50 hover:text-slate-600"
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          ) : null}

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={toggleOpen}
            disabled={shouldDisable}
            aria-label="Toggle options"
            className="inline-flex h-8 w-8 items-center justify-center rounded-r-lg text-slate-400 hover:bg-emerald-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {shouldDisable ? null : open ? createPortal(
        <div
          ref={dropdownRef}
          onMouseDown={(event) => event.preventDefault()}
          style={{
            position: 'fixed',
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            width: dropdownStyle.width,
            zIndex: 9999,
          }}
          className="rounded-lg border border-gray-200 bg-white shadow-xl"
        >
          <div className="max-h-60 overflow-auto">
            {loading && options.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-slate-500">Searching...</p>
            ) : fetchError ? (
              <p className="px-3 py-4 text-center text-xs text-rose-500">{fetchError}</p>
            ) : options.length === 0 ? (
              <>
                {onAddNew ? (
                  <div className="border-b border-slate-100 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        onAddNew()
                      }}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <Plus size={12} />
                      {createLabel ?? `+ Add new ${label ?? 'option'}`}
                    </button>
                  </div>
                ) : null}
                <p className="px-3 py-4 text-center text-xs text-slate-500">{emptyMessage}</p>
              </>
            ) : (
              <>
                {options.map((option, index) => (
                  <button
                    key={option.id}
                    id={`option-${option.id}`}
                    ref={(element) => {
                      optionRefs.current[index] = element
                    }}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => selectOption(option)}
                    className={`w-full border-b border-slate-100 px-3 py-2 text-left last:border-b-0 ${
                      highlightedIndex === index ? 'bg-emerald-50' : 'hover:bg-emerald-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="whitespace-normal break-words text-sm font-semibold text-slate-900">{option.primaryLabel}</p>
                        {option.secondaryLabel ? (
                          <p className="mt-0.5 whitespace-normal break-words text-xs text-slate-500">{option.secondaryLabel}</p>
                        ) : null}
                      </div>
                      {option.tertiaryLabel ? (
                        <span className="shrink-0 text-xs text-slate-500">{option.tertiaryLabel}</span>
                      ) : null}
                    </div>
                  </button>
                ))}
                {onAddNew ? (
                  <div className="border-t border-slate-100 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        onAddNew()
                      }}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <Plus size={12} />
                      {createLabel ?? `+ Add new ${label ?? 'option'}`}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>, document.body
      ) : null}

      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : null}
    </div>
  )
}