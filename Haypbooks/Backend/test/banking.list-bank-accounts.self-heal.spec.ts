import { BankingService } from '../src/banking/banking.service'

describe('BankingService.listBankAccounts self-heal', () => {
  test('auto-creates a default bank account once and does not duplicate on repeat call', async () => {
    const workspaceId = 'ws-1'
    const companyId = 'co-1'
    const userId = 'user-1'

    const bankAccounts: Array<{ id: string; name: string; glAccountId?: string | null }> = []

    const repo: any = {
      findBankAccounts: jest.fn(async () => bankAccounts.map((row) => ({ ...row }))),
    }

    const prisma: any = {
      company: {
        findUnique: jest.fn(async () => ({ workspaceId })),
      },
      workspaceUser: {
        findFirst: jest.fn(async () => ({ id: 'membership-1' })),
      },
      bankAccount: {
        findFirst: jest.fn(async () => (bankAccounts.length > 0 ? { id: bankAccounts[0].id } : null)),
        create: jest.fn(async ({ data }: any) => {
          const created = {
            id: `bank-${bankAccounts.length + 1}`,
            name: data.name,
            glAccountId: data.glAccountId ?? null,
          }
          bankAccounts.push(created)
          return created
        }),
      },
      account: {
        findFirst: jest.fn(async () => ({ id: 'gl-1010', name: 'Business Checking' })),
      },
    }

    const service = new BankingService(repo, prisma, {} as any)

    const firstResult = await service.listBankAccounts(userId, companyId)
    expect(firstResult).toHaveLength(1)
    expect(firstResult[0].name).toBe('Business Checking')
    expect(prisma.bankAccount.create).toHaveBeenCalledTimes(1)
    expect(prisma.bankAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workspaceId,
          name: 'Business Checking',
          isDefault: true,
          glAccountId: 'gl-1010',
        }),
      }),
    )

    const secondResult = await service.listBankAccounts(userId, companyId)
    expect(secondResult).toHaveLength(1)
    expect(prisma.bankAccount.create).toHaveBeenCalledTimes(1)
    expect(bankAccounts).toHaveLength(1)
  })
})
