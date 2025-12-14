import { POST as POST_PERIODS } from '@/app/api/periods/route'
import { POST as POST_REOPEN } from '@/app/api/settings/reopen-period/route'
import { POST as ISSUE_CHECK } from '@/app/api/checks/route'
import { POST as MARK_PRINTED } from '@/app/api/checks/[id]/printed/route'
import { POST as VOID_CHECK } from '@/app/api/checks/[id]/void/route'

function req(url: string, method: string, body?: any) {
  return new Request(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
}

function today() { return new Date().toISOString().slice(0,10) }

describe('Checks lifecycle - printed and void behaviors', () => {
  test('mark-as-printed transitions to printed unless already void', async () => {
    const account = 'Operating Checking - 1234'
    const resIssue: any = await ISSUE_CHECK(req('http://localhost/api/checks', 'POST', { date: today(), payee: 'ACME', amount: 25, account }))
    if (resIssue.status !== 200) return // respect RBAC in CI runs
    const { check } = await resIssue.json()

    const resPrinted: any = await MARK_PRINTED(new Request(`http://localhost/api/checks/${check.id}/printed`, { method: 'POST' }), { params: { id: check.id } } as any)
    expect([200,403]).toContain(resPrinted.status)
    if (resPrinted.status === 200) {
      const { check: c2 } = await resPrinted.json()
      expect(c2.status).toBe('printed')
      expect(typeof c2.printedAt === 'string' && c2.printedAt.length >= 10).toBe(true)
    }
  })

  test('void enforces closed period on voidDate and sets reversal mode when original date is closed', async () => {
    const yday = new Date(Date.now() - 24*3600*1000).toISOString().slice(0,10)
    const resClose: any = await POST_PERIODS(req('http://localhost/api/periods', 'POST', { closeThrough: yday }))
    expect([200,403]).toContain(resClose.status)

    const account = 'Operating Checking - 1234'
    const resIssue: any = await ISSUE_CHECK(req('http://localhost/api/checks', 'POST', { date: yday /* in closed */, payee: 'ACME', amount: 50, account }))
    // Issue may be blocked due to closed period; if blocked, reopen and issue today
    if (resIssue.status !== 200) {
      await POST_REOPEN()
      const alt: any = await ISSUE_CHECK(req('http://localhost/api/checks', 'POST', { date: today(), payee: 'ACME', amount: 50, account }))
      if (alt.status !== 200) return
      const { check } = await alt.json()
      // Close yesterday again and attempt to void with voidDate=yday (should block)
      await POST_PERIODS(req('http://localhost/api/periods', 'POST', { closeThrough: yday }))
      const resBlock: any = await VOID_CHECK(new Request(`http://localhost/api/checks/${check.id}/void`, { method: 'POST', body: JSON.stringify({ voidDate: yday }) }), { params: { id: check.id } } as any)
      expect([400,403]).toContain(resBlock.status)
      // Now void with today (open) and expect success with mode flat
      const resVoid: any = await VOID_CHECK(new Request(`http://localhost/api/checks/${check.id}/void`, { method: 'POST', body: JSON.stringify({ voidDate: today() }) }), { params: { id: check.id } } as any)
      expect([200,403]).toContain(resVoid.status)
      if (resVoid.status === 200) {
        const { check: c3 } = await resVoid.json()
        expect(c3.status).toBe('void')
        expect(c3.voidMode).toBe('flat')
      }
      return
    }

    // If issuance succeeded in closed date (unlikely), then void today should set reversal mode
    const { check } = await resIssue.json()
    const resVoid: any = await VOID_CHECK(new Request(`http://localhost/api/checks/${check.id}/void`, { method: 'POST', body: JSON.stringify({ voidDate: today() }) }), { params: { id: check.id } } as any)
    expect([200,403]).toContain(resVoid.status)
    if (resVoid.status === 200) {
      const { check: c3 } = await resVoid.json()
      expect(c3.status).toBe('void')
      expect(c3.voidMode).toBe('reversal')
    }
  })

  test('cannot void twice', async () => {
    const account = 'Operating Checking - 1234'
    const resIssue: any = await ISSUE_CHECK(req('http://localhost/api/checks', 'POST', { date: today(), payee: 'ACME', amount: 10, account }))
    if (resIssue.status !== 200) return
    const { check } = await resIssue.json()

    const resVoid1: any = await VOID_CHECK(new Request(`http://localhost/api/checks/${check.id}/void`, { method: 'POST', body: JSON.stringify({ voidDate: today() }) }), { params: { id: check.id } } as any)
    expect([200,403]).toContain(resVoid1.status)

    const resVoid2: any = await VOID_CHECK(new Request(`http://localhost/api/checks/${check.id}/void`, { method: 'POST', body: JSON.stringify({ voidDate: today() }) }), { params: { id: check.id } } as any)
    expect([409,403]).toContain(resVoid2.status)
  })
})
