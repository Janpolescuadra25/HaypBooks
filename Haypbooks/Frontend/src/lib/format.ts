// Shared formatting utilities for currency, numbers, dates (lightweight)
// Centralizes Intl.* formatter caching to avoid recreation in render loops.

type CurrencyCode = string

const currencyFormatters = new Map<string, Intl.NumberFormat>()
const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })
let defaultCurrency: CurrencyCode = 'USD'

export function setDefaultCurrency(currency: CurrencyCode) {
  defaultCurrency = currency
}

export function formatCurrency(value: number | null | undefined, currency: CurrencyCode = defaultCurrency) {
  if (value == null || isNaN(value)) return '—'
  const key = `${currency}`
  let fmt = currencyFormatters.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency, currencyDisplay: 'symbol' })
    currencyFormatters.set(key, fmt)
  }
  return fmt.format(value)
}

export function formatNumber(value: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (value == null || isNaN(value)) return '—'
  if (!opts) return numberFormatter.format(value)
  // Non-cached custom options path (used infrequently)
  return new Intl.NumberFormat(undefined, opts).format(value)
}

export function formatPercent(value: number | null | undefined, fractionDigits = 1) {
  if (value == null || isNaN(value)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(value)
}

// Simple date formatting helpers could live here later if needed.

// Tabular helper wrapper for consistent className usage in components.
export const tabular = (s: string) => s
