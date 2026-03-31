// ─── Reusable Data Fetching Hook ────────────────────────────────────────
// Provides loading, error, data, refetch, and mutation for any API call

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import apiClient from '@/lib/api-client'

export interface UseApiOptions<T> {
  /** Initial data while loading */
  initialData?: T
  /** Whether to fetch on mount (default: true) */
  enabled?: boolean
  /** Callback on success */
  onSuccess?: (data: T) => void
  /** Callback on error */
  onError?: (error: string) => void
}

export interface UseApiResult<T> {
  data: T | undefined
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  setData: (data: T) => void
}

/**
 * Generic data fetching hook.
 *
 * @example
 * const { data, loading, error, refetch } = useApi(
 *   () => apiClient.get(`/companies/${companyId}/accounting/accounts`),
 *   { enabled: !!companyId }
 * )
 */
export function useApi<T = any>(
  fetcher: () => Promise<{ data: T }>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { initialData, enabled = true, onSuccess, onError } = options
  const [data, setData] = useState<T | undefined>(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetcher()
      if (mountedRef.current) {
        setData(res.data)
        onSuccess?.(res.data)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Request failed'
      if (mountedRef.current) {
        setError(msg)
        onError?.(msg)
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [enabled, onSuccess, onError]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true
    fetch()
    return () => { mountedRef.current = false }
  }, [fetch])

  return { data, loading, error, refetch: fetch, setData }
}

/**
 * Mutation hook for POST/PUT/DELETE operations.
 *
 * @example
 * const { mutate, loading, error } = useMutation(
 *   (data) => apiClient.post(`/companies/${companyId}/customers`, data)
 * )
 */
export function useMutation<TArgs = any, TResult = any>(
  mutator: (args: TArgs) => Promise<{ data: TResult }>,
  options: {
    onSuccess?: (data: TResult) => void
    onError?: (error: string) => void
  } = {}
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (args: TArgs) => {
    setLoading(true)
    setError(null)
    try {
      const res = await mutator(args)
      options.onSuccess?.(res.data)
      return res.data
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Operation failed'
      setError(msg)
      options.onError?.(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [mutator, options]) // eslint-disable-line react-hooks/exhaustive-deps

  return { mutate, loading, error, setError }
}
