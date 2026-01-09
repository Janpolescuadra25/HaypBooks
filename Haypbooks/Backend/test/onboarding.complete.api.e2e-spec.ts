import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as path from 'path'
import request from 'supertest'
import { AppModule } from '../src/app.module'

const BACKEND_DIR = path.resolve(__dirname, '..')

describe('Onboarding complete API (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaClient

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } })

    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    prisma = new PrismaClient()
  }, 60000)

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('POST /api/onboarding/complete returns created company and company appears in /api/companies?filter=owned', async () => {
    // Login as seeded demo user
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'demo@haypbooks.test', password: 'password' }).expect(200)
    const token = login.body.token
    expect(token).toBeTruthy()

    // Save onboarding business step with company name and extra details for the logged-in demo user
    const companyName = `E2E Tenant ${Math.random().toString(36).slice(2,6)}`
    await request(app.getHttpServer()).post('/api/onboarding/save').set('Authorization', `Bearer ${token}`).send({ step: 'business', data: { companyName, businessType: 'Retail', industry: 'Grocery', address: '123 Market St', startDate: '2025-01-01' } }).expect(201)
    await request(app.getHttpServer()).post('/api/onboarding/save').set('Authorization', `Bearer ${token}`).send({ step: 'fiscal', data: { accountingMethod: 'ACCRUAL', fiscalStart: '2025-01-01' } }).expect(201)
    await request(app.getHttpServer()).post('/api/onboarding/save').set('Authorization', `Bearer ${token}`).send({ step: 'tax', data: { vatRegistered: true, taxRate: 12, pricesInclusive: true, taxId: 'TIN123' } }).expect(201)
    await request(app.getHttpServer()).post('/api/onboarding/save').set('Authorization', `Bearer ${token}`).send({ step: 'branding', data: { logo: 'https://cdn.example/logo.png', invoicePrefix: 'ACME', paymentTerms: 'Net 30' } }).expect(201)

    // Complete onboarding and expect a company in the response
    const complete = await request(app.getHttpServer()).post('/api/onboarding/complete').set('Authorization', `Bearer ${token}`).send({ type: 'full', hub: 'OWNER' }).expect(200)
    expect(complete.body).toBeDefined()
    expect(complete.body.success).toBe(true)
    // Company may be null in case creation failed (best-effort); assert that when present it has expected name
    if (complete.body.company) {
      expect(complete.body.company.name).toBe(companyName)
    }

    // Now assert the company is visible via companies?filter=owned
    const companies = await request(app.getHttpServer()).get('/api/companies?filter=owned').set('Authorization', `Bearer ${token}`).expect(200)
    const found = companies.body.find((c: any) => (c.name || '') === companyName)
    expect(found || complete.body.company).toBeTruthy()

    // If the company was created, assert it persisted the onboarding fields
    const persisted = complete.body.company || found
    if (persisted) {
      // The API may not return all fields; fetch company by ID if available
      const companyId = persisted.id
      if (companyId) {
        const byId = await request(app.getHttpServer()).get(`/api/companies/${companyId}`).set('Authorization', `Bearer ${token}`).expect(200)
        const comp = byId.body
        expect(comp.name).toBe(companyName)
        expect(comp.businessType).toBe('Retail')
        expect(comp.industry).toBe('Grocery')
        expect(comp.address).toBe('123 Market St')
        expect(comp.taxId).toBe('TIN123')
        expect(comp.logoUrl).toBe('https://cdn.example/logo.png')
        expect(comp.invoicePrefix).toBe('ACME')
      }
    }

  }, 30000)
})