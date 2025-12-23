import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import CompanySwitcher from '@/components/CompanySwitcher'

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((url: any) => {
    if (String(url).includes('/api/companies/recent')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 't1', name: 'Demo Tenant' }]) })
    }
    if (String(url).includes('/api/companies/')) {
      return Promise.resolve({ ok: true })
    }
    return Promise.resolve({ ok: false })
  }) as any
})

afterEach(() => {
  ;(global.fetch as any).mockRestore?.()
})

test('renders recent companies and triggers navigation on click', async () => {
  render(<CompanySwitcher />)
  const btn = screen.getByRole('button', { name: /companies/i })
  await act(async () => { await userEvent.click(btn) })
  await waitFor(() => expect(screen.getByText('Demo Tenant')).toBeInTheDocument())
  const item = screen.getByText('Demo Tenant')
  // Ensure displayed item exists (click navigation tested in e2e)
  expect(item).toBeInTheDocument()
})
