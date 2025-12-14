import { setRoleOverride } from '@/lib/rbac'
import { GET as STMT_EXP } from '@/app/api/customers/[id]/statement/export/route'

const req = (u: string) => new Request(u)

// Using a deterministic seeded customer id used by mock aggregations
const custId = 'cust-001'

describe('RBAC: Customer Statement CSV export', () => {
  afterEach(() => setRoleOverride(undefined))

  test('denies when lacking reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await STMT_EXP(req(`http://localhost/api/customers/${custId}/statement/export?asOf=2025-09-15`), { params: { id: custId } } as any)
    expect(res.status).toBe(403)
  })

  test('allows viewer and shapes filename', async () => {
    setRoleOverride('viewer')
    const asOf = '2025-09-15'
    const res: any = await STMT_EXP(req(`http://localhost/api/customers/${custId}/statement/export?asOf=${asOf}`), { params: { id: custId } } as any)
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain(`customer-statement-asof-${asOf}`)
  })
})
