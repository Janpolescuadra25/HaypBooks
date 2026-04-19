'use client'

import React, { useMemo } from 'react'
import { DataTable } from '@/components/DataTable'
import BulkActionBar, { type BulkAction } from './BulkActionBar'
import EmptyStateEnhanced from './EmptyStateEnhanced'
import { StatusBadge } from './StatusBadgeSet'

/* eslint-disable no-unused-vars */
type ColumnDef<T, TValue = unknown> = {
  id?: string
  accessorKey?: keyof T | string
  header?: React.ReactNode | (() => React.ReactNode)
  // eslint-disable-next-line no-unused-vars
  cell?: (args: {
    getValue: () => TValue
    row: { original: T }
    column: ColumnDef<T, TValue>
    table: unknown
  }) => React.ReactNode
  meta?: Record<string, any>
}

type InternalColumn<T> = {
  key: keyof T
  header: React.ReactNode
  align?: 'left' | 'center' | 'right'
  render?: (_value: unknown, _row: T) => React.ReactNode
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl'
  headerClassName?: string
  cellClassName?: string
}

interface DataPageProps<T extends Record<string, any>> {
  title: string
  subtitle?: string
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  secondaryActions?: React.ReactNode
  filters?: React.ReactNode
  columns: ColumnDef<T, any>[]
  data: T[]
  isLoading?: boolean
  currentPage: number
  totalPages: number
  totalCount?: number
  // eslint-disable-next-line no-unused-vars
  onPageChange: (_page: number) => void
  pageSize?: number
  // eslint-disable-next-line no-unused-vars
  onPageSizeChange?: (_size: number) => void
  selectedIds: string[]
  // eslint-disable-next-line no-unused-vars
  onSelectionChange: (_ids: string[]) => void
  // eslint-disable-next-line no-unused-vars
  getRowId?: (_row: T) => string
  bulkActions?: BulkAction[]
  emptyTitle?: string
  emptyDescription?: string
  emptyIllustration?: 'inbox' | 'search' | 'error' | 'documents' | 'users'
  emptyPrimaryAction?: string
  onEmptyPrimaryAction?: () => void
  className?: string
  compact?: boolean
}
/* eslint-enable no-unused-vars */

function mapColumns<T extends Record<string, any>>(columns: ColumnDef<T, any>[]): InternalColumn<T>[] {
  return columns.map((col, index) => {
    const accessorKey = col.accessorKey as keyof T | undefined
    const key = (accessorKey ?? (col.id as keyof T) ?? (`col-${index}` as keyof T)) as keyof T
    const header = typeof col.header === 'function' ? col.header() : col.header ?? ''
    const statusDomain = (col.meta as any)?.statusDomain as 'invoice' | 'journal-entry' | 'payment' | undefined

    const render = col.cell
      ? (value: unknown, row: T) => {
          const cellFn = col.cell as any
          return cellFn({ getValue: () => value, row: { original: row }, column: col, table: {} })
        }
      : statusDomain
      ? (value: unknown) => <StatusBadge status={String(value ?? '')} domain={statusDomain} />
      : undefined

    return {
      key,
      header,
      align: (col.meta as any)?.align,
      render,
      hideBelow: (col.meta as any)?.hideBelow,
      headerClassName: (col.meta as any)?.headerClassName,
      cellClassName: (col.meta as any)?.cellClassName,
    }
  })
}

function DataTableSkeleton({ columns }: { columns: number }) {
  return (
    <div data-testid="data-page-skeleton" className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 h-6 w-40 rounded-full bg-slate-200 animate-pulse" />
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-3 py-3 sm:grid-cols-3">
          {Array.from({ length: Math.max(columns, 3) }).map((__, colIndex) => (
            <div key={colIndex} className="h-4 w-full rounded bg-slate-200 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function DataPage<T extends Record<string, any>>({
  title,
  subtitle,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActions,
  filters,
  columns,
  data,
  isLoading = false,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  selectedIds,
  onSelectionChange,
  getRowId,
  bulkActions = [],
  emptyTitle,
  emptyDescription,
  emptyIllustration,
  emptyPrimaryAction,
  onEmptyPrimaryAction,
  className = '',
  compact = false,
}: DataPageProps<T>) {
  const effectiveTotal = totalCount ?? data.length
  type RowWithKey = T & { __dataPageKey: string }
  const rowsWithKey = useMemo<RowWithKey[]>(
    () =>
      data.map((row, index) => ({
        ...row,
        __dataPageKey:
          getRowId?.(row) ?? String((row as any).id ?? index),
      })),
    [data, getRowId],
  )

  const tableColumns = useMemo(() => mapColumns<T>(columns), [columns])

  const selectedCount = selectedIds.length
  const selectionEnabled = Boolean(onSelectionChange)

  const handleToggleRow = (key: string, selected: boolean) => {
    if (!selectionEnabled) return
    const next = selected
      ? [...selectedIds, key]
      : selectedIds.filter((id) => id !== key)
    onSelectionChange(next)
  }

  const handleToggleAll = (selected: boolean, keys: string[]) => {
    if (!selectionEnabled) return
    onSelectionChange(selected ? keys : [])
  }

  const showPagination = !isLoading && data.length > 0
  const firstRow = (currentPage - 1) * pageSize + 1
  const lastRow = Math.min(currentPage * pageSize, effectiveTotal)

  return (
    <main role="main" className={`space-y-6 ${className}`.trim()}>
      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3"> 
            {primaryActionLabel && (
              <button
                type="button"
                onClick={onPrimaryAction}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                {primaryActionLabel}
              </button>
            )}
            {secondaryActions}
          </div>
        </div>
        {filters && (
          <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
            {filters}
          </div>
        )}
      </div>

      {selectedCount > 0 && (
        <BulkActionBar
          selectedCount={selectedCount}
          onClearSelection={() => onSelectionChange([])}
          actions={bulkActions}
        />
      )}

      {isLoading ? (
        <DataTableSkeleton columns={tableColumns.length} />
      ) : data.length === 0 ? (
        <EmptyStateEnhanced
          title={emptyTitle ?? `No ${title.toLowerCase()}`}
          description={emptyDescription}
          illustration={emptyIllustration ?? 'inbox'}
          primaryActionLabel={emptyPrimaryAction}
          onPrimaryAction={onEmptyPrimaryAction}
        />
      ) : (
        <DataTable
          columns={tableColumns}
          rows={rowsWithKey}
          keyField="__dataPageKey"
          dense={compact}
          striped
          fancyHover
          caption={`${title} table`}
          selectableRows={selectionEnabled}
          selectedKeys={selectedIds}
          onToggleRow={handleToggleRow}
          onToggleAll={handleToggleAll}
        />
      )}

      {showPagination && (
        <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Showing {firstRow}-{lastRow} of {effectiveTotal}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
            {onPageSizeChange && (
              <select
                value={pageSize}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                aria-label="Page size"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
