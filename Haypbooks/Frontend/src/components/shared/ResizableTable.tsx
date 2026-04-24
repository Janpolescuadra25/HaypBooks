'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'

export interface Column<T = any> {
  key: string
  header: string | React.ReactNode
  width: number
  minWidth?: number
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  render?: (value: any, row: T, index: number) => React.ReactNode
}

export interface ResizableTableProps<T = any> {
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
}

export default function ResizableTable<T extends Record<string, any>>({
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
}: ResizableTableProps<T>) {
  const [tableColumns, setTableColumns] = useState(columns)
  const columnsRef = useRef(tableColumns)

  useEffect(() => {
    const current = columnsRef.current
    const next = columns
    const same = current.length === next.length && current.every((col, index) => {
      const nextCol = next[index]
      return col.key === nextCol.key && col.width === nextCol.width && col.sortable === nextCol.sortable && col.align === nextCol.align
    })
    if (!same) {
      setTableColumns(next)
    }
  }, [columns])

  useEffect(() => {
    columnsRef.current = tableColumns
  }, [tableColumns])

  const saveColumns = useCallback(
    (next: Column<T>[]) => {
      setTableColumns(next)
      onColumnsChange?.(next)
    },
    [onColumnsChange],
  )

  const { containerRef, startResize, isOverflowing } = useFixedWidthResizableColumns({
    columns: tableColumns,
    columnsRef,
    saveColumns,
    fixedWidth,
    minWidth: 80,
  })

  const handleHeaderClick = useCallback(
    (key: string, sortable?: boolean) => {
      if (!onSort || !sortable) return
      if (sortKey === key) {
        onSort(key, sortDir === 'asc' ? 'desc' : 'asc')
      } else {
        onSort(key, 'asc')
      }
    },
    [onSort, sortDir, sortKey],
  )

  return (
    <div ref={containerRef} className={`rounded-xl border border-gray-200 ${isOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'} bg-white shadow-sm`}>
      <table className="w-full text-sm border-collapse table-fixed [&_input]:rounded-none [&_select]:rounded-none">
        <colgroup>
          {tableColumns.map((column) => (
            <col key={column.key} width={column.width} />
          ))}
        </colgroup>
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {tableColumns.map((column) => (
              <th
                key={column.key}
                className={`relative px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 select-none overflow-hidden text-left ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => handleHeaderClick(column.key, column.sortable)}
                  className={`flex items-center gap-1 min-w-0 overflow-hidden ${column.sortable ? 'cursor-pointer' : ''}`}
                >
                  <span className="truncate text-xs">{column.header}</span>
                  {column.sortable ? (
                    <ArrowUpDown
                      size={11}
                      className={`shrink-0 ${sortKey === column.key ? 'text-emerald-600' : 'text-gray-300'}`}
                    />
                  ) : null}
                </button>
                <div
                  className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-emerald-200/60 select-none"
                  onMouseDown={(event) => startResize(event, column.key)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={tableColumns.length} className="px-4 py-16 text-center text-sm text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                className={`border-b border-gray-100 hover:bg-slate-50 transition-colors ${rowClassName ? rowClassName(row, index) : ''}`}
              >
                {tableColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-2.5 border-r border-gray-100 overflow-hidden text-sm ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}`}
                  >
                    {column.render ? column.render((row as any)[column.key], row, index) : String((row as any)[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
