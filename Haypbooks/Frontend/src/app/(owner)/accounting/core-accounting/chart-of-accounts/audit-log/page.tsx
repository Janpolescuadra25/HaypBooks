'use client'
export const dynamic = 'force-dynamic'

import React, { useCallback } from 'react'
import { useCompanyId } from '@/hooks/useCompanyId'
import apiClient from '@/lib/api-client'
import FullAuditLog, { AuditEntry } from '@/components/shared/FullAuditLog'
import { Loader2 } from 'lucide-react'

const ACTION_OPTIONS = [
  { key: 'ALL',        label: 'All Actions' },
  { key: 'CREATE',     label: 'Created' },
  { key: 'UPDATE',     label: 'Updated' },
  { key: 'DEACTIVATE', label: 'Deactivated' },
  { key: 'REACTIVATE', label: 'Reactivated' },
  { key: 'DELETE',     label: 'Deleted' },
]

export default function ChartOfAccountsAuditLogPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()

  const fetchLogs = useCallback(
    async ({ companyId: cid, actionFilter, dateRange }: {
      companyId: string
      actionFilter: string
      dateRange: string
    }): Promise<AuditEntry[]> => {
      const params = new URLSearchParams()
      if (actionFilter !== 'ALL') params.set('action', actionFilter)
      if (dateRange !== 'all') params.set('range', dateRange)
      const { data } = await apiClient.get(
        `/companies/${cid}/accounting/accounts/audit-log?${params.toString()}`
      )
      return Array.isArray(data) ? data : (data?.logs ?? [])
    },
    []
  )

  if (cidLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    )
  }

  if (cidError || !companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-red-500">{cidError ?? 'No company selected.'}</p>
      </div>
    )
  }

  return (
    <FullAuditLog
      title="Chart of Accounts Audit Log"
      subtitle="All account changes across your chart of accounts"
      backLabel="Back to Chart of Accounts"
      backHref="/accounting/core-accounting/chart-of-accounts"
      companyId={companyId}
      actionOptions={ACTION_OPTIONS}
      defaultRange="30d"
      onFetchLogs={fetchLogs}
    />
  )
}
