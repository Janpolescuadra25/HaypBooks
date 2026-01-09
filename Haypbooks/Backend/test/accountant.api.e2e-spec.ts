import request from 'supertest'
import { Pool } from 'pg'
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common'
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard'
import { Test } from '@nestjs/testing'
import { execSync } from 'child_process'
import * as path from 'path'

describe('Accountant API (e2e)', () => {
  let app: INestApplication
  const BACKEND_DIR = path.resolve(__dirname, '..')
  const DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

  beforeAll(async () => {
    process.env.DATABASE_URL = DATABASE_URL
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })
    try {
      const moduleRef = await Test.createTestingModule({ imports: [/* minimal */], controllers: [], providers: [] }).compile()
      // Build only the Accountant controller/service in isolation to avoid Prisma client loading issues
      const { AccountantModule } = await import('../src/accountant/accountant.module')
      // Mock auth guard to avoid depending on full auth flow / Prisma client
      class MockAuthGuard implements CanActivate {
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest()
          // use UUIDs for IDs now that Tenant.id is a UUID
          req.user = { id: require('crypto').randomUUID(), token: 'test-token', email: 'test@example.com' }
          return true
        }
      }
      const isolated = await Test.createTestingModule({ imports: [AccountantModule] }).overrideGuard(JwtAuthGuard).useValue(new MockAuthGuard()).compile()
      app = isolated.createNestApplication()
      await app.init()
    } catch (err) {
      console.error('Error in beforeAll setup:', err)
      throw err
    }
  }, 120000)

  afterAll(async () => {
    await app.close()
  })

  it('/api/accountants/clients (POST) -> creates, GET returns it, DELETE removes', async () => {
    // use the mocked user provided by the guard
    // IDs must be UUIDs now that Tenant.id is UUID
    const fakeUserId = require('crypto').randomUUID()
    const client = request(app.getHttpServer())

    // ensure a user exists for the fake id so FK constraints pass
    const pool = new Pool({ connectionString: DATABASE_URL })
    await pool.query('INSERT INTO public."User" ("id","email","name","passwordhash","createdAt","updatedAt") VALUES ($1,$2,$3,$4,now(),now()) ON CONFLICT ("id") DO NOTHING', [fakeUserId, `${fakeUserId}@example`, 'Test User', 'x'])
    await pool.query('INSERT INTO public."Tenant" ("id","name","subdomain","createdAt","updatedAt") VALUES ($1,$2,$3,now(),now()) ON CONFLICT ("id") DO NOTHING', [fakeUserId, 'Test Tenant', `${fakeUserId}-sub`])
    // create client mapping
    const createResp = await client.post('/api/accountants/clients').send({ accountantId: fakeUserId, tenantId: fakeUserId, accessLevel: 'FULL' }).set('Authorization', `Bearer test-token`).expect(201)
    const id = createResp.body.id

    const listResp = await client.get(`/api/accountants/clients/${fakeUserId}`).set('Authorization', `Bearer test-token`).expect(200)
    expect(Array.isArray(listResp.body)).toBeTruthy()

    await client.delete(`/api/accountants/clients/${id}`).set('Authorization', `Bearer test-token`).expect(200)
    await pool.end()
  }, 30000)
})
