'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, GripVertical } from 'lucide-react'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'

export interface Column<T = any> {
  key: string
  header: string | React.ReactNode
  width: number
  minWidth?: number
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  render?: (value: any, row: T, index: number) => React.ReactNode
  className?: string
  isAction?: boolean
  stickyLeft?: number
  visible?: boolean
}

export interface BulkAction<T = any> {
  label: string
  icon?: React.ReactNode
  variant?: 'danger' | 'primary' | 'default'
  disabled?: boolean
  onClick: () => void
}

export interface EnhancedTableProps<T = any> {
  columns: Column<T>[]
  data: T[]
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  emptyMessage?: string
  onRowClick?: (row: T, index: number) => void
  rowClassName?: (row: T, index: number) => string
  onColumnsChange?: (next: Column<T>[]) => void
  fixedWidth?: number
  tableId?: string
  hasStickyActions?: boolean
  enableRowSelection?: boolean
  selectedRows?: string[]
  toggleRowSelection?: (id: string) => void
  handleSelectAll?: () => void
  isAllSelected?: boolean
  isIndeterminate?: boolean
  selectAllRef?: React.RefObject<HTMLInputElement>
  className?: string
}

const STORAGE_PREFIX = 'haypbooks-enhanced-table-order:'
const EPSILON = 0.5

function areArraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false
  return left.every((value, index) => value === right[index])
}

function normalizeOrder(order: string[], columns: Column[]) {
  const availableKeys = columns.map((column) => column.key)
  const filtered = order.filter((key) => availableKeys.includes(key))
  return [...filtered, ...availableKeys.filter((key) => !filtered.includes(key))]
}

function getStorageKey(tableId?: string): string | null {
  if (!tableId) return null
  return `${STORAGE_PREFIX}${tableId}`
}

function getFallbackStorageKey(): string {
  if (typeof window === 'undefined') return `${STORAGE_PREFIX}default`
  return `${STORAGE_PREFIX}${window.location.pathname}`
}

export interface UseEnhancedTableOptions<T = any> {
  data: T[]
  tableId?: string
  onSelectionChange?: (selectedIds: string[]) => void
}

export interface UseEnhancedTableResult<T = any> {
  selectedRows: string[]
  toggleRowSelection: (id: string) => void
  handleSelectAll: () => void
  clearSelection: () => void
  isAllSelected: boolean
  isIndeterminate: boolean
  selectAllRef: React.RefObject<HTMLInputElement>
  renderCheckboxColumn: () => Column<T>
  renderBulkToolbar: (actions: BulkAction<T>[]) => JSX.Element | null
  exportSelectedToCsv: (filename: string, headers: string[], rowMapper: (row: T) => string[]) => void
}

