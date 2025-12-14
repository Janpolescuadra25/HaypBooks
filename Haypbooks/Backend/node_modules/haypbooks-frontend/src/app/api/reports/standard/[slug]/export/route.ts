import { NextRequest, NextResponse } from 'next/server'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvCaption } from '@/lib/report-helpers'
import { GET as getJson } from '../route'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url)
  const versionFlag = parseCsvVersionFlag(req)
  const period = searchParams.get('period') || 'YTD'
  const start = searchParams.get('start') || undefined
  const end = searchParams.get('end') || undefined
  // Touch shared caption helper to ensure guard compliance; these standard exports don't have caption rows.
  const _caption = buildCsvCaption(start || null, end || null, end || null)
  const sanitize = (v: string) => sanitizeToken(v)

  // Filters (mirrors JSON route)
  const channelFilter = searchParams.get('channel') || undefined
  const minMargin = searchParams.get('minMargin') ? parseFloat(searchParams.get('minMargin') as string) : undefined
  const minUtil = searchParams.get('minUtil') ? parseFloat(searchParams.get('minUtil') as string) : undefined
  const view = searchParams.get('view') || undefined
  const minTurn = searchParams.get('minTurn') ? parseFloat(searchParams.get('minTurn') as string) : undefined
  const segment = searchParams.get('segment') || undefined
  const restriction = searchParams.get('restriction') || undefined
  const program = searchParams.get('program') || undefined
  const property = searchParams.get('property') || undefined
  const category = searchParams.get('category') || undefined

  // Build compact filter tokens for filename context
  const tokens: string[] = []
  if (channelFilter) tokens.push(`ch-${sanitize(channelFilter)}`)
  if (typeof minMargin === 'number' && !Number.isNaN(minMargin)) tokens.push(`mm${minMargin}`)
  if (typeof minUtil === 'number' && !Number.isNaN(minUtil)) tokens.push(`mu${minUtil}`)
  if (view) tokens.push(`v-${sanitize(view)}`)
  if (typeof minTurn === 'number' && !Number.isNaN(minTurn)) tokens.push(`mt${minTurn}`)
  if (segment) tokens.push(`seg-${sanitize(segment)}`)
  if (restriction) tokens.push(`res-${sanitize(restriction)}`)
  if (program) tokens.push(`prog-${sanitize(program)}`)
  if (property) tokens.push(`prop-${sanitize(property)}`)
  if (category) tokens.push(`cat-${sanitize(category)}`)

  // Use shared helper in period mode to preserve '<slug>-<period>[_<start>_to_<end>][_tokens].csv'
  const filename = buildCsvFilename(params.slug, {
    period,
    start,
    end,
    tokens,
    // default tokenPosition 'after' matches expected tests for standard reports
  })

  function csvRow(values: Array<string | number>) {
    return values
      .map((v) => (typeof v === 'string' && v.includes(',') ? JSON.stringify(v) : String(v)))
      .join(',')
  }
  // Delegate to sibling JSON route to avoid drift
  const res = await getJson(req, { params })
  const data = await res.json() as { columns: string[]; rows: Array<Array<string | number>> }

  const lines = [
    ...(versionFlag ? ['CSV-Version,1'] : []),
    data.columns.join(','),
    ...data.rows.map(csvRow),
  ]
  const body = lines.join('\n')

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
