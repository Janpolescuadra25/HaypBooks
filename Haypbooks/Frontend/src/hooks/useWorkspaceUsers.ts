'use client'
import { useEffect, useState, useCallback } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'

type WorkspaceUserItem = {
  user: {
    id: string
    name?: string
    email?: string
  }
  role?: { id: string; name: string }
  status?: string
  isOwner?: boolean
}

export function useWorkspaceUsers() {
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const [data, setData] = useState<WorkspaceUserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!companyId) {
      setData([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<WorkspaceUserItem[]>(`/api/companies/${companyId}/workspace-users`)
      setData(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load workspace users')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { if (!companyLoading) load() }, [companyLoading, load])

  return { data, loading, error: error || (companyError ?? null), companyId, refresh: load }
}
