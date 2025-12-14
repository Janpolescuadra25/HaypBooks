export function sanitizeToken(v: string) {
  // Lowercase, replace whitespace with dashes, drop disallowed chars
  let out = v.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-_.]/g, '')
  // Collapse multiple dashes and trim leading/trailing dashes
  out = out.replace(/-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')
  return out
}

type TokenPosition = 'before' | 'after'
// Options for building CSV filenames.
// Backward-compatible: originally required asOfIso; now supports either period or asOfIso modes.
type BuildCsvOpts = {
  start?: string
  end?: string
  // Point-in-time/as-of mode (legacy/default)
  asOfIso?: string
  // Periodized mode (e.g., 'YTD', 'QTD', 'MTD', 'Custom')
  period?: string
  tokens?: string[]
  tokenPosition?: TokenPosition
}

export function buildCsvFilename(baseSlug: string, opts: BuildCsvOpts) {
  const { start, end } = opts
  const tokensArr = (opts.tokens || []).filter(Boolean)
  const tokensStr = tokensArr.length ? tokensArr.join('_') : ''
  const pos: TokenPosition = opts.tokenPosition || 'after'
  
  // Period mode: filename pattern
  // <slug>-<period>[_<start>_to_<end>][_tokens].csv
  if (opts.period) {
    const period = opts.period
    const datePart = start && end ? `-${period}_${start}_to_${end}` : `-${period}`
    if (tokensStr && pos === 'before') {
      return `${baseSlug}-${tokensStr}${datePart}.csv`
    }
    const suffix = tokensStr ? `_${tokensStr}` : ''
    return `${baseSlug}${datePart}${suffix}.csv`
  }

  // As-of/range mode (legacy behavior):
  // <slug>-<start>_to_<end>[_tokens].csv  OR  <slug>-asof-<YYYY-MM-DD>[_tokens].csv
  const asOfIso = opts.asOfIso || ''
  const range = start && end ? `-${start}_to_${end}` : `-asof-${asOfIso}`
  if (tokensStr && pos === 'before') {
    return `${baseSlug}-${tokensStr}${range}.csv`
  }
  const suffix = tokensStr ? `_${tokensStr}` : ''
  return `${baseSlug}${range}${suffix}.csv`
}

// Parse CSV version flag from a URL or Request. Supports aliases and common falsy strings.
// Aliases: csvVersion, csv-version, csv_version, csv, version
// Falsy values: '0', 'false', 'no', 'off' (case-insensitive)
export function parseCsvVersionFlag(input: string | URL | Request): boolean {
  const url = typeof input === 'string'
    ? new URL(input, 'http://local')
    : (input instanceof URL ? input : new URL((input as Request).url))
  const get = (k: string) => url.searchParams.get(k)
  const raw = get('csvVersion') || get('csv-version') || get('csv_version') || get('csv') || get('version')
  if (!raw) return false
  const v = String(raw).toLowerCase()
  if (v === '' || v === '0' || v === 'false' || v === 'no' || v === 'off' || v === 'null' || v === 'undefined') return false
  return true
}

