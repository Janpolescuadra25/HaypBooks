import { render, screen, waitFor } from '@testing-library/react'
import AccountantHub from '@/components/accountant/AccountantHub'

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((url: any) => {
    const s = String(url)
    if (s.includes('/api/tenants/clients')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([
        { tenantId: 't1', tenantName: 'Client A', role: 'Owner', companiesCount: 1, companies: [{ id: 'c1', name: 'Client A Co' }], lastAccessedAt: new Date().toISOString() }
      ]) })
    }
    if (s.includes('/api/tenants/invites/pending')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }
    if (s.includes('filter=invited')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'c1', name: 'Client A', role: 'Owner' }]) })
    }
    return Promise.resolve({ ok: false })
  }) as any
})

afterEach(() => {
  ;(global.fetch as any)?.mockRestore?.()
})

test('renders clients list', async () => {
  render(<AccountantHub />)
  await waitFor(() => expect(screen.getByText('Client A')).toBeInTheDocument())
})
