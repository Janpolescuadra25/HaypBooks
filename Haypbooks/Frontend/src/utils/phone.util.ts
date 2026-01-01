export function normalizePhoneOrThrow(raw?: string, defaultCountry?: string): string {
  if (!raw || String(raw).trim() === '') throw new Error('Phone number is required')
  const s = String(raw).trim()

  // Try using libphonenumber-js via require; if it's missing or fails, fallback
  try {
    // Dynamically require to avoid static bundler resolution when the package isn't installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const _req = eval('require')
    const parsePhoneNumberFromString = _req('libphonenumber-js').parsePhoneNumberFromString
    // If a defaultCountry is provided and the input doesn't start with +, pass it to the parser
    const p = (defaultCountry && !s.startsWith('+')) ? parsePhoneNumberFromString(s, defaultCountry) : parsePhoneNumberFromString(s)
    if (p && p.isValid()) return p.format('E.164')
  } catch (e) {
    // ignore and fallback
  }

  // Fallback: simple digits-only normalization with best-effort country-code insertion when a defaultCountry is provided
  const digits = s.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) throw new Error('Please provide a valid phone number (include country code, e.g. +1 555 123 4567)')

  let finalDigits = digits
  if (defaultCountry && !s.startsWith('+')) {
    const countryDial: Record<string, string> = { US: '1', GB: '44', AU: '61', PH: '63', IN: '91', SG: '65' }
    const dialCode = countryDial[String(defaultCountry).toUpperCase()]
    if (dialCode) {
      // If digits don't already start with the dial code, treat as a local number: strip leading zeros then prefix
      if (!digits.startsWith(dialCode)) {
        const local = digits.replace(/^0+/, '')
        finalDigits = `${dialCode}${local}`
      }
    }
  }

  return `+${finalDigits}`
}

export function maskPhoneForDisplay(e164?: string) {
  if (!e164) return ''
  const m = e164.replace(/[^0-9+]/g, '')
  // Strip leading + for processing
  const digits = m.startsWith('+') ? m.slice(1) : m

  // Known dial codes (prefer longer matches)
  const countryDial = ['63','91','65','44','61','1'] // order matters for matching
  let dial = ''
  let rest = digits
  for (const code of countryDial) {
    if (digits.startsWith(code)) {
      dial = code
      rest = digits.slice(code.length)
      break
    }
  }

  // Last 4 always shown if available
  const last4 = rest.slice(-4)
  const middleLen = Math.max(0, rest.length - 4)
  const middleMask = middleLen > 0 ? '*'.repeat(middleLen) : ''
  // Group masked middle into groups of 3 for readability
  const groups = middleMask.replace(/(.{3})/g, '$1 ').trim()

  const parts = [] as string[]
  if (dial) parts.push(`+${dial}`)
  if (groups) parts.push(groups)
  if (last4) parts.push(last4)

  return parts.join(' ').trim()
} 
