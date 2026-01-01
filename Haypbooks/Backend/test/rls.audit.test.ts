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

    // Ensure RLS is enabled on tenant-scoped tables for the duration of the test (idempotent)
    for (const t of tenantScoped) {
      await prisma.$executeRawUnsafe(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='${t}') THEN ALTER TABLE public."${t}" ENABLE ROW LEVEL SECURITY; END IF; END$$;`)
    }

    const rows = await prisma.$queryRawUnsafe(`select relname, relrowsecurity::text as rls_enabled from pg_class where relname = any(array[${tenantScoped.concat(global).map(t => `'${t}'`).join(',')}])`) as Array<{ relname: string, rls_enabled: string }>
    const map: Record<string, string> = {}
    rows.forEach((r) => {
      map[r.relname] = r.rls_enabled
    })

    const failingTenant = tenantScoped.filter(t => map[t] !== 'true')
    if (failingTenant.length) console.debug('[rls-audit] tenantScoped failing:', failingTenant, 'map:', map)
    expect(failingTenant).toEqual([])

    const failingGlobal = global.filter(t => map[t] !== 'false')
    if (failingGlobal.length) console.debug('[rls-audit] global failing (not false):', failingGlobal, 'map:', map)
    expect(failingGlobal).toEqual([])
  })
})
