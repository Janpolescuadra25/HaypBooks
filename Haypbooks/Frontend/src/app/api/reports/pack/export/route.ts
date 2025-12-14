import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange, buildCsvCaption } from '@/lib/report-helpers'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { computeARAging, computeAPAging, computeProfitLoss, computeTrialBalance } from '@/mock/aggregations'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const format = url.searchParams.get('format') || 'csv'
  const preset = url.searchParams.get('preset') || 'YTD'
  const name = url.searchParams.get('name') || ''
  const start = url.searchParams.get('start') || ''
  const end = url.searchParams.get('end') || ''
  const reports = (url.searchParams.get('reports') || '').split(',').filter(Boolean)
  if (!reports.length) {
    return NextResponse.json({ error: 'No reports selected' }, { status: 400 })
  }

  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)

  if (format === 'pdf') {
    // Return a tiny PDF-like binary placeholder (but send proper header)
    const bytes = new Uint8Array([0x25,0x50,0x44,0x46,0x2D,0x31,0x2E,0x34,0x0A,0x25,0xE2,0xE3,0xCF,0xD3,0x0A])
    // Standardize filename using shared helper (period mode), with optional name token, then swap extension to .pdf
    const { start: dStart, end: dEnd } = deriveRange(preset, start || null, end || null)
    const tokens = safeName ? [sanitizeToken(safeName)] : undefined
    let baseName: string
    if (preset === 'Custom') {
      if (dStart && dEnd) {
        // For PDF in Custom range, prefer raw range without the 'Custom' label (per tests)
        baseName = buildCsvFilename('management-pack', { start: dStart, end: dEnd, tokens })
      } else {
        const asOfIso = dEnd || new Date().toISOString().slice(0, 10)
        baseName = buildCsvFilename('management-pack', { asOfIso, tokens })
      }
    } else {
      baseName = buildCsvFilename('management-pack', { period: preset, tokens })
    }
    const pdfName = baseName.replace(/\.csv$/i, '.pdf')
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfName}"`,
      },
    })
  }

  // CSV fallback
  const rows: string[] = []
  const { start: dStart, end: dEnd } = deriveRange(preset, start || null, end || null)
  const asOfIso = (dEnd || new Date().toISOString().slice(0,10))
  const versionFlag = parseCsvVersionFlag(req)
  if (versionFlag) rows.push('CSV-Version,1')
  const caption = buildCsvCaption(dStart, dEnd, asOfIso)
  rows.push([caption].join(','))
  rows.push('')
  if (name) rows.push(['Pack', name].join(','))
  rows.push(['Preset', preset].join(','))
  if (preset === 'Custom') rows.push(['Range', `${start} to ${end}`].join(','))
  // Explicit filter metadata for traceability
  rows.push(['As of', asOfIso].join(','))
  rows.push(['Period Start', dStart || ''].join(','))
  rows.push(['Period End', dEnd || asOfIso].join(','))
  rows.push(['Reports', reports.join(' | ')].join(','))
  rows.push('') // blank line

  // KPI summary (align with /accounting/process approximation)
  try {
    const asOfDate = new Date(asOfIso + 'T00:00:00Z')
    const { totals: arTotals } = computeARAging(asOfDate)
    const { totals: apTotals } = computeAPAging(asOfDate)
    const pl = computeProfitLoss({ start: dStart || asOfIso, end: asOfIso })
    const tb = computeTrialBalance({ start: dStart || asOfIso, end: asOfIso })
    const dayMs = 86400000
    const startIso = dStart || asOfIso
    const daysInPeriod = Math.max(1, Math.floor((new Date(asOfIso + 'T00:00:00Z').getTime() - new Date(startIso + 'T00:00:00Z').getTime()) / dayMs) + 1)
    const revenuePerDay = pl.revenue > 0 ? (pl.revenue / daysInPeriod) : 0
    const expensesPerDay = pl.expenses > 0 ? (pl.expenses / daysInPeriod) : 0
    const dsoDays = revenuePerDay > 0 ? Number(((arTotals?.total || 0) / revenuePerDay).toFixed(1)) : null
    const dpoDays = expensesPerDay > 0 ? Number(((apTotals?.total || 0) / expensesPerDay).toFixed(1)) : null

    rows.push(['KPI', 'Value'].join(','))
    rows.push(['DSO (days)', dsoDays == null ? '' : String(dsoDays)].join(','))
    rows.push(['DPO (days)', dpoDays == null ? '' : String(dpoDays)].join(','))
    rows.push(['AR open balance', String((arTotals?.total || 0).toFixed(2))].join(','))
    rows.push(['AP open balance', String((apTotals?.total || 0).toFixed(2))].join(','))
    rows.push(['GL balanced', tb?.balanced ? 'Yes' : 'No'].join(','))
    // Additional KPI: Net margin percentage (Net Income / Revenue)
    const netMarginPct = pl.revenue > 0 ? Number(((pl.netIncome / pl.revenue) * 100).toFixed(1)) : null
    rows.push(['Net margin (%)', netMarginPct == null ? '' : `${netMarginPct}%`].join(','))
  } catch {}

  rows.push('') // blank line between KPI and selected report list
  rows.push(['Section', 'Note'].join(','))
  for (const r of reports) {
    rows.push([r, 'Placeholder summary'].join(','))
  }
  const csv = rows.join('\n')
  // Standardize filename using shared helper (period mode), with optional name token
  const tokens = safeName ? [sanitizeToken(safeName)] : undefined
  let filename: string
  if (preset === 'Custom') {
    if (dStart && dEnd) {
      // CSV custom range includes 'Custom' label before the range (per filenames test)
      filename = buildCsvFilename('management-pack', { period: 'Custom', start: dStart, end: dEnd, tokens })
    } else {
      // Only end/as-of provided → use as-of filename (per pack.export test)
      filename = buildCsvFilename('management-pack', { asOfIso, tokens })
    }
  } else {
    filename = buildCsvFilename('management-pack', { period: preset, tokens })
  }
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
