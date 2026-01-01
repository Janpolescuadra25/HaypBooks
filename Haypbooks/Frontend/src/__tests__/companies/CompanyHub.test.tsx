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

test('renders owned companies and displays them', async () => {
  render(<CompanyHub />)
  // Check for header
  expect(screen.getByText(/HAYPBOOKS/i)).toBeInTheDocument()
  // Wait for owned list to appear and check card CTA
  await waitFor(() => expect(screen.getByText('Owned Co')).toBeInTheDocument())
  await waitFor(() => expect(screen.getByRole('button', { name: /open dashboard/i })).toBeInTheDocument())
})

test('register entity card is present when companies are present', async () => {
  render(<CompanyHub />)
  await waitFor(() => expect(screen.getByText(/new entity/i)).toBeInTheDocument())
  await waitFor(() => expect(screen.getByText(/expand portfolio/i)).toBeInTheDocument())
})

test('shows empty state when no companies', async () => {
  ;(global.fetch as any).mockImplementation((url: any) => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))
  render(<CompanyHub />)
  await waitFor(() => expect(screen.getByText(/no companies yet/i)).toBeInTheDocument())
})

test('search filters companies', async () => {
  render(<CompanyHub />)
  // wait for initial owned company to show
  await waitFor(() => expect(screen.getByText('Owned Co')).toBeInTheDocument())

  const input = screen.getByLabelText('search entities') as HTMLInputElement
  await act(async () => { await userEvent.type(input, 'Invited') })

  // Wait for debounce and the no-match message
  await waitFor(() => expect(screen.getByText(/no companies match that search/i)).toBeInTheDocument())
})
