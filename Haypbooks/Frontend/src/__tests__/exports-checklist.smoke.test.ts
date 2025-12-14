import { GET as INVOICES_GET } from '@/app/api/invoices/export/route'
import { GET as BILLS_GET } from '@/app/api/bills/export/route'
import { GET as TX_GET } from '@/app/api/transactions/export/route'
import { GET as CUST_GET } from '@/app/api/customers/export/route'
import { GET as VEND_GET } from '@/app/api/vendors/export/route'
import { GET as CUST_CONTACT_CSV } from '@/app/api/reports/customer-contact-list/export/route'
import { GET as CUST_PHONE_CSV } from '@/app/api/reports/customer-phone-list/export/route'
import { GET as VEND_CONTACT_CSV } from '@/app/api/reports/vendor-contact-list/export/route'
import { GET as VEND_PHONE_CSV } from '@/app/api/reports/vendor-phone-list/export/route'

function req(url: string) { return new Request(url) }

// Quick smoke to ensure captions and filenames are formatted. Not exhaustive.
describe('Exports checklist smoke', () => {
  test('invoices, bills, transactions captions present', async () => {
    const end = '2025-09-10'
    const [inv, bil, tx] = await Promise.all([
      INVOICES_GET(req(`http://localhost/api/invoices/export?end=${end}`)),
      BILLS_GET(req(`http://localhost/api/bills/export?end=${end}`)),
      TX_GET(req(`http://localhost/api/transactions/export?end=${end}`)),
    ])
    for (const r of [inv, bil, tx]) {
      const body = await r.text()
      expect(body.split(/\r?\n/)[0]).toContain('As of')
      expect((r.headers.get('Content-Disposition')||'').toLowerCase()).toContain(`asof-${end}`)
    }
  })

  test('customers and vendors exports include asof in filename', async () => {
    const end = '2025-09-10'
    const [cust, vend] = await Promise.all([
      CUST_GET(req(`http://localhost/api/customers/export?end=${end}`)),
      VEND_GET(req(`http://localhost/api/vendors/export?end=${end}`)),
    ])
    expect((cust.headers.get('Content-Disposition')||'')).toContain(`asof-${end}`)
    expect((vend.headers.get('Content-Disposition')||'')).toContain(`asof-${end}`)
  })

  test('customer/vendor list CSV captions and headers', async () => {
    const end = '2025-09-10'
    const [cc, cp, vc, vp] = await Promise.all([
      CUST_CONTACT_CSV(req(`http://localhost/api/reports/customer-contact-list/export?end=${end}`)),
      CUST_PHONE_CSV(req(`http://localhost/api/reports/customer-phone-list/export?end=${end}`)),
      VEND_CONTACT_CSV(req(`http://localhost/api/reports/vendor-contact-list/export?end=${end}`)),
      VEND_PHONE_CSV(req(`http://localhost/api/reports/vendor-phone-list/export?end=${end}`)),
    ])
    const lines = async (res: any) => (await res.text()).split(/\r?\n/)
    const [lcc, lcp, lvc, lvp] = await Promise.all([lines(cc), lines(cp), lines(vc), lines(vp)])
    expect(lcc[0]).toContain('As of'); expect(lcc[1]).toBe(''); expect(lcc[2]).toBe('Name,Email,Phone')
    expect(lcp[0]).toContain('As of'); expect(lcp[1]).toBe(''); expect(lcp[2]).toBe('Name,Phone')
    expect(lvc[0]).toContain('As of'); expect(lvc[1]).toBe(''); expect(lvc[2]).toBe('Name,Email,Phone')
    expect(lvp[0]).toContain('As of'); expect(lvp[1]).toBe(''); expect(lvp[2]).toBe('Name,Phone')
  })
})
