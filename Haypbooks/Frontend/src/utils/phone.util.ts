export function normalizePhoneOrThrow(raw?: string): string {
  if (!raw || String(raw).trim() === '') throw new Error('Phone number is required')
  const s = String(raw).trim()

  // Try using libphonenumber-js via require; if it's missing or fails, fallback
  try {
    // Dynamically require to avoid static bundler resolution when the package isn't installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const _req = eval('require')
    const parsePhoneNumberFromString = _req('libphonenumber-js').parsePhoneNumberFromString
    const p = parsePhoneNumberFromString(s)
    if (p && p.isValid()) return p.format('E.164')
  } catch (e) {
    // ignore and fallback
  }

  // Fallback: simple digits-only normalization
  const digits = s.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) throw new Error('Please provide a valid phone number (include country code, e.g. +1 555 123 4567)')
  return `+${digits}`
}

export function maskPhoneForDisplay(e164?: string) {
  if (!e164) return ''
  const m = e164.replace(/[^0-9+]/g, '')
  const last4 = m.slice(-4)
  const cc = m.slice(0, m.length - 4)
  if (!cc) return `•••• ${last4}`
  return `${cc} ••• ••• ${last4}`
}
