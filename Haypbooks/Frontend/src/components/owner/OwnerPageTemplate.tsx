'use client'
/**
 * OwnerPageTemplate — A reusable page shell for the HaypBooks Owner Hub.
 *
 * Provides: page header, search, advanced filters, data table with sorting/pagination,
 * bulk actions, CSV export, and create modal — all with consistent styling.
 *
 * Usage:
 *   <OwnerPageTemplate
 *     title="Vendors"
 *     description="Manage your vendor relationships and payment terms"
 *     icon={Building2}
 *     columns={[...]}
 *     data={vendors}
 *     onCreate={() => setShowModal(true)}
 *     onExport={() => handleExport()}
 *     filters={[...]}
 *     searchable
 *     searchableFields={[]}
 *     bulkActions={[...]}
 *   />
 */

'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, Plus, Download, Upload, Filter, X, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, MoreHorizontal, Edit2, Eye, Trash2,
  ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, RefreshCw,
  CheckSquare2, Square, Maximize2, Settings, HelpCircle, Columns3,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T = any> {
  key: string
  label: string
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T, index: number) => React.ReactNode
  type?: 'text' | 'number' | 'currency' | 'date' | 'status' | 'badge' | 'percentage'
  statusColors?: Record<string, string>
  hidden?: boolean
}

export interface FilterOption {
  key: string
  label: string
  type: 'select' | 'date-range' | 'checkbox' | 'text' | 'multi-select'
  options?: { label: string; value: string }[]
  placeholder?: string
}

export interface BulkAction {
  label: string
  icon?: React.ReactNode
  onClick: (selectedIds: string[]) => void
  variant?: 'default' | 'danger'
  requires?: (selected: any[]) => boolean
}

