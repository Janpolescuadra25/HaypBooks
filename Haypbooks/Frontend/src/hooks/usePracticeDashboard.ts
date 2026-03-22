'use client'
import { useState, useEffect, useCallback } from 'react'
import apiClient from '@/lib/api-client'

type PracticeDashboardData = {
  firmName: string
  activeClientCount: number
  pendingTasks: number
}

type PracticeClient = {
  id: string
  name: string
  currency: string
  isActive: boolean
}

export function usePracticeDashboard() {
  const [data, setData] = useState<PracticeDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<PracticeDashboardData>('/api/practice/dashboard')
      setData(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load practice dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { data, loading, error, refresh: load }
}

export function usePracticeClients() {
  const [clients, setClients] = useState<PracticeClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<PracticeClient[]>('/api/practice/clients')
      setClients(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load clients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { clients, loading, error, refresh: load }
}
