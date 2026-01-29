import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import CompanyHub from '../../components/companies/CompanyHub'

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((url: any) => {
    if (String(url).includes('filter=owned')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'c1', name: 'Owned Co', plan: 'Pro', lastAccessedAt: new Date().toISOString(), tenant: { _count: { users: 7 } } }]) })
    }
    if (String(url).includes('filter=invited')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'c2', name: 'Invited Co', tenant: { _count: { users: 3 } }, tenant: { _count: { users: 3 } } }]) })
    }
    return Promise.resolve({ ok: false })
  }) as any
})

afterEach(() => {
  ;(global.fetch as any)?.mockRestore?.()
})

test('renders owned companies and displays them', async () => {
  await act(async () => { render(<CompanyHub />) })
  // Check for header (dynamic import -> use find)
  expect(await screen.findByText(/HAYPBOOKS/i)).toBeInTheDocument()
  // Wait for owned list to appear and check card CTA
  await waitFor(() => expect(screen.getByText('Owned Co')).toBeInTheDocument())
  await waitFor(() => expect(screen.getByRole('button', { name: /open books/i })).toBeInTheDocument())
})

test('register entity card is present when companies are present', async () => {
  await act(async () => { render(<CompanyHub />) })
  await waitFor(() => expect(screen.getByText(/add company/i)).toBeInTheDocument())
  await waitFor(() => expect(screen.getByText(/expand portfolio/i)).toBeInTheDocument())
})

test('shows empty state when no companies', async () => {
  ;(global.fetch as any).mockImplementation((url: any) => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))
  await act(async () => { render(<CompanyHub />) })
  // Ensure the register card is available when empty
  const register = await screen.findByLabelText('Register entity')
  expect(register).toBeInTheDocument()
})

test('search filters companies', async () => {
  await act(async () => { render(<CompanyHub />) })
  // wait for initial owned company to show
  await waitFor(() => expect(screen.getByText('Owned Co')).toBeInTheDocument())

  const input = screen.getByLabelText('search entities') as HTMLInputElement
  await act(async () => { await userEvent.type(input, 'Invited') })

  // Wait for debounce and the no-match message
  await waitFor(() => expect(screen.getByText(/no companies match that search/i)).toBeInTheDocument())
})

test("shows a company created during signup/onboarding (e.g. \"JP's shop\")", async () => {
  ;(global.fetch as any).mockImplementation((url: any) => {
    if (String(url).includes('filter=owned')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'c3', name: "JP's shop", plan: 'Free' }]) })
    }
    if (String(url).includes('filter=invited')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }
    return Promise.resolve({ ok: false })
  })

  await act(async () => { render(<CompanyHub />) })
  await waitFor(() => expect(screen.getByText("JP's shop")).toBeInTheDocument())
  // verify register card still present
  await waitFor(() => expect(screen.getByText(/add company/i)).toBeInTheDocument())
})

// Defensive test: if API returns duplicate company rows, ensure we dedupe client-side
test('dedupes duplicate companies returned by API', async () => {
  ;(global.fetch as any).mockImplementation((url: any) => {
    if (String(url).includes('filter=owned')) {
      // two entries with same id
      return Promise.resolve({ ok: true, json: () => Promise.resolve([
        { id: 'cdupe', name: 'Dupe Co', plan: 'Free' },
        { id: 'cdupe', name: 'Dupe Co', plan: 'Free' }
      ]) })
    }
    if (String(url).includes('filter=invited')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }
    return Promise.resolve({ ok: false })
  })

  render(<CompanyHub />)
  // Only one card should be rendered for 'Dupe Co'
  await waitFor(() => expect(screen.getAllByText('Dupe Co').length).toBe(1))
})
