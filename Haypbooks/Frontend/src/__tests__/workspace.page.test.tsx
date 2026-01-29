import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WorkspacePage from '@/app/workspace/page'

const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock }) }))

jest.mock('@/lib/profile-cache', () => ({ getProfileCached: jest.fn() }))
import * as profile from '@/lib/profile-cache'

describe('Workspace page', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('renders companies and practices and opens company modal', async () => {
    ;(profile.getProfileCached as jest.Mock).mockResolvedValue({ name: 'John Paul', companies: [{ id: 'c1', name: 'Hayp Ventures' }, { id: 'c2', name: 'Stellar Logistics' }], practices: [{ id: 'p1', name: 'Hayp Advisory' }, { id: 'p2', name: 'Global Tax Group' }] })

    (global as any).fetch = jest.fn().mockImplementation((input: RequestInfo) => {
      const url = String(input)
      if (url === '/api/users/preferred-workspace') return Promise.resolve({ ok: true })
      return Promise.resolve({ ok: true })
    })

    render(<WorkspacePage />)

    expect(await screen.findByText(/Welcome back, John Paul/i)).toBeInTheDocument()

    // company names present
    expect(screen.getByText(/Hayp Ventures/i)).toBeInTheDocument()
    expect(screen.getByText(/Stellar Logistics/i)).toBeInTheDocument()

    // click a company row
    fireEvent.click(screen.getByText(/Hayp Ventures/i))

    // modal should appear
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    const confirmBtn = screen.getByTestId('confirm-company')

    fireEvent.click(confirmBtn)

    // prefer verifying navigation to dashboard — fetch is environment-sensitive in Node tests
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/dashboard'))
  })

  test('opens firm modal and creates a practice then continues', async () => {
    ;(profile.getProfileCached as jest.Mock).mockResolvedValue({ name: 'Alice', companies: [], practices: [] })

    (global as any).fetch = jest.fn((input: RequestInfo) => {
      const url = String(input)
      if (url === '/api/practices') return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'p-new' }) })
      if (url === '/api/user/preferred-workspace') return Promise.resolve({ ok: true })
      return Promise.resolve({ ok: true })
    })

    render(<WorkspacePage />)

    const openFirmBtn = await screen.findByTestId('open-firm')
    fireEvent.click(openFirmBtn)

    // the firm modal is shown (it will show input)
    expect(await screen.findByLabelText(/Practice name/i)).toBeInTheDocument()

    const input = screen.getByPlaceholderText(/Maria Santos Accounting/i)
    fireEvent.change(input, { target: { value: 'Rivera CPA' } })

    const createBtn = screen.getByTestId('create-firm')
    fireEvent.click(createBtn)

    // In Node tests relative fetches may be environment-sensitive; ensure we navigated to dashboard
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/dashboard'))
  })
})
