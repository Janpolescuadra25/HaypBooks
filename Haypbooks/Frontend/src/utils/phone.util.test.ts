import { normalizePhoneOrThrow, maskPhoneForDisplay } from './phone.util'

describe('phone.util', () => {
  test('maskPhoneForDisplay returns formatted masked string', () => {
    expect(maskPhoneForDisplay('+15551234567')).toBe('+1555 ••• ••• 4567')
    expect(maskPhoneForDisplay('')).toBe('')
    expect(maskPhoneForDisplay(undefined)).toBe('')
  })

  test('normalizePhoneOrThrow falls back to digits-only if libphonenumber unavailable', () => {
    expect(normalizePhoneOrThrow('555-123-4567')).toBe('+5551234567')
    expect(() => normalizePhoneOrThrow('123')).toThrow()
  })
})
