import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import CompanyHub from '../../components/companies/CompanyHub'

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((url: any) => {
    if (String(url).includes('filter=owned')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'c1', name: 'Owned Co', plan: 'Pro', lastAccessedAt: new Date().toISOString() }]) })
    }
    if (String(url).includes('filter=invited')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'c2', name: 'Invited Co' }]) })
    }
    return Promise.resolve({ ok: false })
  }) as any
})

afterEach(() => {
  ;(global.fetch as any)?.mockRestore?.()
})

test('renders owned and invited tabs and displays companies', async () => {
  render(<CompanyHub />)
  expect(screen.getByText(/my companies & clients/i)).toBeInTheDocument()
  // Wait for owned list to appear
  await waitFor(() => expect(screen.getByText('Owned Co')).toBeInTheDocument())
  // Switch to invited tab
  const invitedBtn = screen.getByRole('button', { name: /invited companies/i })
  await act(async () => { await userEvent.click(invitedBtn) })
  await waitFor(() => expect(screen.getByText('Invited Co')).toBeInTheDocument())
})

test('shows empty state when no companies', async () => {
  ;(global.fetch as any).mockImplementation((url: any) => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))
  render(<CompanyHub />)
  await waitFor(() => expect(screen.getByText(/no companies yet/i)).toBeInTheDocument())
})