export interface SummaryCard {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  bg?: string
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface OwnerPageTemplateProps<T = any> {
  /** Page title */
  title: string
  /** Page description / subtitle */
  description?: string
  /** Section label for breadcrumb context */
  section?: string
  /** Page icon */
  icon?: React.ReactNode
  /** Table columns */
  columns: Column<T>[]
  /** Table data */
  data: T[]
  /** Unique ID field for selection */
  idField?: string
  /** Loading state */
  loading?: boolean
  /** Searchable */
  searchable?: boolean
  /** Fields to search through */
  searchableFields?: string[]
  /** Search placeholder */
  searchPlaceholder?: string
  /** Filter options */
  filters?: FilterOption[]
  /** Summary cards above table */
  summaryCards?: SummaryCard[]
  /** Bulk actions */
  bulkActions?: BulkAction[]
  /** Show create button */
  showCreate?: boolean
  /** Create button label */
  createLabel?: string
  /** Create button click handler */
  onCreate?: () => void
  /** Show export button */
  showExport?: boolean
  /** Export handler */
  onExport?: () => void
  /** Show import button */
  showImport?: boolean
  /** Import handler */
  onImport?: () => void
  /** Refresh handler */
  onRefresh?: () => void
  /** Help handler */
  onHelp?: () => void
  /** Empty state */
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: { label: string; onClick: () => void }
  /** Row click handler */
  onRowClick?: (row: T) => void
  /** Row menu items */
  rowMenuItems?: (row: T) => { label: string; icon?: React.ReactNode; onClick: () => void; variant?: 'default' | 'danger' }[]
  /** Selected row IDs */
  selectedIds?: string[]
  /** On selection change */
  onSelectionChange?: (ids: string[]) => void
  /** Pagination */
  pageSize?: number
  /** Custom empty state element */
  customEmpty?: React.ReactNode
  /** Footer content */
  footer?: React.ReactNode
  /** Top-right actions */
  headerActions?: React.ReactNode
  /** Children for additional content below the table */
  children?: React.ReactNode
  /** Master loading override (covers table only) */
  dataLoading?: boolean
}

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

function FilterDropdown({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
}: {
  filters: FilterOption[]
  activeFilters: Record<string, any>
  onFilterChange: (key: string, value: any) => void
  onClearAll: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeCount = Object.keys(activeFilters).filter(k => activeFilters[k] !== '' && activeFilters[k] !== null && activeFilters[k] !== undefined && activeFilters[k] !== false && !(Array.isArray(activeFilters[k]) && activeFilters[k].length === 0)).length

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
          activeCount > 0
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        <SlidersHorizontal size={14} />
        Filters
        {activeCount > 0 && (
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
            {activeCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filters</span>
              {activeCount > 0 && (
                <button onClick={onClearAll} className="text-[11px] text-rose-500 hover:text-rose-700 font-medium">
                  Clear all
                </button>
              )}
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {filters.map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                  {f.type === 'select' && (
                    <select
                      value={activeFilters[f.key] ?? ''}
                      onChange={e => onFilterChange(f.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    >
                      <option value="">{f.placeholder ?? `All ${f.label}`}</option>
                      {f.options?.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  )}
                  {f.type === 'text' && (
                    <input
                      value={activeFilters[f.key] ?? ''}
                      onChange={e => onFilterChange(f.key, e.target.value)}
                      placeholder={f.placeholder ?? `Filter by ${f.label.toLowerCase()}...`}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  )}
                  {f.type === 'date-range' && (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={activeFilters[`${f.key}_from`] ?? ''}
                        onChange={e => onFilterChange(`${f.key}_from`, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <input
                        type="date"
                        value={activeFilters[`${f.key}_to`] ?? ''}
                        onChange={e => onFilterChange(`${f.key}_to`, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  )}
                  {f.type === 'checkbox' && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!activeFilters[f.key]}
                        onChange={e => onFilterChange(f.key, e.target.checked)}
                        className="accent-emerald-600 w-4 h-4 rounded"
                      />
                      <span className="text-sm text-slate-700">{f.placeholder ?? 'Enable'}</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setOpen(false)}
                className="w-full px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Row Actions Menu ─────────────────────────────────────────────────────────

function RowActionsMenu<T>({
  items,
}: {
  items: { label: string; icon?: React.ReactNode; onClick: () => void; variant?: 'default' | 'danger' }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
      >
        <MoreHorizontal size={15} className="text-slate-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 min-w-[160px]"
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => { item.onClick(); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${
                  item.variant === 'danger'
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Template Component ─────────────────────────────────────────────────

export default function OwnerPageTemplate<T extends Record<string, any>>({
  title,
  description,
  section,
  icon,
  columns,
  data,
  idField = 'id',
  loading = false,
  searchable = true,
  searchableFields = [],
  searchPlaceholder,
  filters = [],
  summaryCards,
  bulkActions = [],
  showCreate = true,
  createLabel = 'New Record',
  onCreate,
  showExport = true,
  onExport,
  showImport = false,
  onImport,
  onRefresh,
  onHelp,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRowClick,
  rowMenuItems,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  pageSize: defaultPageSize = 25,
  customEmpty,
  footer,
  headerActions,
  children,
  dataLoading,
}: OwnerPageTemplateProps<T>) {
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    new Set(columns.filter(c => !c.hidden).map(c => c.key))
  )
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set())
  const [colSettingsOpen, setColSettingsOpen] = useState(false)
  const colSettingsRef = useRef<HTMLDivElement>(null)

  const selectedIds = controlledSelectedIds ?? Array.from(internalSelected)
  const setSelectedIds = onSelectionChange
    ? (ids: string[]) => onSelectionChange(ids)
    : (ids: string[]) => setInternalSelected(new Set(ids))

  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  // Column settings close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (colSettingsRef.current && !colSettingsRef.current.contains(e.target as Node)) setColSettingsOpen(false)
    }
    if (colSettingsOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [colSettingsOpen])

  // Reset page on search/filter change
  useEffect(() => { setPage(1) }, [search, activeFilters])

  // Filter data
  const filtered = useMemo(() => {
    let result = [...data]

    // Search
    if (search && searchableFields.length > 0) {
      const q = search.toLowerCase()
      result = result.filter(row =>
        searchableFields.some(f => {
          const val = row[f]
          return val !== undefined && val !== null && String(val).toLowerCase().includes(q)
        })
      )
    }

    // Filters
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value === '' || value === null || value === undefined || value === false) continue
      if (Array.isArray(value) && value.length === 0) continue
      if (key.endsWith('_from')) {
        const realKey = key.replace('_from', '')
        result = result.filter(r => r[realKey] >= value)
      } else if (key.endsWith('_to')) {
        const realKey = key.replace('_to', '')
        result = result.filter(r => r[realKey] <= value)
      } else {
        result = result.filter(r => r[key] === value || (Array.isArray(value) && value.includes(r[key])))
      }
    }

    return result
  }, [data, search, searchableFields, activeFilters])

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal === bVal) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / defaultPageSize))
  const paginated = sorted.slice((page - 1) * defaultPageSize, page * defaultPageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const toggleSelectAll = () => {
    const pageIds = paginated.map(r => r[idField])
    const allSelected = pageIds.every(id => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !pageIds.includes(id)))
    } else {
      setSelectedIds([...new Set([...selectedIds, ...pageIds])])
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => setActiveFilters({})

  const handleExport = () => {
    if (onExport) { onExport(); return }
    const visibleColumns = columns.filter(c => visibleCols.has(c.key))
    const header = visibleColumns.map(c => c.label)
    const rows = filtered.map(row =>
      visibleColumns.map(c => {
        const val = row[c.key]
        if (c.type === 'currency' && typeof val === 'number') return String(val)
        return val !== undefined && val !== null ? String(val) : ''
      })
    )
    const csv = [header, ...rows].map(r =>
      r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const pageIds = paginated.map(r => r[idField])
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id))

  const visibleColumns = columns.filter(c => visibleCols.has(c.key))

  const renderCellValue = (col: Column<T>, row: T, index: number) => {
    const value = row[col.key]

    if (col.render) return col.render(value, row, index)

    switch (col.type) {
      case 'currency':
        return <span className="font-mono tabular-nums text-sm">{fmt(Number(value) || 0)}</span>
      case 'date':
        return value ? <span className="text-sm text-slate-600">{new Date(value).toLocaleDateString()}</span> : <span className="text-slate-300">—</span>
      case 'status':
      case 'badge': {
        const color = col.statusColors?.[value] ?? 'bg-slate-100 text-slate-600'
        return (
          <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${color}`}>
            {value}
          </span>
        )
      }
      case 'percentage':
        return <span className="text-sm font-mono">{value != null ? `${value}%` : '—'}</span>
      case 'number':
        return <span className="text-sm font-mono tabular-nums">{value != null ? value.toLocaleString() : '—'}</span>
      default:
        return <span className="text-sm">{value ?? '—'}</span>
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {section && (
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">{section}</span>
              )}
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              {icon && <div className="text-emerald-600">{icon}</div>}
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            </div>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            {searchable && (
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}...`}
                  className="pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-52 bg-slate-50"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Filters */}
            {filters.length > 0 && (
              <FilterDropdown
                filters={filters}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearAll={clearFilters}
              />
            )}

            {/* Refresh */}
            {onRefresh && (
              <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <RefreshCw size={13} />
              </button>
            )}

            {/* Column Settings */}
            <div ref={colSettingsRef} className="relative">
              <button
                onClick={() => setColSettingsOpen(!colSettingsOpen)}
                className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center"
              >
                <Columns3 size={14} />
              </button>
              <AnimatePresence>
                {colSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3"
                  >
                    <p className="text-xs font-semibold text-slate-500 mb-2">Show columns</p>
                    {columns.map(col => (
                      <label key={col.key} className="flex items-center gap-2 py-1 text-sm">
                        <input
                          type="checkbox"
                          checked={visibleCols.has(col.key)}
                          onChange={() => {
                            setVisibleCols(prev => {
                              const next = new Set(prev)
                              if (next.has(col.key)) {
                                if (next.size > 1) next.delete(col.key)
                              } else {
                                next.add(col.key)
                              }
                              return next
                            })
                          }}
                          className="accent-emerald-600"
                        />
                        <span className="text-slate-700">{col.label}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Help */}
            {onHelp && (
              <button onClick={onHelp} className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center">
                <HelpCircle size={14} />
              </button>
            )}

            {/* Import */}
            {showImport && (
              <button onClick={onImport} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Upload size={13} /> Import
              </button>
            )}

            {/* Export */}
            {showExport && (
              <button onClick={handleExport} disabled={filtered.length === 0} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
                <Download size={13} /> Export
              </button>
            )}

            {/* Custom header actions */}
            {headerActions}

            {/* Create */}
            {showCreate && onCreate && (
              <button
                onClick={onCreate}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow shadow-emerald-600/25 transition-all active:scale-95"
              >
                <Plus size={14} /> {createLabel}
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {summaryCards && summaryCards.length > 0 && (
          <div className="grid grid-cols-4 gap-2 px-6 pb-3">
            {summaryCards.map((card, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
                {card.icon && (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg ?? 'bg-emerald-100'}`}>
                    <span className={card.iconColor ?? 'text-emerald-600'}>{card.icon}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 truncate">{card.label}</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{card.value}</p>
                  {card.sub && <p className="text-[9px] text-slate-400 truncate">{card.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bulk Actions Bar ── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-700">
                {selectedIds.length} selected
              </span>
              <div className="flex items-center gap-2">
                {bulkActions.map((action, i) => {
                  const enabled = !action.requires || action.requires(data.filter(r => selectedIds.includes(r[idField])))
                  return (
                    <button
                      key={i}
                      onClick={() => action.onClick(selectedIds)}
                      disabled={!enabled}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        action.variant === 'danger'
                          ? 'text-rose-600 hover:bg-rose-100 border border-rose-200'
                          : 'text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      } disabled:opacity-40`}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  )
                })}
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-slate-500 hover:text-slate-700 ml-2"
                >
                  Clear selection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <div className="flex-1 px-6 py-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {/* Selection checkbox */}
                  <th className="w-10 px-3 py-3">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-emerald-600 transition-colors">
                      {allPageSelected ? <CheckSquare2 size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  {visibleColumns.map(col => (
                    <th
                      key={col.key}
                      onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                      className={`px-3 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      } ${col.sortable ? 'cursor-pointer select-none hover:text-slate-600' : ''}`}
                      style={col.width ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width } : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.sortable && sortKey === col.key && (
                          sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        )}
                        {col.sortable && sortKey !== col.key && (
                          <ArrowUpDown size={11} className="opacity-30" />
                        )}
                      </span>
                    </th>
                  ))}
                  {/* Actions column */}
                  {rowMenuItems && <th className="w-10 px-3 py-3" />}
                </tr>
              </thead>
              <tbody>
                {(dataLoading ?? loading) ? (
                  <tr>
                    <td colSpan={visibleColumns.length + (rowMenuItems ? 2 : 1)} className="px-4 py-16 text-center">
                      <RefreshCw size={24} className="text-slate-300 mx-auto mb-2 animate-spin" />
                      <p className="text-sm text-slate-400">Loading...</p>
                    </td>
                  </tr>
                ) : customEmpty && paginated.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + (rowMenuItems ? 2 : 1)}>
                      {customEmpty}
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + (rowMenuItems ? 2 : 1)} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                          <Search size={22} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600">{emptyTitle ?? `No ${title.toLowerCase()} found`}</p>
                        <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm">
                          {emptyDescription ?? 'No records match your current filters. Try adjusting your search or add a new record.'}
                        </p>
                        {emptyAction && (
                          <button
                            onClick={emptyAction.onClick}
                            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow shadow-emerald-600/25 transition-all"
                          >
                            {emptyAction.label}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, idx) => {
                    const isSelected = selectedIds.includes(row[idField])
                    return (
                      <tr
                        key={row[idField] ?? idx}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        className={`border-b border-slate-100 hover:bg-emerald-50/40 transition-colors group ${
                          isSelected ? 'bg-emerald-50/60' : ''
                        } ${onRowClick ? 'cursor-pointer' : ''}`}
                      >
                        <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleSelect(row[idField])} className="text-slate-300 hover:text-emerald-600 transition-colors">
                            {isSelected ? <CheckSquare2 size={16} className="text-emerald-600" /> : <Square size={16} />}
                          </button>
                        </td>
                        {visibleColumns.map(col => (
                          <td
                            key={col.key}
                            className={`px-3 py-2.5 ${
                              col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right pr-4' : ''
                            }`}
                          >
                            {renderCellValue(col, row, idx)}
                          </td>
                        ))}
                        {rowMenuItems && (
                          <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                            <RowActionsMenu items={rowMenuItems(row)} />
                          </td>
                        )}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {sorted.length > defaultPageSize && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Showing {(page - 1) * defaultPageSize + 1}–{Math.min(page * defaultPageSize, sorted.length)} of {sorted.length} records
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 text-slate-500 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 text-slate-500 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          {footer && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {children}
    </div>
  )
}
