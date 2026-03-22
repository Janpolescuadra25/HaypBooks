'use client'
import { useEffect, useState, useCallback } from 'react'
import apiClient from '@/lib/api-client'

type OwnerDashboardData = {
  companyName: string
  currency: string
  activeUserCount: number
  isCoASeeded: boolean
  bankBalance: number
  companyId: string
  workspaceId: string
}

export function useOwnerDashboard() {
  const [data, setData] = useState<OwnerDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<OwnerDashboardData>('/api/owner/dashboard')
      setData(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load owner dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { data, loading, error, refresh: load }
}
