'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
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
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnOrderState,
  type SortingState,
  type VisibilityState,
  type ColumnSizingState,
  type RowSelectionState,
} from '@tanstack/react-table'
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
} from 'lucide-react'
import { useTablePersistence } from '@/hooks/useTablePersistence'
import { DraggableHeader } from './DraggableHeader'
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
  HaypActionItem,
  HaypBulkAction,
  HaypColumn,
  HaypDataTableProps,
  HaypFilterOption,
  HaypTotalsConfig,
} from './HaypDataTable.types'

function getHeaderLabel(column: Column<any, any>) {
  if (typeof column.columnDef.header === 'string') return column.columnDef.header
  return String(column.id)
}

export function HaypDataTable<T extends Record<string, any>>({
  data,
  columns,
  tableId,
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
  emptyTitle = 'No records found',
  emptySubtitle = 'Adjust your search or filter to see results',
  className,
  loading = false,
}: HaypDataTableProps<T>) {
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
          className="border-gray-400"
        />
      </div>
    )
  }, [])

  const renderSelectCell = useCallback(({ row }: any) => (
    <div className="flex items-center justify-center w-full">
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-gray-400"
      />
    </div>
  ), [])

  const renderActionsCell = useCallback(({ row }: any) => {
    const rowData = row.original
    const currentActions = actionsRef.current ?? []

    return (
      <div className="flex items-center justify-center gap-1 w-full">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all bg-transparent border border-transparent hover:border-slate-300 cursor-pointer focus:outline-none">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-2xl border-slate-300 p-1 bg-white z-[100]">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1.5">Actions</DropdownMenuLabel>
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
                    'text-xs py-2 cursor-pointer transition-colors',
                    action.danger ? 'text-rose-700 hover:bg-rose-100' : 'hover:bg-slate-100',
                  )}
                  onClick={() => action.onClick(String(rowData?.id ?? row.id), rowData)}
                  disabled={action.disabled}
                >
                  {action.icon}
                  <span className="font-medium">{action.label}</span>
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
    setSorting([])
    setPagination({ pageIndex: 0, pageSize: 25 })
    clearState()
    onGlobalFilterChange('')
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

  const hasActions = actions?.length ? true : false

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
          header: 'Actions',
          cell: renderActionsCell,
          enableSorting: false,
          enableHiding: false,
          enableResizing: false,
          size: 100,
          minSize: 80,
        }
      : null

    return [selectColumn, ...mappedColumns, ...(actionsColumn ? [actionsColumn] : [])]
  }, [mappedColumns, hasActions, renderActionsCell, renderSelectCell, renderSelectHeader])

  const table = useReactTable({
    data,
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
    onColumnSizingChange: setColumnSizing,
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

  const filterButton = filters.length > 0 ? (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 border border-slate-200 bg-white text-emerald-700 hover:bg-emerald-50 h-9 gap-1.5 px-3 cursor-pointer shadow-sm">
        <Filter className="h-4 w-4" />
        <span>{visibleFilterLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] bg-white shadow-2xl border-slate-200 p-1 z-[100]">
        {filters.map((filter) => (
          <DropdownMenuItem
            key={filter.value}
            className={cn('text-xs py-2 cursor-pointer font-medium', activeFilter === filter.value && 'bg-emerald-50 text-emerald-700 focus:bg-emerald-50')}
            onClick={() => onFilterChange(filter.value)}
          >
            {filter.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null

  const exportButton = onExport ? (
    <button
      onClick={onExport}
      title="Export"
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 border border-slate-200 bg-white text-emerald-700 hover:bg-emerald-50 h-9 w-9 p-0 cursor-pointer shadow-sm"
    >
      <Download className="h-4 w-4" />
    </button>
  ) : null

  const activityButton = onActivityLog ? (
    <button
      onClick={onActivityLog}
      title="Activity Log"
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 border border-slate-200 bg-white text-emerald-700 hover:bg-emerald-50 h-9 w-9 p-0 cursor-pointer shadow-sm"
    >
      <Clock className="h-4 w-4" />
    </button>
  ) : null

  return (
    <div className={cn('flex flex-col h-full w-full bg-white overflow-hidden border border-slate-300 shadow-sm rounded-xl', className)}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-emerald-50/20 gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-emerald-600/50" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={(e) => onGlobalFilterChange(e.target.value)}
              className="pl-9 bg-white border-slate-300 h-9 text-sm focus-visible:ring-emerald-700/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-slate-200 rounded-full animate-in fade-in zoom-in-95">
              <span className="text-[11px] font-bold text-emerald-700">{selectedCount} Selected</span>
              <div className="w-[1px] h-3 bg-emerald-200" />
              {bulkActions.map((action) => (
                <Button
                  key={action.label}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 px-2 text-[10px] font-semibold',
                    action.variant === 'danger' ? 'text-rose-700 hover:bg-rose-100' : action.variant === 'primary' ? 'text-emerald-700 hover:bg-emerald-100' : 'text-emerald-700 hover:bg-emerald-100',
                  )}
                  disabled={action.disabled}
                  onClick={() => action.onClick(selectedIds, selectedOriginalRows)}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {filterButton}

          {exportButton}
          {activityButton}

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 text-emerald-600 border-slate-200 bg-white hover:bg-emerald-50 transition-all shadow-sm"
              onClick={onRefresh}
              title="Refresh"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
            title="Columns"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 border border-slate-200 bg-white text-emerald-700 hover:bg-emerald-50 h-9 w-9 p-0 cursor-pointer shadow-sm"
          >
              <Settings2 className="h-4 w-4" />
          </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] bg-white shadow-2xl border-slate-200 p-0 overflow-hidden z-[100]">
              <div className="p-3 bg-emerald-50/50 border-b border-slate-200/50">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">Table Controls</h3>
                </div>
                <p className="text-[10px] text-emerald-600/70 leading-tight">Manage your workspace view and column preferences.</p>
              </div>

              <div className="max-h-[350px] overflow-auto custom-scrollbar p-2 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-2 mb-1">
                    <div className="h-1 w-1 rounded-full bg-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-700/80">Visibility</span>
                  </div>
                  <div className="grid gap-0.5">
                    {table.getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize text-xs rounded-md py-1.5 focus:bg-emerald-50 cursor-pointer"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          {getHeaderLabel(column)}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </div>
                </div>

                <DropdownMenuSeparator className="opacity-50" />

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-2 mb-1">
                    <div className="h-1 w-1 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-700/80">Layout & Interaction</span>
                  </div>

                  <div className="px-2 space-y-2">
                    <div className="flex flex-col gap-1 p-2 rounded-md bg-emerald-50/50 border border-slate-200/50">
                      <div className="flex items-center gap-2 text-[10px] font-medium text-emerald-800">
                        <MoreHorizontal className="h-3 w-3 text-emerald-600" />
                        <span>Interactive Controls</span>
                      </div>
                      <p className="text-[9px] text-emerald-600/70">Headers can be dragged to reorder and dragged at edges to resize.</p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full h-8 text-[10px] font-bold tracking-tight rounded-md border-dashed hover:bg-emerald-50 hover:text-emerald-700 hover:border-slate-200 transition-all gap-2"
                      onClick={resetLayout}
                    >
                      <RotateCcw className="h-3 w-3" />
                      RESET TO DEFAULT
                    </Button>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative custom-scrollbar flex flex-col bg-white min-h-0">
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
          <div style={{ minWidth: table.getTotalSize(), width: '100%' }} className="flex flex-col min-h-full">
            <div className="flex-1 text-sm flex flex-col" role="table">
              <div className="sticky top-0 z-20 flex flex-col" role="rowgroup">
                {table.getHeaderGroups().map((headerGroup) => (
                  <div key={headerGroup.id} className="flex bg-slate-50 border-b border-slate-200" role="row">
                    <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                      {headerGroup.headers.map((header) => (
                        <DraggableHeader key={header.id} header={header} />
                      ))}
                    </SortableContext>
                  </div>
                ))}
              </div>

              <div className="bg-white flex-1 flex flex-col" role="rowgroup">
                {loading ? (
                  <div className="flex-1 min-h-[200px] flex items-center justify-center text-slate-600">
                    Loading...
                  </div>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <div
                      key={row.id}
                      role="row"
                      className={cn(
                        'flex border-b border-slate-200 transition-colors hover:bg-slate-50 bg-white',
                        row.getIsSelected() && 'bg-blue-50/20',
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isActions = cell.column.id === 'actions'
                        const isSelect = cell.column.id === 'select'
                        const isResizable = cell.column.getCanResize()
                        return (
                          <div
                            key={cell.id}
                            role="cell"
                            className={cn(
                              'flex items-center px-3 py-2 border-r border-slate-200 last:border-r-0 h-12 overflow-hidden text-sm',
                              (isActions || isSelect) && 'justify-center',
                            )}
                            style={{
                              width: cell.column.getSize(),
                              flex: isResizable ? `${cell.column.getSize()} 0 ${cell.column.getSize()}px` : `0 0 ${cell.column.getSize()}px`,
                              minWidth: cell.column.columnDef.minSize,
                              maxWidth: cell.column.columnDef.maxSize,
                            }}
                          >
                            <div className={cn('w-full h-full flex items-center px-1 rounded-sm transition-colors', !isActions && !isSelect && 'truncate')}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))
                ) : (
                  <div className="flex-1 min-h-[200px] flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center text-emerald-600/40 w-full">
                      <FilterX className="h-12 w-12 mb-4 opacity-30" />
                      <p className="text-sm font-semibold">{emptyTitle}</p>
                      <p className="text-xs">{emptySubtitle}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {totals?.enabled && (
              <div className="sticky bottom-0 z-10 bg-slate-50 border-t border-slate-200 flex mt-auto" role="row">
                {visibleLeafColumns.map((column) => {
                  const isSelect = column.id === 'select'
                  const isActions = column.id === 'actions'
                  const colTotal = totalsMap[column.id]
                  const displayValue = typeof colTotal === 'number' && totals?.formatValue
                    ? totals.formatValue(colTotal, column.id)
                    : colTotal

                  return (
                    <div
                      key={column.id}
                      className={cn(
                        'px-3 py-2 flex items-center border-r border-slate-200 font-bold text-[10px] uppercase tracking-tight text-slate-500 last:border-r-0 h-10 overflow-hidden',
                        ((column.columnDef.meta as any)?.align === 'right') && 'justify-end',
                        ((column.columnDef.meta as any)?.align === 'center') && 'justify-center',
                        ((column.columnDef.meta as any)?.align !== 'right' && (column.columnDef.meta as any)?.align !== 'center') && 'justify-start',
                        isSelect && 'justify-center',
                      )}
                      style={{
                        width: column.getSize(),
                        flex: column.getCanResize() ? `${column.getSize()} 0 ${column.getSize()}px` : `0 0 ${column.getSize()}px`,
                        minWidth: column.columnDef.minSize,
                        maxWidth: column.columnDef.maxSize,
                      }}
                    >
                      <span className="truncate">
                        {displayValue ?? ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DndContext>
      </div>

      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rows per page</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
          >
            {[10, 20, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Page <span className="text-gray-700">{table.getState().pagination.pageIndex + 1}</span> of{' '}
            <span className="text-gray-700">{table.getPageCount() || 1}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-gray-500 border-slate-200 bg-white hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm rounded-md"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-gray-500 border-slate-200 bg-white hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm rounded-md"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-gray-500 border-slate-200 bg-white hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm rounded-md"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-gray-500 border-slate-200 bg-white hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm rounded-md"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
