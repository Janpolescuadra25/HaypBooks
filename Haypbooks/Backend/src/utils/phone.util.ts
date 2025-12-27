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

  // Fallback: simple digits-only normalization
  const digits = s.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) {
    throw new BadRequestException('Please provide a valid phone number (include country code, e.g. +1 555 123 4567)')
  }
  return `+${digits}`
}

export function maskPhoneForDisplay(e164: string) {
  if (!e164) return ''
  // Simple mask: show country code and last 4 digits
  const m = e164.replace(/[^0-9+]/g, '')
  const last4 = m.slice(-4)
  const cc = m.slice(0, m.length - 4)
  return `${cc.slice(0, 3)} ••• ••• ${last4}`
}