export function useEnhancedTable<T extends Record<string, any>>({
  data,
  tableId,
  onSelectionChange,
}: UseEnhancedTableOptions<T>): UseEnhancedTableResult<T> {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const selectAllRef = useRef<HTMLInputElement>(null)

  const visibleRowIds = useMemo(
    () => (data || []).map((row) => String((row as any).id)).filter(Boolean),
    [data],
  )

  const isAllSelected = visibleRowIds.length > 0 && visibleRowIds.every((id) => selectedRows.includes(id))
  const isIndeterminate = selectedRows.length > 0 && !isAllSelected

  useEffect(() => {
    setSelectedRows([])
  }, [data])

  useEffect(() => {
    onSelectionChange?.(selectedRows)
  }, [onSelectionChange, selectedRows])

  const handleSelectAll = useCallback(() => {
    setSelectedRows((prev) => (isAllSelected ? [] : visibleRowIds))
  }, [isAllSelected, visibleRowIds])

  const toggleRowSelection = useCallback((id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedRows([])
  }, [])

  const exportSelectedToCsv = useCallback(
    (filename: string, headers: string[], rowMapper: (row: T) => string[]) => {
      const selectedData = data.filter((row) => selectedRows.includes(String((row as any).id)))
      const csvBody = [headers.join(','), ...selectedData.map((row) => rowMapper(row).map((value) => JSON.stringify(value ?? '')).join(','))].join('\n')
      const blob = new Blob([csvBody], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    [data, selectedRows],
  )

  const renderCheckboxColumn = useCallback((): Column<T> => ({
    key: '__select__',
    header: (
      <div className="flex items-center justify-center px-2">
        <input
          ref={selectAllRef}
          type="checkbox"
          checked={isAllSelected}
          onChange={handleSelectAll}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
          aria-label="Select all rows"
        />
      </div>
    ),
    width: 48,
    minWidth: 48,
    stickyLeft: 0,
    render: (_value, row) => {
      const id = String((row as any).id)
      const checked = selectedRows.includes(id)
      return (
        <div className="flex items-center justify-center px-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleRowSelection(id)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
            aria-label={checked ? 'Deselect row' : 'Select row'}
          />
        </div>
      )
    },
  }), [handleSelectAll, isAllSelected, selectedRows, toggleRowSelection])

  const renderBulkToolbar = useCallback(
    (actions: BulkAction<T>[]) => {
      if (selectedRows.length === 0) return null
      return (
        <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">{selectedRows.length} selected</span>
            <div className="flex flex-wrap gap-2 ml-auto">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  disabled={action.disabled}
                  onClick={action.onClick}
                  className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${action.variant === 'danger' ? 'bg-rose-600 text-white hover:bg-rose-700' : action.variant === 'primary' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )
    },
    [selectedRows, clearSelection],
  )

  return {
    selectedRows,
    toggleRowSelection,
    handleSelectAll,
    clearSelection,
    isAllSelected,
    isIndeterminate,
    selectAllRef,
    renderCheckboxColumn,
    renderBulkToolbar,
    exportSelectedToCsv,
  }
}

export default function EnhancedTable<T extends Record<string, any>>({
  columns,
  data,
  onSort,
  sortKey,
  sortDir,
  emptyMessage = 'No records found',
  onRowClick,
  rowClassName,
  onColumnsChange,
  fixedWidth = 96,
  tableId,
  hasStickyActions = false,
  enableRowSelection = false,
  selectedRows = [],
  toggleRowSelection,
  handleSelectAll,
  isAllSelected,
  isIndeterminate,
  selectAllRef,
  className = '',
}: EnhancedTableProps<T>) {
  const [columnOrder, setColumnOrder] = useState<string[]>(() => columns.map((column) => column.key))
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const columnsRef = useRef(columns)
  const internalSelectAllRef = useRef<HTMLInputElement>(null)
  const headerSelectAllRef = selectAllRef ?? internalSelectAllRef

  useEffect(() => {
    if (headerSelectAllRef.current) {
      headerSelectAllRef.current.indeterminate = isIndeterminate ?? false
    }
  }, [headerSelectAllRef, isIndeterminate])

  const hasSelection = enableRowSelection && toggleRowSelection && handleSelectAll && typeof isAllSelected === 'boolean' && typeof isIndeterminate === 'boolean'

  const selectionColumn = useMemo<Column<T> | undefined>(() => {
    if (!hasSelection) return undefined
    return {
      key: '__select__',
      header: (
        <div className="flex items-center justify-center px-2">
          <input
            ref={headerSelectAllRef}
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
            aria-label="Select all rows"
          />
        </div>
      ),
      width: 48,
      minWidth: 48,
      stickyLeft: 0,
      render: (_value, row) => {
        const rowId = String((row as any).id)
        const checked = selectedRows.includes(rowId)
        return (
          <div className="flex items-center justify-center px-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => {
                event.stopPropagation()
                toggleRowSelection(rowId)
              }}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
              aria-label={checked ? 'Deselect row' : 'Select row'}
            />
          </div>
        )
      },
    }
  }, [hasSelection, headerSelectAllRef, isAllSelected, selectedRows, handleSelectAll, toggleRowSelection])

  const orderKey = useMemo(() => getStorageKey(tableId) ?? getFallbackStorageKey(), [tableId])

  const columnsMap = useMemo(() => new Map(columns.map((column) => [column.key, column])), [columns])
  const orderedColumns = useMemo(() => columnOrder
    .map((key) => columnsMap.get(key))
    .filter((column): column is Column<T> => Boolean(column)),
  [columnOrder, columnsMap])

  const visibleColumns = useMemo(
    () => orderedColumns.filter((column) => column.visible !== false),
    [orderedColumns],
  )

  const hasManualSelectionColumn = useMemo(
    () => visibleColumns.some((column) => column.key === '__select__' || column.key === 'select'),
    [visibleColumns],
  )

  const renderedColumns = useMemo(
    () => (selectionColumn && !hasManualSelectionColumn ? [selectionColumn, ...visibleColumns] : visibleColumns),
    [selectionColumn, hasManualSelectionColumn, visibleColumns],
  )

  useEffect(() => {
    columnsRef.current = visibleColumns
  }, [visibleColumns])

  useEffect(() => {
    setColumnOrder((current) => normalizeOrder(current, columns))
  }, [columns])

  useEffect(() => {
    if (!orderKey || typeof window === 'undefined') return
    try {
      const stored = window.sessionStorage.getItem(orderKey)
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) return
      const normalized = normalizeOrder(parsed, columns)
      if (!areArraysEqual(normalized, columnOrder)) {
        setColumnOrder(normalized)
      }
    } catch {
      // ignore invalid storage data
    }
  }, [columns, columnOrder, orderKey])

  const saveColumns = useCallback(
    (next: Column<T>[]) => {
      onColumnsChange?.(next)
    },
    [onColumnsChange],
  )

  const { containerRef, startResize, isOverflowing } = useFixedWidthResizableColumns({
    columns: visibleColumns,
    columnsRef,
    saveColumns,
    fixedWidth,
    minWidth: 80,
  })

  const handleHeaderClick = useCallback(
    (column: Column<T>) => {
      if (!onSort || !column.sortable) return
      if (sortKey === column.key) {
        onSort(column.key, sortDir === 'asc' ? 'desc' : 'asc')
      } else {
        onSort(column.key, 'asc')
      }
    },
    [onSort, sortDir, sortKey],
  )

  const persistOrder = useCallback((order: string[]) => {
    if (!orderKey || typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(orderKey, JSON.stringify(order))
    } catch {
      // ignore storage failures
    }
  }, [orderKey])

  const handleColumnDragStart = useCallback((event: React.DragEvent<HTMLTableHeaderCellElement>, index: number) => {
    event.stopPropagation()
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
    setDraggedIndex(index)
    setDragOverIndex(index)
  }, [])

  const handleColumnDragOver = useCallback((event: React.DragEvent<HTMLTableHeaderCellElement>, index: number) => {
    event.preventDefault()
    event.stopPropagation()
    if (draggedIndex === null) return
    if (index !== dragOverIndex) {
      setDragOverIndex(index)
    }
  }, [draggedIndex, dragOverIndex])

  const handleColumnDrop = useCallback((event: React.DragEvent<HTMLTableHeaderCellElement>, targetIndex: number) => {
    event.preventDefault()
    event.stopPropagation()
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const nextOrder = [...columnOrder]
    const [movedKey] = nextOrder.splice(draggedIndex, 1)
    const insertIndex = targetIndex > draggedIndex ? targetIndex : targetIndex
    nextOrder.splice(insertIndex, 0, movedKey)
    setColumnOrder(nextOrder)
    persistOrder(nextOrder)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [columnOrder, draggedIndex, persistOrder])

  const handleColumnDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  const handleRowClick = useCallback((row: T, index: number) => {
    onRowClick?.(row, index)
  }, [onRowClick])

  return (
    <div ref={containerRef} className={`overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm ${className}`}>
      <table className="w-full min-w-max text-sm">
        <colgroup>
          {renderedColumns.map((column) => (
            <col key={column.key} width={column.width} />
          ))}
        </colgroup>
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {renderedColumns.map((column, index) => {
              const isAction = column.isAction === true
              const isStickyAction = isAction && hasStickyActions
              const isStickyLeft = column.stickyLeft !== undefined
              const isDragging = draggedIndex === index
              const isDragOver = dragOverIndex === index && draggedIndex !== index
              const isDraggable = !isAction && !isStickyLeft

              return (
                <th
                  key={column.key}
                  draggable={isDraggable}
                  onDragStart={isDraggable ? (event) => handleColumnDragStart(event, index) : undefined}
                  onDragOver={(event) => handleColumnDragOver(event, index)}
                  onDrop={(event) => handleColumnDrop(event, index)}
                  onDragEnd={handleColumnDragEnd}
                  style={column.stickyLeft !== undefined ? { left: column.stickyLeft } : undefined}
                  className={`group relative whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600 border-r border-slate-200 select-none min-w-[80px] ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''} ${column.className ?? ''} ${isStickyAction ? 'sticky right-0 z-20 bg-slate-50' : ''} ${isStickyLeft ? 'sticky left-0 z-30 bg-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {!isAction && (
                      <GripVertical size={14} className={`text-slate-400 transition-opacity ${isDragging ? 'opacity-100 cursor-grabbing' : 'opacity-0 group-hover:opacity-100 cursor-grab'}`} />
                    )}
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      <span className="truncate text-xs font-semibold text-slate-700">{column.header}</span>
                      {column.sortable ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleHeaderClick(column)
                          }}
                          className={`shrink-0 ${sortKey === column.key ? 'text-emerald-600' : 'text-slate-300'}`}
                          aria-label={`Sort by ${typeof column.header === 'string' ? column.header : 'column'}`}
                        >
                          <ArrowUpDown size={12} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {isDragOver && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-emerald-600" />
                  )}
                  <div
                    className="absolute inset-y-0 right-0 w-2 cursor-col-resize"
                    onMouseDown={(event) => startResize(event, column.key)}
                  />
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={renderedColumns.length} className="px-4 py-16 text-center text-sm text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={((row as any).id ?? rowIndex)}
                onClick={onRowClick ? () => handleRowClick(row, rowIndex) : undefined}
                className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${rowClassName ? rowClassName(row, rowIndex) : ''}`}
              >
                {renderedColumns.map((column) => {
                  const isAction = column.isAction === true
                  const isStickyAction = isAction && hasStickyActions
                  return (
                    <td
                      key={column.key}
                      style={column.stickyLeft !== undefined ? { left: column.stickyLeft } : undefined}
                      className={`px-4 py-3 border-r border-slate-100 align-top text-sm min-w-[80px] ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''} ${isStickyAction ? 'sticky right-0 z-10 bg-white' : ''} ${column.stickyLeft !== undefined ? 'sticky left-0 z-20 bg-white' : ''}`}
                    >
                      {column.render ? column.render((row as any)[column.key], row, rowIndex) : String((row as any)[column.key] ?? '')}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
