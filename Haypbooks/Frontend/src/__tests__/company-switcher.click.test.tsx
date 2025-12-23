import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import CompanySwitcher from '@/components/CompanySwitcher'

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((url: any, opts?: any) => {
    if (String(url).includes('/api/companies/recent')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 't1', name: 'Demo Tenant' }]) })
    }
    if (String(url).includes('/api/companies/') && opts && opts.method === 'PATCH') {
      return Promise.resolve({ ok: true })
    }
    return Promise.resolve({ ok: false })
  }) as any
})

afterEach(() => {
  ;(global.fetch as any).mockRestore?.()
})

test('clicking a company triggers patch and navigation', async () => {
  render(<CompanySwitcher />)
  const btn = screen.getByRole('button', { name: /companies/i })
  await act(async () => { await userEvent.click(btn) })
  const item = await screen.findByText('Demo Tenant')

  await act(async () => { await userEvent.click(item) })
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/companies/t1/last-accessed', expect.objectContaining({ method: 'PATCH' })))
})
