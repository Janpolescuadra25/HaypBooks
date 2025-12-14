import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'

export interface TransactionDto {
  id: string
  date: string
  description: string
  category: 'Income' | 'Expense' | 'Transfer'
  amount: number
  accountId: string
  bankStatus?: 'imported' | 'for_review' | 'categorized' | 'excluded'
  splits?: Array<{ accountId: string; amount: number; memo?: string; tags?: string[] }>
  suggestedCount?: number
}

export interface UseTransactionsOptions {
  start?: string
  end?: string
  type?: string
  page?: number
  limit?: number
  bankStatus?: string
  tag?: string
  accountId?: string
}

export interface UseTransactionsResult {
  transactions: TransactionDto[]
  total: number
  page: number
  limit: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  create: (input: Omit<TransactionDto, 'id'>) => Promise<TransactionDto>
  update: (input: TransactionDto) => Promise<TransactionDto>
  remove: (id: string) => Promise<void>
}

export function useTransactions(opts: UseTransactionsOptions): UseTransactionsResult {
  const { start, end, type, bankStatus, tag, accountId } = opts
  const page = opts.page || 1
  const limit = opts.limit || 20
  const [transactions, setTransactions] = useState<TransactionDto[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const query = useMemo(() => {
    const qs = new URLSearchParams()
    if (start) qs.set('start', start)
    if (end) qs.set('end', end)
  if (type) qs.set('type', type)
  if (bankStatus) qs.set('bankStatus', bankStatus)
    if (tag) qs.set('tag', tag)
    if (accountId) qs.set('accountId', accountId)
    // Hint API to include suggestedCount to reduce per-row fetches for For Review
    if (bankStatus === 'for_review') qs.set('includeSuggested', '1')
    qs.set('page', String(page))
    qs.set('limit', String(limit))
    return qs.toString()
  }, [start, end, type, bankStatus, tag, accountId, page, limit])

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await api<{ transactions: TransactionDto[]; total: number; page: number; limit: number }>(`/api/transactions?${query}`)
      setTransactions(data.transactions)
      setTotal(data.total)
    } catch (e: any) {
      setError(e.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => { load() }, [load])

  const refetch = useCallback(async () => { await load() }, [load])

  const create = useCallback(async (input: Omit<TransactionDto, 'id'>) => {
    const res = await api<{ transaction: TransactionDto }>(`/api/transactions`, { method: 'POST', body: JSON.stringify(input) })
    setTransactions(prev => [res.transaction, ...prev])
    setTotal(t => t + 1)
    return res.transaction
  }, [])

  const update = useCallback(async (input: TransactionDto) => {
    const res = await api<{ transaction: TransactionDto }>(`/api/transactions`, { method: 'PUT', body: JSON.stringify(input) })
    setTransactions(prev => prev.map(t => t.id === res.transaction.id ? res.transaction : t))
    return res.transaction
  }, [])

  const remove = useCallback(async (id: string) => {
    await api(`/api/transactions?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    setTransactions(prev => prev.filter(t => t.id !== id))
    setTotal(t => Math.max(0, t - 1))
  }, [])

  return { transactions, total, page, limit, loading, error, refetch, create, update, remove }
}
