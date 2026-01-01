import { PrismaUserRepository } from '../src/repositories/prisma/user.repository.prisma'

describe('PrismaUserRepository (findByPhone with HMAC)', () => {
  beforeEach(() => { process.env.DEFAULT_PHONE_COUNTRY = 'US' })
  afterEach(() => { delete process.env.DEFAULT_PHONE_COUNTRY })
  test('uses HMAC lookup when HMAC_KEY is set', async () => {
    // ensure HMAC_KEY is set for this test and always cleaned up
    process.env.HMAC_KEY = 'testkey'
    try {
      const mockFindFirst = jest.fn().mockResolvedValue({ id: 'u1', phone: '+15550009999' })
      const mockPrisma: any = { user: { findFirst: mockFindFirst } }
      const repo = new PrismaUserRepository(mockPrisma)

      const input = '1 (555) 000-9999'
      const normalized = require('../src/utils/phone.util').normalizePhoneOrThrow(input)
      console.debug('[test] normalized input for HMAC lookup:', input, '->', normalized)

      const res = await repo.findByPhone(input)

      // dump the prisma call for easier debugging on failures
      const calledArg = mockFindFirst.mock.calls[0] ? mockFindFirst.mock.calls[0][0] : undefined
      console.debug('[test] prisma findFirst called with:', JSON.stringify(calledArg))

      expect(mockFindFirst).toHaveBeenCalledTimes(1)
      expect(calledArg.where).toBeDefined()
      expect(calledArg.where.OR).toBeDefined()
      // OR should contain phoneHmac string and phone normalized
      const orClause = calledArg.where.OR
      expect(orClause.length).toBe(2)
      expect(orClause[0].phoneHmac).toBeDefined()
      expect(orClause[1].phone).toBe('+15550009999')

      expect(res).toEqual({ id: 'u1', phone: '+15550009999' })
    } finally {
      delete process.env.HMAC_KEY
    }
  })

  test('falls back to phone lookup when HMAC_KEY not set', async () => {
    delete process.env.HMAC_KEY

    const mockFindFirst = jest.fn().mockResolvedValue({ id: 'u2', phone: '+15550001111' })
    const mockPrisma: any = { user: { findFirst: mockFindFirst } }
    const repo = new PrismaUserRepository(mockPrisma)

    const input = '1 (555) 000-1111'
    const normalized = require('../src/utils/phone.util').normalizePhoneOrThrow(input)
    console.debug('[test] normalized input for fallback lookup:', input, '->', normalized)

    const res = await repo.findByPhone(input)

    const calledArg = mockFindFirst.mock.calls[0] ? mockFindFirst.mock.calls[0][0] : undefined
    console.debug('[test] prisma findFirst called with:', JSON.stringify(calledArg))

    expect(mockFindFirst).toHaveBeenCalledTimes(1)
    expect(calledArg.where).toEqual({ phone: '+15550001111' })
    expect(res).toEqual({ id: 'u2', phone: '+15550001111' })
  })

  test('suffix fallback finds user by last digits when exact match absent', async () => {
    delete process.env.HMAC_KEY
    // first two calls will return null (no exact match), third call returns a suffix match
    const mockFindFirst = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'u3', phone: '+44 7700 900000' })
    const mockPrisma: any = { user: { findFirst: mockFindFirst } }
    const repo = new PrismaUserRepository(mockPrisma)

    const input = '+447700900000'
    const normalized = require('../src/utils/phone.util').normalizePhoneOrThrow(input)
    console.debug('[test] normalized input for suffix fallback:', input, '->', normalized)

    const res = await repo.findByPhone(input)

    // The code should try exact match then suffix lookups
    console.debug('[test] prisma call count:', mockFindFirst.mock.calls.length)
    expect(mockFindFirst.mock.calls.length).toBeGreaterThan(1)
    expect(res).toEqual({ id: 'u3', phone: '+44 7700 900000' })
  })
})