export const currencySymbolMap: Record<string, string> = {
  USD: '$',
  PHP: '₱',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  KRW: '₩',
  THB: '฿',
  INR: '₹',
  AED: 'د.إ',
  SGD: 'S$',
  HKD: 'HK$',
  CHF: 'CHF',
  AUD: 'A$',
  CAD: 'C$',
}

export function formatCurrency(amount: number, currencyCode: string, decimalPlaces?: number): string {
  const code = String(currencyCode || 'USD').toUpperCase()
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: code,
    currencyDisplay: 'symbol',
    minimumFractionDigits: decimalPlaces ?? undefined,
    maximumFractionDigits: decimalPlaces ?? undefined,
  }

  try {
    return new Intl.NumberFormat(undefined, opts).format(amount)
  } catch {
    const symbol = currencySymbolMap[code] ?? code
    const formattedAmount = Number.isFinite(amount) ? amount.toFixed(decimalPlaces ?? 2) : String(amount)
    return `${symbol}${formattedAmount}`
  }
}
