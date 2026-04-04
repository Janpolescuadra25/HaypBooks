'use client'
export const dynamic = 'force-dynamic'

import React, { useCallback } from 'react'
import { useParams } from 'next/navigation'
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

export default function AccountAuditLogPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const params = useParams() as { id?: string }
  const accountId = params.id

  const fetchLogs = useCallback(
    async ({ companyId: cid, actionFilter, dateRange }: {
      companyId: string
      actionFilter: string
      dateRange: string
    }): Promise<AuditEntry[]> => {
      const queryParams = new URLSearchParams()
      if (accountId) queryParams.set('accountId', accountId)
      if (actionFilter !== 'ALL') queryParams.set('action', actionFilter)
      if (dateRange !== 'all') queryParams.set('range', dateRange)
      const { data } = await apiClient.get(
        `/companies/${cid}/accounting/accounts/audit-log?${queryParams.toString()}`
      )
      return Array.isArray(data) ? data : (data?.logs ?? [])
    },
    [accountId]
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
      title="Account Audit Log"
      subtitle={accountId ? `Change history for account ${accountId.slice(0, 8)}…` : 'Account change history'}
      backLabel="Back to Chart of Accounts"
      backHref="/accounting/core-accounting/chart-of-accounts"
      companyId={companyId}
      actionOptions={ACTION_OPTIONS}
      defaultRange="30d"
      onFetchLogs={fetchLogs}
    />
  )
}
