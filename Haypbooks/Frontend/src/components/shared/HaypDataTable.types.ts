import { ColumnDef, SortingState, ColumnOrderState, VisibilityState, RowSelectionState, ColumnSizingState } from '@tanstack/react-table'
import { LucideIcon } from 'lucide-react'
import React from 'react'

export type HaypIcon = React.ReactNode | LucideIcon

export interface HaypColumn<T = any> {
  id: string
  header: string
  accessorKey?: keyof T | string
  size?: number
  minSize?: number
  maxSize?: number
  enableSorting?: boolean
  enableHiding?: boolean
  enableResizing?: boolean
  align?: 'left' | 'right' | 'center'
  cellClass?: string
  headerClass?: string
  render?: (value: any, row: T, rowIndex: number) => React.ReactNode
  isSummable?: boolean
  totalsRender?: (sum: number, allRows: T[]) => React.ReactNode
}

export interface HaypFilterOption {
  value: string
  label: string
}

export interface HaypActionItem {
  label: string
  icon?: React.ReactNode
  onClick: (rowId: string, row: any) => void
  disabled?: boolean
  danger?: boolean
  divider?: boolean
  show?: (row: any) => boolean
}

export interface HaypBulkAction {
  label: string
  icon?: React.ReactNode
  variant?: 'danger' | 'primary' | 'default'
  disabled?: boolean
  onClick: (selectedIds: string[], selectedRows: any[]) => void
}

export interface HaypTotalsConfig {
  enabled: boolean
  label?: string
  sumColumns?: string[]
  customTotals?: (rows: any[]) => Record<string, number | string>
  formatValue?: (value: number, columnId: string) => string
}

export interface HaypDataTableProps<T = any> {
  data: T[]
  columns: HaypColumn<T>[]
  tableId: string
  getRowId?: (row: T) => string
  searchPlaceholder?: string
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  filters?: HaypFilterOption[]
  activeFilter: string
  onFilterChange: (value: string) => void
  filterLabel?: string
  actions?: HaypActionItem[]
  bulkActions?: HaypBulkAction[]
  totals?: HaypTotalsConfig
  onRefresh?: () => void
  onExport?: () => void
  exportLabel?: string
  onActivityLog?: () => void
  emptyTitle?: string
  emptySubtitle?: string
  className?: string
  loading?: boolean
}

export interface UseHaypTableReturn {
  globalFilter: string
  setGlobalFilter: (val: string) => void
  activeFilter: string
  setActiveFilter: (val: string) => void
  selectedRowIds: string[]
  selectedRows: any[]
  clearSelection: () => void
  resetLayout: () => void
}
