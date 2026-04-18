'use client'

import { useCallback, useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'
import type { ActivityLogItem } from '@/components/ui/ActivityLog'

export interface ActivityLogFilters {
  tableName?: string
  entityType?: string
  userId?: string
  from?: string
  to?: string
}

interface UseActivityLogOptions {
  companyId?: string | null
  pageSize?: number
  initialFilters?: ActivityLogFilters
}

export function useActivityLog({
  companyId,
  pageSize = 30,
  initialFilters,
}: UseActivityLogOptions) {
  const [entries, setEntries] = useState<ActivityLogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [filters, setFilters] = useState<ActivityLogFilters>(() => initialFilters ?? {})

  const fetchActivity = useCallback(async () => {
    if (!companyId) {
      setEntries([])
      setHasMore(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }
      const tableName = filters.tableName || filters.entityType
      if (tableName) params.tableName = tableName
      if (filters.userId) params.userId = filters.userId
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to

      const { data } = await apiClient.get(`/companies/${companyId}/integrations/audit-logs`, { params })
      const rows: ActivityLogItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : []

      setEntries(rows)
      setHasMore(rows.length === pageSize)
    } catch (err: any) {
      setEntries([])
      setHasMore(false)
      setError(err?.response?.data?.message ?? 'Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }, [companyId, page, pageSize, filters.tableName, filters.entityType, filters.userId, filters.from, filters.to])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  const patchFilters = useCallback((next: Partial<ActivityLogFilters>) => {
    setPage(1)
    setFilters((prev) => ({ ...prev, ...next }))
  }, [])

  const resetFilters = useCallback(() => {
    setPage(1)
    setFilters({})
  }, [])

  return {
    entries,
    loading,
    error,
    page,
    pageSize,
    hasMore,
    filters,
    setPage,
    patchFilters,
    resetFilters,
    refetch: fetchActivity,
  }
}
