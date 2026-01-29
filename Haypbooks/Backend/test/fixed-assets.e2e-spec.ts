import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/repositories/prisma/prisma.service'

describe('Fixed Assets (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let workspaceId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()

    const tenant = await prisma.tenant.upsert({ where: { subdomain: 'fixedassets-test' }, update: {}, create: { name: 'FixedAssets Test', subdomain: 'fixedassets-test' } })
    tenantId = tenant.id
  })

  afterAll(async () => {
    await prisma.fixedAssetDepreciation.deleteMany({ where: { asset: { workspaceId } } })
    await prisma.fixedAsset.deleteMany({ where: { workspaceId } })
    await prisma.fixedAssetCategory.deleteMany({ where: { workspaceId } })
    await prisma.workspaceUser.deleteMany({ where: { workspaceId } })
    await prisma.user.deleteMany({ where: { email: 'fixed-assets-test@example.com' } })
    await prisma.tenant.deleteMany({ where: { id: workspaceId } })
    await app.close()
  })

  it('creates fixed asset, category and depreciation entries', async () => {
    const fac = await prisma.fixedAssetCategory.create({ data: { workspaceId, name: 'Office Equipment' } })
    expect(fac).toBeDefined()

    const asset = await prisma.fixedAsset.create({ data: { workspaceId, categoryId: fac.id, name: 'Desktop Workstation', acquisitionDate: new Date(), cost: 3000, salvageValue: 300, usefulLifeMonths: 60 } })
    expect(asset).toBeDefined()

    const depr = await prisma.fixedAssetDepreciation.create({ data: { assetId: asset.id, workspaceId, periodStart: new Date(), periodEnd: new Date(Date.now()+30*24*60*60*1000), amount: 50.00 } })
    expect(depr).toBeDefined()

    const loaded = await prisma.fixedAsset.findUnique({ where: { id: asset.id }, include: { depreciations: true } })
    expect(loaded).toBeTruthy()
    expect(loaded!.depreciations.length).toBe(1)
  })
})
