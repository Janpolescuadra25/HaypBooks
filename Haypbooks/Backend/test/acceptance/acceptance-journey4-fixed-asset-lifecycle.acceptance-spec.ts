import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AccountingService } from '../../src/accounting/accounting.service'
import { PrismaService } from '../../src/repositories/prisma/prisma.service'
import { createAcceptanceTestApp } from './shared/acceptance-harness'

describe('Phase 17 Journey 4: Fixed Asset Lifecycle Acceptance Tests', () => {
  let app: INestApplication
  let prisma: PrismaService
  let accountingService: AccountingService

  let companyId: string
  let otherCompanyId: string
  let assetAccountId: string
  let accumulatedAccountId: string
  let depreciationExpenseAccountId: string
  let createdCategoryId: string
  let createdAssetId: string

  beforeAll(async () => {
    const harness = await createAcceptanceTestApp()
    app = harness.app
    prisma = harness.prisma
    accountingService = app.get(AccountingService)

    const creator = await prisma.user.create({
      data: {
        email: `fixed-assets-creator-${Date.now()}@haypbooks.test`,
        name: 'Fixed Asset Creator',
        password: 'hashed_password',
      },
    })

    const otherOwner = await prisma.user.create({
      data: {
        email: `fixed-assets-other-${Date.now()}@haypbooks.test`,
        name: 'Other Owner',
        password: 'hashed_password',
      },
    })

    const workspace = await prisma.workspace.create({ data: { ownerUserId: creator.id } })
    const otherWorkspace = await prisma.workspace.create({ data: { ownerUserId: otherOwner.id } })

    const company = await prisma.company.create({
      data: {
        workspaceId: workspace.id,
        name: `J4 Fixed Assets ${Date.now()}`,
        currency: 'USD',
      },
    })
    companyId = company.id

    const otherCompany = await prisma.company.create({
      data: {
        workspaceId: otherWorkspace.id,
        name: `J4 Fixed Assets Other ${Date.now()}`,
        currency: 'USD',
      },
    })
    otherCompanyId = otherCompany.id

    await accountingService.seedDefaultAccounts(company.id)
    await accountingService.seedDefaultAccounts(otherCompany.id)

    const assetAccount = await prisma.account.findFirst({ where: { companyId: company.id, code: '1540' } })
    const accumAccount = await prisma.account.findFirst({ where: { companyId: company.id, code: '1545' } })
    const depExpenseAccount = await prisma.account.findFirst({ where: { companyId: company.id, code: '6090' } })

    if (!assetAccount || !accumAccount || !depExpenseAccount) {
      throw new Error('Seeded chart of accounts did not contain the expected fixed asset account IDs.')
    }

    assetAccountId = assetAccount.id
    accumulatedAccountId = accumAccount.id
    depreciationExpenseAccountId = depExpenseAccount.id
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }

    if (companyId) {
      await prisma.fixedAssetDepreciation.deleteMany({ where: { companyId } }).catch(() => undefined)
      await prisma.fixedAssetSchedule.deleteMany({ where: { companyId } }).catch(() => undefined)
      await prisma.fixedAsset.deleteMany({ where: { companyId } }).catch(() => undefined)
      await prisma.fixedAssetCategory.deleteMany({ where: { companyId } }).catch(() => undefined)
      await prisma.account.deleteMany({ where: { companyId } }).catch(() => undefined)
      await prisma.company.delete({ where: { id: companyId } }).catch(() => undefined)
    }

    if (otherCompanyId) {
      await prisma.account.deleteMany({ where: { companyId: otherCompanyId } }).catch(() => undefined)
      await prisma.company.delete({ where: { id: otherCompanyId } }).catch(() => undefined)
    }
  })

  it('Step 1: creates an asset category', async () => {
    const response = await request(app.getHttpServer())
      .post(`/companies/${companyId}/fixed-assets/categories`)
      .send({
        name: 'Computer Equipment',
        standardCategory: 'OFFICE_EQUIPMENT',
        defaultUsefulLifeMonths: 36,
        defaultDepreciationMethod: 'STRAIGHT_LINE',
      })
      .expect(201)

    expect(response.body.id).toBeDefined()
    expect(response.body.name).toBe('Computer Equipment')
    createdCategoryId = response.body.id
  })

  it('Step 2: rejects asset creation when account IDs are invalid', async () => {
    await request(app.getHttpServer())
      .post(`/companies/${companyId}/fixed-assets`)
      .send({
        categoryId: createdCategoryId,
        assetNumber: 'FA-INVALID-001',
        name: 'Invalid Assets Test',
        acquisitionDate: '2026-01-15T00:00:00.000Z',
        cost: 1500,
        usefulLifeMonths: 24,
        assetAccountId: '00000000-0000-0000-0000-000000000000',
        accumulatedDepreciationId: accumulatedAccountId,
        depreciationExpenseAccountId: depreciationExpenseAccountId,
      })
      .expect(400)
  })

  it('Step 3: registers a valid fixed asset', async () => {
    const response = await request(app.getHttpServer())
      .post(`/companies/${companyId}/fixed-assets`)
      .send({
        categoryId: createdCategoryId,
        assetNumber: 'FA-2026-0001',
        name: 'Developer Workstation M3 Pro',
        description: 'High-end work laptop for engineering team',
        acquisitionDate: '2026-01-15T00:00:00.000Z',
        cost: 3600,
        salvageValue: 0,
        usefulLifeMonths: 36,
        depreciationMethod: 'STRAIGHT_LINE',
        status: 'ACTIVE',
        assetAccountId: assetAccountId,
        accumulatedDepreciationId: accumulatedAccountId,
        depreciationExpenseAccountId: depreciationExpenseAccountId,
      })
      .expect(201)

    expect(response.body.id).toBeDefined()
    expect(response.body.name).toBe('Developer Workstation M3 Pro')
    expect(Number(response.body.cost)).toBe(3600)
    createdAssetId = response.body.id
  })

  it('Step 4: enforces multi-tenant isolation', async () => {
    const assetResponse = await request(app.getHttpServer())
      .get(`/companies/${companyId}/fixed-assets/${createdAssetId}`)
      .expect(200)

    expect(assetResponse.body.id).toBe(createdAssetId)
    expect(assetResponse.body.companyId).toBe(companyId)

    await request(app.getHttpServer())
      .get(`/companies/${otherCompanyId}/fixed-assets/${createdAssetId}`)
      .expect(404)
  })

  it('Step 5: generates a straight-line depreciation schedule', async () => {
    const response = await request(app.getHttpServer())
      .post(`/companies/${companyId}/fixed-assets/${createdAssetId}/depreciation-schedule`)
      .send({ fiscalYear: 2026 })
      .expect(201)

    expect(response.body.schedule).toBeDefined()
    expect(response.body.schedule.method).toBe('STRAIGHT_LINE')
    expect(response.body.monthlyDepreciation).toBe(100)
    expect(response.body.annualTotal).toBe(1200)
    expect(response.body.periods).toHaveLength(12)
    expect(Number(response.body.periods[0].amount)).toBe(100)
  })

  it('Step 6: soft-deletes the asset and removes it from active listings', async () => {
    await request(app.getHttpServer())
      .delete(`/companies/${companyId}/fixed-assets/${createdAssetId}`)
      .expect(200)

    await request(app.getHttpServer())
      .get(`/companies/${companyId}/fixed-assets/${createdAssetId}`)
      .expect(404)

    const listResponse = await request(app.getHttpServer())
      .get(`/companies/${companyId}/fixed-assets`)
      .expect(200)

    const found = listResponse.body.find((asset: any) => asset.id === createdAssetId)
    expect(found).toBeUndefined()
  })
})
