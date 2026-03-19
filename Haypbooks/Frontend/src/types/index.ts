/**
 * Central types barrel — import shared types from '@/types'.
 * Add domain types here or re-export from domain.ts.
 */
export * from './domain'

// ─── Shared primitives ────────────────────────────────────────────────────────

export type UUID = string
export type ISODate = string   // "YYYY-MM-DD"
export type ISODateTime = string // "YYYY-MM-DDTHH:mm:ssZ"

export type CurrencyCode = string  // ISO 4217 e.g. "USD"

export type SortDirection = 'asc' | 'desc'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
