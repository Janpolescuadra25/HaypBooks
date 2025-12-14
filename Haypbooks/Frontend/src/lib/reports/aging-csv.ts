import { formatCurrency } from '@/lib/format'
import { formatAsOf } from '@/lib/date'

export type AgingRow = {
  name: string
  current: number
  '30': number
  '60': number
  '90': number
  '120+': number
  total: number
}

// Build standardized CSV rows for AR/AP aging summary exports.
// - entityLabel: 'Customer' | 'Vendor'
// - includeVersionRow: when true, prepends ['CSV-Version','1']
export function buildAgingSummaryCsvRows(args: {
  entityLabel: 'Customer' | 'Vendor'
  asOfIso: string
  rows: AgingRow[]
  totals: { current: number; '30': number; '60': number; '90': number; '120+': number; total: number }
  baseCurrency: string
  includeVersionRow?: boolean
}): string[][] {
  const { entityLabel, asOfIso, rows, totals, baseCurrency, includeVersionRow } = args
  const out: string[][] = []
  if (includeVersionRow) out.push(['CSV-Version', '1'])
  out.push(['As of', formatAsOf(asOfIso)])
  out.push([entityLabel, 'Current', '30', '60', '90', '120+', 'Total'])
  for (const r of rows) {
    out.push([
      r.name,
      formatCurrency(Number(r.current) || 0, baseCurrency),
      formatCurrency(Number((r as any)['30']) || 0, baseCurrency),
      formatCurrency(Number((r as any)['60']) || 0, baseCurrency),
      formatCurrency(Number((r as any)['90']) || 0, baseCurrency),
      formatCurrency(Number((r as any)['120+']) || 0, baseCurrency),
      formatCurrency(Number(r.total) || 0, baseCurrency),
    ])
  }
  out.push([
    'Totals',
    formatCurrency(Number((totals as any).current) || 0, baseCurrency),
    formatCurrency(Number((totals as any)['30']) || 0, baseCurrency),
    formatCurrency(Number((totals as any)['60']) || 0, baseCurrency),
    formatCurrency(Number((totals as any)['90']) || 0, baseCurrency),
    formatCurrency(Number((totals as any)['120+']) || 0, baseCurrency),
    formatCurrency(Number((totals as any).total) || 0, baseCurrency),
  ])
  return out
}

// RFC4180-ish CSV stringifier with quoting/escaping for commas, quotes, and newlines
export function toCSV(rows: string[][]): string {
  return rows
    .map((r) =>
      r
        .map((c) => {
          if (c == null) return ''
          const s = String(c)
          if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
          return s
        })
        .join(',')
    )
    .join('\n')
}

// Build standardized CSV rows for AR/AP aging DETAIL exports.
// Accepts a pre-built caption (via buildCsvRangeOrDate) and inserts a blank spacer before the header.
export function buildAgingDetailCsvRows(args: {
  caption: string
  includeVersionRow?: boolean
  entityLabel: 'Customer' | 'Vendor'
  dateHeaderLabel: string // 'Invoice Date' | 'Bill Date'
  rows: Array<{
    entityName: string
    type: string
    number: string
    date: string
    dueDate: string
    aging: number
    openBalance: number
  }>
  totalsOpenBalance?: number
  baseCurrency: string
}): string[][] {
  const { caption, includeVersionRow, entityLabel, dateHeaderLabel, rows, totalsOpenBalance, baseCurrency } = args
  const out: string[][] = []
  if (includeVersionRow) out.push(['CSV-Version', '1'])
  out.push([caption])
  out.push([])
  out.push([entityLabel, 'Type', 'Number', dateHeaderLabel, 'Due Date', 'Aging (days)', 'Open Balance'])
  for (const r of rows) {
    out.push([
      r.entityName,
      r.type,
      r.number,
      r.date,
      r.dueDate,
      String(r.aging ?? ''),
      formatCurrency(Number(r.openBalance) || 0, baseCurrency),
    ])
  }
  if (typeof totalsOpenBalance === 'number') {
    out.push(['Totals', '', '', '', '', '', formatCurrency(Number(totalsOpenBalance) || 0, baseCurrency)])
  }
  return out
}
