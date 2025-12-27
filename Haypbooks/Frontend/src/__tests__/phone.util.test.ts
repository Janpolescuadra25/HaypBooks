import { normalizePhoneOrThrow, maskPhoneForDisplay } from '@/utils/phone.util'

describe('phone.util (frontend)', () => {
  test('normalize E.164 and fallback', () => {
    expect(normalizePhoneOrThrow('+15551234567')).toBe('+15551234567')
    expect(normalizePhoneOrThrow('+63 912 345 6789')).toBe('+639123456789')
    // digits-only fallback
    expect(normalizePhoneOrThrow('15551234567')).toBe('+15551234567')
  })

  test('throws on invalid', () => {
    expect(() => normalizePhoneOrThrow('abc')).toThrow(/valid phone/i)
    expect(() => normalizePhoneOrThrow('')).toThrow(/required/i)
  })

  test('mask phone display', () => {
    expect(maskPhoneForDisplay('+15551234567')).toMatch(/\+1/) // shows country code
    expect(maskPhoneForDisplay('+639123456789')).toMatch(/\+63/) 
  })
})
