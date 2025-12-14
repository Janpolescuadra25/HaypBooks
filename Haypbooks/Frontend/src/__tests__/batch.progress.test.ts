import { POST as SEND_BATCH } from '@/app/api/customers/statements/pack/send/route'
import { POST as PROGRESS_STMT } from '@/app/api/customers/statements/pack/send/progress/route'
import { POST as REM_BATCH } from '@/app/api/collections/reminders/batch/route'
import { POST as PROGRESS_REM } from '@/app/api/collections/reminders/batch/progress/route'
import { seedIfNeeded } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function post(url: string) { return new Request(url, { method: 'POST' }) }

describe('Batch progress simulation', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(()=> setRoleOverride(undefined as any))

  test('Statement batch progresses queued -> processing -> sent', async () => {
    setRoleOverride('manager' as any)
    const asOf = '2025-10-15'
    const sendRes: any = await SEND_BATCH(post(`http://local/api/customers/statements/pack/send?asOf=${asOf}`))
    expect(sendRes.status).toBe(200)
    const sendJson = await sendRes.json()
    const batchId = sendJson.result.batchId
    const p1: any = await PROGRESS_STMT(post(`http://local/api/customers/statements/pack/send/progress?batchId=${batchId}`))
    expect(p1.status).toBe(200)
    const p1Json = await p1.json()
    expect(p1Json.result.status).toBe('processing')
    const p2: any = await PROGRESS_STMT(post(`http://local/api/customers/statements/pack/send/progress?batchId=${batchId}`))
    const p2Json = await p2.json()
    expect(p2Json.result.status).toBe('sent')
    const p3: any = await PROGRESS_STMT(post(`http://local/api/customers/statements/pack/send/progress?batchId=${batchId}`))
    const p3Json = await p3.json()
    // remains sent, changed false
    expect(p3Json.result.status).toBe('sent')
    expect(p3Json.result.changed).toBe(false)
  })

  test('Reminder batch progresses queued -> processing -> sent', async () => {
    setRoleOverride('manager' as any)
    const asOf = '2025-10-15'
    const remRes: any = await REM_BATCH(post(`http://local/api/collections/reminders/batch?asOf=${asOf}`))
    expect(remRes.status).toBe(200)
    const remJson = await remRes.json()
    const batchId = remJson.result.batchId
    const r1: any = await PROGRESS_REM(post(`http://local/api/collections/reminders/batch/progress?batchId=${batchId}`))
    const r1Json = await r1.json()
    expect(r1Json.result.status).toBe('processing')
    const r2: any = await PROGRESS_REM(post(`http://local/api/collections/reminders/batch/progress?batchId=${batchId}`))
    const r2Json = await r2.json()
    expect(r2Json.result.status).toBe('sent')
    const r3: any = await PROGRESS_REM(post(`http://local/api/collections/reminders/batch/progress?batchId=${batchId}`))
    const r3Json = await r3.json()
    expect(r3Json.result.status).toBe('sent')
    expect(r3Json.result.changed).toBe(false)
  })
})
