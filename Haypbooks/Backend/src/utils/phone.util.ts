import { BadRequestException } from '@nestjs/common'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function normalizePhoneOrThrow(raw?: string): string {
  if (!raw || String(raw).trim() === '') throw new BadRequestException('Phone number is required')
  const s = String(raw).trim()
  // First try libphonenumber-js parsing (best effort)
  try {
    const p = parsePhoneNumberFromString(s)
    if (p && p.isValid()) return p.format('E.164')
  } catch (e) {
    // ignore and fall back
  }

  // Developer-friendly: if input doesn't start with +, attempt parsing with a default country
  // Default country can be set via env var DEFAULT_PHONE_COUNTRY (e.g. 'PH'), otherwise
  // in non-production we try 'PH' as a sensible default for dev convenience.
  try {
    const defaultCountry = process.env.DEFAULT_PHONE_COUNTRY
    if (defaultCountry && !s.startsWith('+')) {
      try {
        const p2 = parsePhoneNumberFromString(s, defaultCountry as any)
        if (p2 && p2.isValid()) return p2.format('E.164')
      } catch (err) {
        // ignore and continue to fallback
      }
    }
  } catch (err) {
    // ignore
  }

  // Fallback: simple digits-only normalization, with best-effort default country dialing code insertion
  const digits = s.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) {
    throw new BadRequestException('Please provide a valid phone number (include country code, e.g. +1 555 123 4567). In dev you can set DEFAULT_PHONE_COUNTRY=PH to auto-normalize local numbers.')
  }

  let finalDigits = digits
  const defaultCountry = process.env.DEFAULT_PHONE_COUNTRY
  if (defaultCountry && !s.startsWith('+')) {
    const countryDial: Record<string, string> = { US: '1', GB: '44', AU: '61', PH: '63', IN: '91', SG: '65' }
    const dialCode = countryDial[String(defaultCountry).toUpperCase()]
    if (dialCode && !digits.startsWith(dialCode)) {
      const local = digits.replace(/^0+/, '')
      finalDigits = `${dialCode}${local}`
    }
  }

  return `+${finalDigits}`
}

export function maskPhoneForDisplay(e164: string) {
  if (!e164) return ''
  const m = e164.replace(/[^0-9+]/g, '')
  const digits = m.startsWith('+') ? m.slice(1) : m
  const countryDial = ['63','91','65','44','61','1']
  let dial = ''
  let rest = digits
  for (const code of countryDial) {
    if (digits.startsWith(code)) {
      dial = code
      rest = digits.slice(code.length)
      break
    }
  }

  const last4 = rest.slice(-4)
  const middleLen = Math.max(0, rest.length - 4)
  const middleMask = middleLen > 0 ? '*'.repeat(middleLen) : ''
  const groups = middleMask.replace(/(.{3})/g, '$1 ').trim()

  const parts: string[] = []
  if (dial) parts.push(`+${dial}`)
  if (groups) parts.push(groups)
  if (last4) parts.push(last4)

  return parts.join(' ').trim()
} 
