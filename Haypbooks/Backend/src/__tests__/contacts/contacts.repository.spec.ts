import { ContactsRepository } from '../../contacts/contacts.repository'

describe('ContactsRepository', () => {
  let mockPrisma: any
  let repo: ContactsRepository

  beforeEach(() => {
    mockPrisma = {
      customer: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
      $transaction: jest.fn().mockImplementation((actions) => Promise.all(actions)),
    }
    repo = new ContactsRepository(mockPrisma as any)
  })

  test('findCustomers search works on multiple fields', async () => {
    await repo.findCustomers('w1', { search: 'john', page: 1, limit: 10 })
    expect(mockPrisma.customer.findMany).toHaveBeenCalledTimes(1)
    const where = mockPrisma.customer.findMany.mock.calls[0][0].where
    expect(where.OR).toBeDefined()
    expect(where.OR).toEqual(expect.arrayContaining([
      expect.objectContaining({ displayName: expect.any(Object) }),
      expect.objectContaining({ companyName: expect.any(Object) }),
    ]))

    await repo.findCustomers('w1', { search: 'test@company.com', page: 1, limit: 10 })
    expect(mockPrisma.customer.findMany).toHaveBeenCalledTimes(2)
    const where2 = mockPrisma.customer.findMany.mock.calls[1][0].where
    expect(where2.OR).toBeDefined()
    expect(where2.OR).toEqual(expect.arrayContaining([
      expect.objectContaining({ displayName: expect.any(Object) }),
      expect.objectContaining({ email: expect.any(Object) }),
      expect.objectContaining({ phone: expect.any(Object) }),
      expect.objectContaining({ companyName: expect.any(Object) }),
    ]))
  })
})
