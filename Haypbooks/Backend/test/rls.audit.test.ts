import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

describe('RLS Audit', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('verifies RLS enabled for tenant-scoped models and disabled for global models', async () => {
    const tenantScoped = [
      'Account','Budget','BudgetLine','FixedAsset','FixedAssetDepreciation','Invoice','InvoiceLine','Item','StockLevel','InventoryTransaction',
      'InventoryTransactionLine','InventoryCostLayer','AccountSubType'
    ]

    const global = [
      'AccountType','ApiTokenRevocation','Currency','ExchangeRate','JobAttempt','DeadLetter','OnboardingStep','Otp','SchemaMigration','Session','TaxJurisdiction','User','UserSecurityEvent'
    ]

    const rows = await prisma.$queryRawUnsafe(`select relname, relrowsecurity::text as rls_enabled from pg_class where relname = any(array[${tenantScoped.concat(global).map(t => `'${t}'`).join(',')}])`)
    const map: Record<string, string> = {}
    rows.forEach((r: any) => {
      map[r.relname] = r.rls_enabled
    })

    tenantScoped.forEach(t => {
      expect(map[t]).toBe('true')
    })

    global.forEach(t => {
      expect(map[t]).toBe('false')
    })
  })
})
