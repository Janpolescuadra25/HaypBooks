import { normalizePhoneOrThrow } from '../src/utils/phone.util'

describe('phone.util', () => {
  test('normalizes E.164 inputs to themselves', () => {
    expect(normalizePhoneOrThrow('+15551234567')).toBe('+15551234567')
    expect(normalizePhoneOrThrow('+639123456789')).toBe('+639123456789')
  })

  test('throws on invalid or empty inputs', () => {
    // @ts-ignore
    expect(() => normalizePhoneOrThrow('')).toThrow()
    expect(() => normalizePhoneOrThrow('abc')).toThrow()
  })
})
