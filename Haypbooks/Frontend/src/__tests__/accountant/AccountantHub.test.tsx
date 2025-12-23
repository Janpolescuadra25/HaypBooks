import { render, screen, waitFor } from '@testing-library/react'
import AccountantHub from '@/components/accountant/AccountantHub'

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((url: any) => {
    if (String(url).includes('filter=invited')) {
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
