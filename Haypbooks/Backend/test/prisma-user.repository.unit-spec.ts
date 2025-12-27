import { PrismaUserRepository } from '../src/repositories/prisma/user.repository.prisma'

describe('PrismaUserRepository (findByPhone with HMAC)', () => {
  test('uses HMAC lookup when HMAC_KEY is set', async () => {
    process.env.HMAC_KEY = 'testkey'
    const mockFindFirst = jest.fn().mockResolvedValue({ id: 'u1', phone: '+15550009999' })
    const mockPrisma: any = { user: { findFirst: mockFindFirst } }
    const repo = new PrismaUserRepository(mockPrisma)

    const res = await repo.findByPhone('1 (555) 000-9999')

    expect(mockFindFirst).toHaveBeenCalledTimes(1)
    const calledArg = mockFindFirst.mock.calls[0][0]
    expect(calledArg.where).toBeDefined()
    expect(calledArg.where.OR).toBeDefined()
    // OR should contain phoneHmac string and phone normalized
    const orClause = calledArg.where.OR
    expect(orClause.length).toBe(2)
    expect(orClause[0].phoneHmac).toBeDefined()
    expect(orClause[1].phone).toBe('+15550009999')

    expect(res).toEqual({ id: 'u1', phone: '+15550009999' })

    delete process.env.HMAC_KEY
  })

  test('falls back to phone lookup when HMAC_KEY not set', async () => {
    delete process.env.HMAC_KEY
    const mockFindFirst = jest.fn().mockResolvedValue({ id: 'u2', phone: '+15550001111' })
    const mockPrisma: any = { user: { findFirst: mockFindFirst } }
    const repo = new PrismaUserRepository(mockPrisma)

    const res = await repo.findByPhone('1 (555) 000-1111')

    expect(mockFindFirst).toHaveBeenCalledTimes(1)
    const calledArg = mockFindFirst.mock.calls[0][0]
    expect(calledArg.where).toEqual({ phone: '+15550001111' })
    expect(res).toEqual({ id: 'u2', phone: '+15550001111' })
  })
})