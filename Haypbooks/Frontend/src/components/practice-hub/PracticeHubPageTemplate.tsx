'use client'

import React from 'react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import type { Column, FilterOption, BulkAction, SummaryCard } from '@/components/owner/OwnerPageTemplate'

export interface PracticeHubPageTemplateProps<T = any> {
  title: string
  description?: string
  section?: string
  icon?: React.ReactNode
  columns: Column<T>[]
  data: T[]
  idField?: string
  loading?: boolean
  searchable?: boolean
  searchableFields?: string[]
  searchPlaceholder?: string
  searchablePlaceholder?: string
  filters?: FilterOption[]
  summaryCards?: SummaryCard[]
  bulkActions?: BulkAction[]
  showCreate?: boolean
  createLabel?: string
  onCreate?: () => void
  showExport?: boolean
  onExport?: () => void
  showImport?: boolean
  onImport?: () => void
  onRefresh?: () => void
  onHelp?: () => void
  onSearch?: (value: string) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: { label: string; onClick: () => void }
  onRowClick?: (row: T) => void
  rowMenuItems?: (row: T) => { label: string; icon?: React.ReactNode; onClick: () => void; variant?: 'default' | 'danger' }[]
  rowInlineActions?: (row: T) => { icon: React.ReactNode; title: string; onClick: () => void; colorClass?: string }[]
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  pageSize?: number
  customEmpty?: React.ReactNode
  footer?: React.ReactNode
  headerActions?: React.ReactNode
  children?: React.ReactNode
  dataLoading?: boolean
}

export default function PracticeHubPageTemplate<T extends Record<string, any>>(props: PracticeHubPageTemplateProps<T>) {
  return <OwnerPageTemplate {...props} />
}
