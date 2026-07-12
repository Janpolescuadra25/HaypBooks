'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnOrderState,
  type SortingState,
  type VisibilityState,
  type ColumnSizingState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search,
  RotateCcw,
  FilterX,
  Filter,
  Settings2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Clock,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  X,
  Plus,
} from 'lucide-react'
import { useTablePersistence } from '@/hooks/useTablePersistence'
import { DraggableHeader } from './DraggableHeader'
import HaypDateRangePicker from './HaypDateRangePicker'
import HaypSelect from './HaypSelect'
import Popover from '@/components/Popover'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type {
  AdvancedFilter,
  HaypActionItem,
  HaypBulkAction,
  HaypColumn,
  HaypDataTableProps,
  HaypFilterOption,
  HaypTotalsConfig,
  HaypStat,
} from './HaypDataTable.types'

function getHeaderLabel(column: Column<any, any>) {
  if (typeof column.columnDef.header === 'string') return column.columnDef.header
  return String(column.id)
}

export function HaypDataTable<T extends Record<string, any>>(props: HaypDataTableProps<T>) {
  const {
    data,
    columns,
    tableId,
    title,
    description,
    stats,
    headerActions,
    primaryAction,
    getRowId: getRowIdProp,
    searchPlaceholder = 'Search...',
    globalFilter,
    onGlobalFilterChange,
    filters = [],
    activeFilter,
    onFilterChange,
    filterLabel = 'All',
    actions,
    bulkActions = [],
    totals,
    onRefresh,
    onExport,
    exportLabel = 'Export',
    onActivityLog,
    onRowClick,
    dateRangeLabel,
    dateRangeMenuItems,
    dateRange,
    onDateRangeChange,
    onCustomize,
    customizeLabel,
    customizeBadge,
    advancedFilters: controlledAdvancedFilters,
    onAdvancedFiltersChange,
    emptyTitle = 'No records found',
    emptySubtitle = 'Adjust your search or filter to see results',
    className,
    loading = false,
    usePageScroll = true,
  } = props

  const { savedConfig, saveState, clearState } = useTablePersistence(tableId)

  const getRowId = useCallback(
    (row: T) => String(getRowIdProp?.(row) ?? (row as any).id ?? ''),
    [getRowIdProp],
  )

  const actionsRef = useRef<HaypActionItem[] | undefined>(actions)
  useEffect(() => {
    actionsRef.current = actions
  }, [actions])

  const renderSelectHeader = useCallback(({ table }: any) => {
    const isAll = table.getIsAllPageRowsSelected()
    const isSome = table.getIsSomePageRowsSelected()
    return (
      <div className="flex items-center justify-center w-full">
        <Checkbox
          checked={isAll ? true : isSome ? ('indeterminate' as any) : false}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="h-4 w-4 rounded border-2 border-slate-300 bg-white shadow-none data-checked:bg-emerald-600 data-checked:border-emerald-600 data-checked:text-white transition-all"
        />
      </div>
    )
  }, [])

  const renderSelectCell = useCallback(({ row }: any) => (
    <div className="flex items-center justify-center w-full" onClick={(event) => event.stopPropagation()}>
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="h-4 w-4 rounded border-2 border-slate-300 bg-white shadow-none data-checked:bg-emerald-600 data-checked:border-emerald-600 data-checked:text-white transition-all"
      />
    </div>
  ), [])

  const renderActionsCell = useCallback(({ row }: any) => {
    const rowData = row.original
    const currentActions = actionsRef.current ?? []

    return (
      <div className="flex items-center justify-center gap-1 w-full" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all bg-transparent border border-transparent hover:border-slate-300 cursor-pointer focus:outline-none">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-48 shadow-2xl border-slate-300 p-1 bg-white z-[9999] rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1.5 tracking-widest">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="opacity-50" />
            </DropdownMenuGroup>
            {currentActions.map((action, index) => {
              if (action.divider) {
                return <DropdownMenuSeparator key={`divider-${index}`} className="opacity-50" />
              }

              if (action.show && !action.show(rowData)) {
                return null
              }

              return (
                <DropdownMenuItem
                  key={action.label + index}
                  className={cn(
                    'text-xs py-2 cursor-pointer transition-colors rounded-lg',
                    action.danger ? 'text-rose-700 hover:bg-rose-100' : 'hover:bg-slate-100',
                  )}
                  onClick={() => action.onClick(String(rowData?.id ?? row.id), rowData)}
                  disabled={action.disabled}
                >
                  {action.icon}
                  <span className="font-semibold">{action.label}</span>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }, [])

  const defaultColumnOrder = useMemo(
    () => ['select', ...columns.map((column) => column.id), ...(actions?.length ? ['actions'] : [])],
    [columns, actions],
  )

  const [sorting, setSorting] = useState<SortingState>(savedConfig?.sorting ?? [])
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(savedConfig?.columnOrder ?? [])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(savedConfig?.columnVisibility ?? {})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(savedConfig?.columnSizing ?? {})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 })
  const containerRef = useRef<HTMLDivElement | null>(null)
  const headerScrollRef = useRef<HTMLDivElement | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const scrollbarRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [hasUserResizedColumns, setHasUserResizedColumns] = useState(false)

  useEffect(() => {
    if (!savedConfig) return
    setSorting(savedConfig.sorting ?? [])
    setColumnOrder(savedConfig.columnOrder ?? defaultColumnOrder)
    setColumnVisibility(savedConfig.columnVisibility ?? {})
    setColumnSizing(savedConfig.columnSizing ?? {})
  }, [savedConfig, defaultColumnOrder])

  useEffect(() => {
    if (columnOrder.length === 0) {
      setColumnOrder(defaultColumnOrder)
    }
  }, [columnOrder.length, defaultColumnOrder])

  useEffect(() => {
    saveState({ sorting, columnOrder, columnVisibility, columnSizing })
  }, [sorting, columnOrder, columnVisibility, columnSizing, saveState])

  const resetLayout = useCallback(() => {
    setColumnOrder(defaultColumnOrder)
    setColumnVisibility({})
    setColumnSizing({})
    setHasUserResizedColumns(false)
    setSorting([])
    setPagination({ pageIndex: 0, pageSize: 25 })
    clearState()
    onGlobalFilterChange?.('')
  }, [clearState, defaultColumnOrder, onGlobalFilterChange])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const visibleFilterLabel = useMemo(() => {
    const active = filters.find((filter) => filter.value === activeFilter)
    if (active) return active.label
    return filterLabel
  }, [activeFilter, filterLabel, filters])

  const [internalAdvancedFilters, setInternalAdvancedFilters] = useState<AdvancedFilter[]>([])
  const activeAdvancedFilters = controlledAdvancedFilters ?? internalAdvancedFilters
  const setActiveAdvancedFilters = useCallback(
    (filters: AdvancedFilter[]) => {
      if (onAdvancedFiltersChange) {
        onAdvancedFiltersChange(filters)
      }
      if (controlledAdvancedFilters === undefined) {
        setInternalAdvancedFilters(filters)
      }
    },
    [controlledAdvancedFilters, onAdvancedFiltersChange],
  )

  const mappedColumns = useMemo<ColumnDef<T, any>[]>(() => {
    const bodyColumns = columns.map((column) => ({
      id: column.id,
      accessorKey: column.accessorKey as string,
      header: column.header,
      cell: ({ getValue, row }) => {
        const value = getValue()
        const cellContent = column.render
          ? column.render(value, row.original, row.index)
          : <span className="truncate">{value ?? '—'}</span>

        return (
          <div
            className={cn(
              'w-full h-full flex items-center px-1 rounded-sm transition-colors overflow-hidden',
              column.align === 'right' && 'justify-end',
              column.align === 'center' && 'justify-center',
              column.align !== 'right' && column.align !== 'center' && 'justify-start',
              column.cellClass,
            )}
          >
            {cellContent}
          </div>
        )
      },
      enableSorting: column.enableSorting ?? true,
      enableHiding: column.enableHiding ?? true,
      enableResizing: column.enableResizing ?? true,
      size: column.size,
      minSize: column.minSize,
      maxSize: column.maxSize,
      meta: {
        align: column.align,
        cellClass: column.cellClass,
        headerClass: column.headerClass,
        isSummable: column.isSummable,
      },
    }))

    return bodyColumns
  }, [columns])

  const hasActions = (actions?.length ?? 0) > 0

  const columnDefs = useMemo<ColumnDef<T, any>[]>(() => {
    const selectColumn: ColumnDef<T, any> = {
      id: 'select',
      header: renderSelectHeader,
      cell: renderSelectCell,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 48,
      minSize: 40,
    }

    const actionsColumn: ColumnDef<T, any> | null = hasActions
      ? {
          id: 'actions',
          header: () => <span className="sr-only">Actions</span>,
          cell: renderActionsCell,
          enableSorting: false,
          enableHiding: false,
          enableResizing: false,
          size: 64,
          minSize: 64,
        }
      : null

    return [selectColumn, ...mappedColumns, ...(actionsColumn ? [actionsColumn] : [])]
  }, [mappedColumns, hasActions, renderActionsCell, renderSelectCell, renderSelectHeader])

  const initialSizeById = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {
      select: 48,
      actions: 64,
    }

    for (const column of columns) {
      const fallback = typeof column.minSize === 'number' ? column.minSize : 120
      map[column.id] = typeof column.size === 'number' ? column.size : fallback
    }

    return map
  }, [columns])

  const filteredData = useMemo(() => {
    let list = data

    const filterKey = activeFilter?.trim() ?? ''
    if (filters.length > 0 && filterKey && filterKey.toLowerCase() !== 'all') {
      const normalizedFilterKey = filterKey.toLowerCase()
      list = list.filter((row) =>
        Object.values(row).some((value) =>
          String(value ?? '').toLowerCase().includes(normalizedFilterKey),
        ),
      )
    }

    const searchText = globalFilter?.trim() ?? ''
    if (searchText) {
      const normalizedSearch = searchText.toLowerCase()
      list = list.filter((row) =>
        columns.some((column) => {
          if (!column.accessorKey) return false
          const rawValue = row[column.accessorKey as keyof T]
          return String(rawValue ?? '').toLowerCase().includes(normalizedSearch)
        }),
      )
    }

    if (activeAdvancedFilters.length === 0) return list

    return list.filter((row) => {
      return activeAdvancedFilters.every((filter) => {
        const rawValue = row[filter.columnId as keyof T]
        const filterValue = String(filter.value ?? '').trim()
        if (filterValue === '') return true
        if (rawValue == null) return false

        const normalizedCell = String(rawValue).toLowerCase()
        const normalizedFilter = filterValue.toLowerCase()

        switch (filter.operator) {
          case 'contains':
            return normalizedCell.includes(normalizedFilter)
          case 'equals':
            return normalizedCell === normalizedFilter
          case 'startsWith':
            return normalizedCell.startsWith(normalizedFilter)
          case 'greaterThan': {
            const left = Number(rawValue)
            const right = Number(filterValue)
            return Number.isFinite(left) && Number.isFinite(right) && left > right
          }
          case 'lessThan': {
            const left = Number(rawValue)
            const right = Number(filterValue)
            return Number.isFinite(left) && Number.isFinite(right) && left < right
          }
          default:
            return true
        }
      })
    })
  }, [activeAdvancedFilters, data, filters, activeFilter, globalFilter, columns])

  useEffect(() => {
    if (hasUserResizedColumns) return
    if (containerWidth <= 0) return
    if (Object.keys(columnSizing).length > 0) return

    const visibleColumnIds = columnOrder.filter((id) => columnVisibility[id] !== false)
    if (visibleColumnIds.length === 0) return

    const fixedColumnIds = visibleColumnIds.filter((id) => id === 'select' || id === 'actions')
    const flexibleColumnIds = visibleColumnIds.filter((id) => id !== 'select' && id !== 'actions')

    const fixedWidth = fixedColumnIds.reduce((sum, id) => sum + (initialSizeById[id] ?? 0), 0)
    const availableWidth = Math.max(0, containerWidth - fixedWidth)
    
    // Improved distribution: use minSize as base weight if available, otherwise size
    const totalWeight = flexibleColumnIds.reduce((sum, id) => {
      const col = columns.find(c => c.id === id)
      return sum + (col?.size || initialSizeById[id] || 100)
    }, 0)

    const nextSizing: ColumnSizingState = {}
    fixedColumnIds.forEach((id) => {
      nextSizing[id] = initialSizeById[id] ?? 0
    })

    flexibleColumnIds.forEach((id) => {
      const col = columns.find(c => c.id === id)
      const weight = col?.size || initialSizeById[id] || 100
      nextSizing[id] = totalWeight > 0
        ? Math.max(col?.minSize || 60, Math.round((availableWidth * weight) / totalWeight))
        : weight
    })

    setColumnSizing(nextSizing)
  }, [columnOrder, columnSizing, columnVisibility, containerWidth, hasUserResizedColumns, initialSizeById, columns])

  const table = useReactTable({
    data: filteredData,
    columns: columnDefs,
    state: {
      sorting,
      columnOrder,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnSizing,
      pagination,
    },
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: onGlobalFilterChange,
    onColumnSizingChange: (updater) => {
      setColumnSizing((prev) => {
        const next = typeof updater === 'function'
          ? updater(prev)
          : updater

        const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
        const changed = Array.from(keys).some((key) => prev[key] !== next[key])

        if (!changed) return prev

        setHasUserResizedColumns(true)
        return next
      })
    },
    onPaginationChange: setPagination,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length
  const selectedIds = selectedRows.map((row) => row.id)
  const selectedOriginalRows = selectedRows.map((row) => row.original)

  const totalsMap = useMemo(() => {
    if (!totals?.enabled) return {} as Record<string, number | string>
    const filteredRows = table.getFilteredRowModel().rows.map((row) => row.original)
    if (totals.customTotals) return totals.customTotals(filteredRows)

    const sumColumnIds = totals.sumColumns?.length
      ? totals.sumColumns
      : columns.filter((column) => column.isSummable).map((column) => column.id)

    return sumColumnIds.reduce<Record<string, number>>((acc, columnId) => {
      acc[columnId] = filteredRows.reduce((sum, row) => {
        const value = Number((row as any)[columnId] ?? 0)
        return sum + (Number.isFinite(value) ? value : 0)
      }, 0)
      return acc
    }, {})
  }, [columns, totals, table])

  const visibleLeafColumns = table.getVisibleLeafColumns()
  const tableContentWidth = Math.max(containerWidth, table.getTotalSize())
  const isDefaultSizing = !hasUserResizedColumns

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateWidth = () => {
      const width = el.clientWidth
      if (width > 0) setContainerWidth(width)
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const datePickerButton = dateRange && onDateRangeChange ? (
    <HaypDateRangePicker 
      range={dateRange} 
      onChange={onDateRangeChange} 
    />
  ) : dateRangeLabel ? (
    <div className="flex items-center gap-1">
      {/* Left/Right buttons match Jbooks */}
      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors hidden sm:block">
        <ChevronLeft size={16} />
      </button>
      
      {dateRangeMenuItems?.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm min-w-[240px] lg:min-w-[280px] h-11 text-left focus:outline-none outline-none">
            <Calendar className="h-4 w-4 text-slate-400" />
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Date Range
              </span>
              <span className="text-xs font-bold text-slate-900 leading-none truncate w-full">
                {dateRangeLabel}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 ml-auto text-slate-400 transition-transform" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" sideOffset={4} className="w-[260px] bg-white shadow-2xl border border-slate-200 p-1 z-[100] rounded-[24px]">
             <div className="px-3 py-2 mb-1 border-b border-slate-50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Select Range</p>
              </div>
            {dateRangeMenuItems.map((item) => (
              <DropdownMenuItem
                key={item.label}
                className={cn(
                  'text-xs py-2.5 cursor-pointer font-bold rounded-xl px-3 transition-all',
                  item.active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
                onClick={item.onClick}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors hidden sm:block">
        <ChevronRight size={16} />
      </button>
    </div>
  ) : null

  const [statusOpen, setStatusOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [columnsOpen, setColumnsOpen] = useState(false)

  // Auto-close on scroll (only if main window scrolls, not internal lists)
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement

      if (columnsOpen) {
        const menuEl = document.querySelector('[data-slot="dropdown-menu-content"]')
        if (menuEl && menuEl.contains(target)) return
      }

      if (customizeOpen) {
        const customizeEl = document.querySelector('[data-customize-scroll]')
        if (customizeEl && customizeEl.contains(target)) return
      }

      setStatusOpen(false)
      setCustomizeOpen(false)
      setColumnsOpen(false)
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [columnsOpen, customizeOpen])

  const statusButton = filters.length > 0 ? (
    <DropdownMenu open={statusOpen} onOpenChange={setStatusOpen}>
      <DropdownMenuTrigger className={cn(
        'inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 h-10 gap-2 px-3 cursor-pointer shadow-sm min-w-[120px] justify-between focus:outline-none outline-none',
        activeFilter && activeFilter !== 'ALL' ? 'ring-2 ring-emerald-500/20 border-emerald-500 text-emerald-700' : '',
      )}>
        <div className="flex items-center gap-2">
          <Filter className={cn('h-4 w-4', activeFilter && activeFilter !== 'ALL' ? 'text-emerald-500' : 'text-slate-400')} />
          <span className="text-[13px]">{visibleFilterLabel === filterLabel ? 'Status' : visibleFilterLabel}</span>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-[180px] !bg-white !opacity-100 shadow-2xl border border-slate-200 p-2 z-[9999] rounded-[24px] !backdrop-blur-none">
        <div className="px-3 py-2 mb-1 border-b border-slate-50">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Filter by Status</p>
        </div>
        {filters.map((filter) => (
          <DropdownMenuItem
            key={filter.value}
            className={cn(
              'text-xs py-2.5 cursor-pointer font-bold rounded-xl px-3 flex items-center justify-between group transition-all',
              activeFilter === filter.value ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            )}
            onClick={() => onFilterChange?.(filter.value)}
          >
            {filter.label}
            {activeFilter === filter.value ? (
              <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm shadow-emerald-500/20">
                 <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            ) : (
              <div className="w-3.5 h-3.5 border-2 border-slate-200 rounded-full group-hover:border-slate-300 transition-colors" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null

  const [selectedColForFilter, setSelectedColForFilter] = useState<string>(columns[0]?.id || '')

  const addAdvancedFilter = () => {
    setActiveAdvancedFilters([
      ...activeAdvancedFilters,
      { columnId: selectedColForFilter, operator: 'contains', value: '' },
    ])
  }

  const removeAdvancedFilter = (index: number) => {
    setActiveAdvancedFilters(activeAdvancedFilters.filter((_, i) => i !== index))
  }

  const customizeButtonRef = useRef<HTMLButtonElement | null>(null)

  const customizeButton = (
    <>
      <button
        ref={customizeButtonRef}
        type="button"
        onClick={() => setCustomizeOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 h-10 gap-2 px-3 shadow-sm focus:outline-none outline-none",
          (customizeBadge != null || activeAdvancedFilters.length > 0) && "ring-2 ring-emerald-500/20 border-emerald-500 text-emerald-700 bg-emerald-50/10"
        )}
      >
        <SlidersHorizontal className="h-4 w-4 text-slate-400 hover:text-emerald-500 transition-colors" />
        <span className="text-[13px]">{customizeLabel || 'Customize'}</span>
        {(customizeBadge != null || activeAdvancedFilters.length > 0) && (
          <span className="rounded-full bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 shadow-sm shadow-emerald-500/20 ml-1">
            {activeAdvancedFilters.length || customizeBadge}
          </span>
        )}
      </button>
      <Popover
        open={customizeOpen}
        anchorRef={customizeButtonRef}
        onClose={() => setCustomizeOpen(false)}
        matchWidth={false}
        className="!z-[9999]"
      >
        <div className="w-[calc(100vw-2rem)] sm:w-[450px] md:w-[600px] !bg-white border border-slate-200 rounded-[24px] shadow-2xl p-6 overflow-hidden" data-customize-scroll>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Filter size={16} className="text-emerald-500" />
                  Filter Conditions
                </h3>
                <p className="text-[10px] text-slate-400 font-medium ml-6">Match <span className="text-emerald-700 font-black">ALL</span> of the filters below</p>
              </div>
              <div className="flex items-center gap-3">
                <HaypSelect
                  value={selectedColForFilter}
                  onChange={setSelectedColForFilter}
                  options={columns.map(col => ({ value: col.id, label: col.header }))}
                />
                <button
                  type="button"
                  onClick={addAdvancedFilter}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
                >
                  <Plus size={14} /> Add Condition
                </button>
              </div>
            </div>

            {activeAdvancedFilters.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium">No filters applied. Add a condition to refine your data.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {activeAdvancedFilters.map((filter, idx) => {
                  const colLabel = columns.find(c => c.id === filter.columnId)?.header
                  return (
                    <div key={idx} className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm transition-all">
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-2 py-1 bg-emerald-50 rounded-md min-w-[100px] text-center">
                        {colLabel}
                      </span>
                      <HaypSelect
                        value={filter.operator}
                        onChange={(v) => {
                          const newFilters = [...activeAdvancedFilters]
                          newFilters[idx].operator = v as AdvancedFilter['operator']
                          setActiveAdvancedFilters(newFilters)
                        }}
                        options={[
                          { value: 'contains', label: 'contains' },
                          { value: 'equals', label: 'is exactly' },
                          { value: 'startsWith', label: 'starts with' },
                          { value: 'greaterThan', label: 'is greater than' },
                          { value: 'lessThan', label: 'is less than' },
                        ]}
                      />

                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={filter.value}
                          onChange={(e) => {
                            const newFilters = [...activeAdvancedFilters]
                            newFilters[idx].value = e.target.value
                            setActiveAdvancedFilters(newFilters)
                          }}
                          placeholder="Value..."
                          className="bg-white border border-slate-200 rounded-lg px-4 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all w-32 shadow-sm"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAdvancedFilter(idx)}
                        className="ml-auto p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveAdvancedFilters([])
                  setCustomizeOpen(false)
                  onCustomize?.()
                }}
                className="px-4 py-2 text-xs font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomizeOpen(false)
                  onCustomize?.()
                }}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </Popover>
    </>
  )

  const exportButton = onExport ? (
    <button
      onClick={onExport}
      title={exportLabel}
      className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-emerald-700 h-11 w-11 p-0 cursor-pointer shadow-sm group"
    >
      <Download className="h-4 w-4 group-hover:scale-110 transition-transform" />
    </button>
  ) : null;

  const activityButton = onActivityLog ? (
    <button
      onClick={onActivityLog}
      title="Activity Log"
      className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm h-11 w-11 flex items-center justify-center"
    >
      <Clock className="h-4 w-4" />
    </button>
  ) : null;

  return (
    <div data-page-scroll={usePageScroll} className={cn('flex flex-col w-full max-w-full overflow-x-clip overflow-y-visible bg-slate-50 relative', className)}>
      <div className={cn(
        "flex-1 flex flex-col min-h-0 w-full max-w-full overflow-x-clip relative",
        (title || stats) ? "px-4 sm:px-6 py-4 md:py-5" : "p-0",
        "overflow-y-visible"
      )}>
        
        {/* Page Header Integration */}
        {(title || description || headerActions) && (
          <div className="flex-shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 w-full animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              {title && (
                <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-slate-500 text-xs">
                  {description}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex gap-3">
                {headerActions}
              </div>
            )}
          </div>
        )}

        {/* Stats Strip Integration */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 w-full animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
            {stats.map((stat, i) => (
              <div key={i} className="p-6 rounded-[32px] border border-slate-200/50 flex items-center gap-5 group hover:border-emerald-500/20 transition-all shadow-sm bg-white">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner",
                  stat.color === 'blue' && "bg-blue-50 text-blue-600",
                  stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                  stat.color === 'amber' && "bg-amber-50 text-amber-600",
                  stat.color === 'rose' && "bg-rose-50 text-rose-600",
                  stat.color === 'slate' && "bg-slate-50 text-slate-600",
                )}>
                  {(() => {
                    const Icon = stat.icon as any
                    if (!Icon) return null
                    // Handle Lucide components (which are objects with render/$$typeof) or functions
                    if (typeof Icon === 'function' || (typeof Icon === 'object' && ('render' in Icon || Icon.$$typeof))) {
                      return <Icon size={26} />
                    }
                    return Icon
                  })()}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Redesigned Toolbar */}
        <div className={cn(
          "flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 shadow-sm relative z-50 mb-2 bg-white"
        )}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-full sm:max-w-[320px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={searchPlaceholder} 
                value={globalFilter ?? ''}
                onChange={(e) => onGlobalFilterChange?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all h-10"
              />
            </div>
            
            {(datePickerButton || statusButton) && <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block" />}
            
            <div className="flex flex-wrap items-center gap-2">
              {datePickerButton}
              {statusButton}
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm group h-10 w-10 flex items-center justify-center"
                title="Refresh"
              >
                <RotateCcw size={16} className="group-active:rotate-180 transition-transform duration-500" />
              </button>
            )}
            
            {exportButton || (onExport && (
              <button
                onClick={onExport}
                title={exportLabel}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm h-10 w-10 flex items-center justify-center"
              >
                <Download size={16} />
              </button>
            ))}

            {activityButton}
            {customizeButton}

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <DropdownMenu open={columnsOpen} onOpenChange={setColumnsOpen}>
              <DropdownMenuTrigger
                title="Columns"
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm h-10 w-10 flex items-center justify-center focus:outline-none outline-none data-[state=open]:ring-2 data-[state=open]:ring-emerald-500/20 data-[state=open]:border-emerald-500"
              >
                <Settings2 size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-64 !bg-white !opacity-100 shadow-2xl border border-slate-200 p-0 overflow-hidden rounded-[24px] z-[9999] animate-in fade-in zoom-in-95 duration-200 !backdrop-blur-none">
                <div className="flex items-center justify-between px-4 py-4 bg-slate-50 border-b border-slate-200">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Column Settings</h3>
                  </div>
                  <button
                    type="button"
                    onClick={resetLayout}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    Reset
                  </button>
                </div>
                <div className="max-h-[350px] overflow-auto custom-scrollbar p-2 bg-white">
                  {table.getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <div
                        key={column.id}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors group"
                        onClick={() => column.toggleVisibility(!column.getIsVisible())}
                      >
                        <span className={cn("transition-colors", column.getIsVisible() ? "text-slate-900" : "text-slate-400")}>
                          {getHeaderLabel(column)}
                        </span>
                        <div className={cn(
                          "w-8 h-4 rounded-full relative transition-all duration-300",
                          column.getIsVisible() ? "bg-emerald-500 shadow-sm shadow-emerald-500/20" : "bg-slate-200"
                        )}>
                          <div className={cn(
                            "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm",
                            column.getIsVisible() ? "translate-x-4" : "translate-x-0.5"
                          )} style={{ left: 0 }} />
                        </div>
                      </div>
                    ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            {primaryAction && (
              <>
                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
                <div className="ml-1">
                  {primaryAction}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Floating Bulk Action Strip */}
        <AnimatePresence>
          {selectedCount > 0 && bulkActions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="sticky top-0 z-10 mb-2"
            >
              <div className="bg-slate-900 rounded-2xl px-4 py-2 flex items-center justify-between shadow-2xl border border-white/10 emerald-glow">
                <div className="flex items-center gap-4">
                  <span className="text-white text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                    {selectedCount} Selected
                  </span>
                  <div className="h-6 w-px bg-white/10 hidden sm:block" />
                  <div className="flex flex-wrap gap-2">
                    {bulkActions.map((action) => {
                      const disabled = typeof action.disabled === 'function'
                        ? action.disabled(selectedIds, selectedOriginalRows)
                        : action.disabled
                      return (
                        <button
                          key={action.label}
                          type="button"
                          className={cn(
                            'text-xs font-bold rounded-xl px-2 py-1 transition-all flex items-center gap-2 hover:scale-105 active:scale-95',
                            action.variant === 'danger'
                              ? 'text-rose-400 hover:text-white hover:bg-rose-500/20'
                              : 'text-slate-300 hover:text-white hover:bg-white/10',
                            disabled && 'opacity-40 cursor-not-allowed grayscale'
                          )}
                          disabled={disabled}
                          onClick={() => action.onClick(selectedIds, selectedOriginalRows)}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => table.resetRowSelection?.()}
                    className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                    title="Clear Selection"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Table Container */}
        <div
          ref={containerRef}
          className={cn(
            "glass-morphism rounded-none border border-slate-200/50 shadow-xl relative w-full max-w-full min-w-0 flex flex-col bg-white group/table overflow-x-clip overflow-y-visible h-auto",
            !(title || stats) && "border-t-0"
          )}
          style={{ overflowY: 'visible' }}
        >
          <div
            className="w-full flex flex-col"
            style={{ overflow: 'visible' }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToHorizontalAxis]}
              onDragEnd={(event) => {
                const { active, over } = event
                if (!active || !over || active.id === over.id) return
                if (active.id === 'select' || over.id === 'select' || active.id === 'actions' || over.id === 'actions') return

                setColumnOrder((current) => {
                  const oldIndex = current.indexOf(String(active.id))
                  const newIndex = current.indexOf(String(over.id))
                  const next = arrayMove(current, oldIndex, newIndex)
                  return next[0] === 'select' ? next : current
                })
              }}
            >
              {/* Sticky Header Section */}
              <div 
                className="sticky top-0 z-[40] w-full bg-white border-b border-slate-200/60 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]"
                style={{ overflow: 'hidden' }}
              >
                <div
                  ref={headerScrollRef}
                  className="w-full"
                  style={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                  onScroll={() => {
                    if (headerScrollRef.current) {
                      const sl = headerScrollRef.current.scrollLeft
                      if (scrollAreaRef.current) scrollAreaRef.current.scrollLeft = sl
                      if (scrollbarRef.current) scrollbarRef.current.scrollLeft = sl
                    }
                  }}
                >
                  <div style={{ minWidth: tableContentWidth }} className="flex flex-col">
                    <div className="text-sm flex flex-col" role="table">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <div key={headerGroup.id} className="flex bg-white min-w-0" role="row">
                          <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                            {headerGroup.headers.map((header) => (
                              <DraggableHeader
                                key={header.id}
                                header={header}
                                isDefaultSizing={isDefaultSizing}
                              />
                            ))}
                          </SortableContext>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Body Section */}
              <div
                ref={scrollAreaRef}
                className="w-full relative"
                style={{
                  overflowX: 'auto',
                  overflowY: 'visible',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
                onScroll={() => {
                  if (scrollAreaRef.current) {
                    const sl = scrollAreaRef.current.scrollLeft
                    if (headerScrollRef.current) headerScrollRef.current.scrollLeft = sl
                    if (scrollbarRef.current) scrollbarRef.current.scrollLeft = sl
                  }
                }}
              >
                <style>{`[data-scroll-area]::-webkit-scrollbar{display:none}`}</style>
                <div style={{ minWidth: tableContentWidth }} className="flex flex-col" data-scroll-area>
                  <div className="text-sm flex flex-col" role="table">
                    <div className="bg-white flex flex-col" role="rowgroup">
                      {loading ? (
                        <div className="flex-1 min-h-[300px] flex items-center justify-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading data...</p>
                          </div>
                        </div>
                      ) : table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                          <div
                            key={row.id}
                            role="row"
                            onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                            className={cn(
                              'group/row flex border-b border-slate-100 last:border-b-0 transition-all bg-white relative min-w-0',
                              onRowClick && 'cursor-pointer hover:bg-slate-50/50',
                              row.getIsSelected() && 'bg-emerald-50/30 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-emerald-500',
                            )}
                          >
                            {row.getVisibleCells().map((cell) => {
                              const isActions = cell.column.id === 'actions'
                              const isSelect = cell.column.id === 'select'
                              const columnSize = cell.column.getSize()
                              const useFlexGrow = !isActions && !isSelect && isDefaultSizing
                              const cellFlex = (isActions || isSelect)
                                ? `0 0 ${columnSize}px`
                                : isDefaultSizing
                                  ? `${columnSize} 1 0`
                                  : `0 0 ${columnSize}px`
                              const useProportional = useFlexGrow
                              return (
                                <div
                                  key={cell.id}
                                  role="cell"
                                  className={cn(
                                    'box-border flex items-center px-4 py-3 border-r border-slate-50 last:border-r-0 h-14 overflow-hidden text-sm group-hover/row:border-slate-200 transition-colors',
                                    (isActions || isSelect) && 'justify-center',
                                    isActions && 'sticky right-0 z-20 !bg-white overflow-visible shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)] border-l border-slate-100',
                                  )}
                                  style={{
                                    width: isDefaultSizing ? undefined : columnSize,
                                    flex: cellFlex,
                                    minWidth: cell.column.columnDef.minSize || 60,
                                    maxWidth: cell.column.columnDef.maxSize,
                                    marginLeft: isActions ? 'auto' : undefined,
                                  }}
                                >
                                  <div className={cn('w-full h-full flex items-center transition-all', !isActions && !isSelect && 'truncate')}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ))
                      ) : (
                        <div className="flex-1 min-h-[300px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                          <div className="flex flex-col items-center justify-center text-emerald-600/40 w-full text-center px-10">
                            <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center mb-6 border border-emerald-100 shadow-inner">
                              <FilterX className="h-10 w-10 text-emerald-500 opacity-40" />
                            </div>
                            <p className="text-lg font-black text-slate-800 mb-1">{emptyTitle}</p>
                            <p className="text-sm text-slate-400 font-medium max-w-[280px]">{emptySubtitle}</p>
                            {(globalFilter || activeFilter) && (
                              <button
                                onClick={() => {
                                  onGlobalFilterChange?.('')
                                  onFilterChange?.('ALL')
                                }}
                                className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                              >
                                Clear All Filters
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {totals?.enabled && (
                    <div
                      className="bg-slate-50 border-t border-slate-200 flex shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
                      role="row"
                    >
                      {visibleLeafColumns.map((column) => {
                        const isSelect = column.id === 'select'
                        const isActions = column.id === 'actions'
                        const columnSize = column.getSize()
                        const useFlexGrow = !isActions && !isSelect && isDefaultSizing
                        const columnFlex = (isActions || isSelect)
                          ? `0 0 ${columnSize}px`
                          : useFlexGrow
                            ? `${columnSize} 1 0`
                            : `0 0 ${columnSize}px`
                        const useTotalsProportional = useFlexGrow
                        const colTotal = totalsMap[column.id]
                        const displayValue = typeof colTotal === 'number' && totals?.formatValue
                          ? totals.formatValue(colTotal, column.id)
                          : colTotal

                        return (
                          <div
                            key={column.id}
                            className={cn(
                              'box-border px-4 py-3 flex items-center border-r border-slate-200 last:border-r-0 h-12 overflow-hidden',
                              ((column.columnDef.meta as any)?.align === 'right') && 'justify-end',
                              ((column.columnDef.meta as any)?.align === 'center') && 'justify-center',
                              ((column.columnDef.meta as any)?.align !== 'right' && (column.columnDef.meta as any)?.align !== 'center') && 'justify-start',
                              isSelect && 'justify-center',
                              isActions && 'sticky right-0 z-20 !bg-slate-50 overflow-visible shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)] border-l border-slate-200',
                            )}
                            style={{
                              width: isDefaultSizing ? undefined : columnSize,
                              flex: columnFlex,
                              minWidth: column.columnDef.minSize || 60,
                              maxWidth: column.columnDef.maxSize,
                              marginLeft: isActions ? 'auto' : undefined,
                            }}
                          >
                            <div className="flex flex-col items-start overflow-hidden">
                              {displayValue !== undefined && displayValue !== '' && (
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</span>
                              )}
                              <span className="truncate font-bold text-xs text-slate-900">
                                {displayValue ?? ''}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </DndContext>
          </div>

          {tableContentWidth > containerWidth && (
            <div
              ref={scrollbarRef}
              className="sticky bottom-0 z-[50] flex-shrink-0 bg-white border-t border-slate-100"
              style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollbarWidth: 'thin',
                msOverflowStyle: 'auto',
              }}
              onScroll={() => {
                if (scrollbarRef.current) {
                  const sl = scrollbarRef.current.scrollLeft
                  if (scrollAreaRef.current) scrollAreaRef.current.scrollLeft = sl
                  if (headerScrollRef.current) headerScrollRef.current.scrollLeft = sl
                }
              }}
            >
              <div style={{ width: tableContentWidth, height: '12px' }} />
            </div>
          )}

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 order-2 sm:order-1">
               <div className="flex items-center gap-3">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Rows</p>
                <HaypSelect
                  value={String(table.getState().pagination.pageSize)}
                  onChange={(v) => table.setPageSize(Number(v))}
                  options={[10, 20, 25, 50, 100].map((ps) => ({ value: String(ps), label: String(ps) }))}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest hidden sm:block">
                Showing <span className="text-slate-900">{table.getRowModel().rows.length}</span> of <span className="text-slate-900">{table.getFilteredRowModel().rows.length}</span> results
              </p>
            </div>

            <div className="flex items-center gap-6 order-1 sm:order-2">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Page <span className="text-emerald-600">{table.getState().pagination.pageIndex + 1}</span> / <span className="text-slate-900">{table.getPageCount() || 1}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-slate-500 border-slate-200 bg-white hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm rounded-xl"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-slate-500 border-slate-200 bg-white hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm rounded-xl"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-slate-500 border-slate-200 bg-white hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm rounded-xl"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-slate-500 border-slate-200 bg-white hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm rounded-xl"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
