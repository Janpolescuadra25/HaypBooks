import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import CompanySwitcher from '@/components/CompanySwitcher'
import { useSearchParams } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

describe('CompanySwitcher', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // default no query param
    ;(useSearchParams as jest.Mock).mockReturnValue({ get: () => null })
  })

  it('shows the active company name when available', async () => {
    const current = { id: '1', name: 'Acme Ltd', currency: 'USD', fiscalYearStart: '2023-01-01', plan: 'free' }
    const recent = [{ id: '1', name: 'Acme Ltd' }, { id: '2', name: 'Other Co' }]

    ;(global as any).fetch = jest.fn((input: RequestInfo) => {
      const url = String(input)
      if (url.endsWith('/api/company/current')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(current) })
      }
      if (url.endsWith('/api/companies/recent')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(recent) })
      }
      return Promise.resolve({ ok: false })
    })

    render(<CompanySwitcher />)

    // loading is async
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Acme Ltd')
    })
  })

  it('renders a dropdown of recent companies when clicked', async () => {
    const recent = [{ id: 'a', name: 'One' }, { id: 'b', name: 'Two' }]
    ;(global as any).fetch = jest.fn((input: RequestInfo) => {
      const url = String(input)
      if (url.endsWith('/api/company/current')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'a', name: 'One' }) })
      }
      if (url.endsWith('/api/companies/recent')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(recent) })
      }
      return Promise.resolve({ ok: false })
    })

    render(<CompanySwitcher />)

    // make sure button text is updated before clicking
    await waitFor(() => screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))

    // now list items should appear inside the menu
    await waitFor(() => {
      const menu = screen.getByRole('menu')
      expect(menu).toBeInTheDocument()
      // use getAllByText and make sure at least one of them is within the menu
      const allOne = screen.getAllByText('One')
      expect(allOne.some((el) => menu.contains(el))).toBe(true)
      expect(screen.getByText('Two')).toBeInTheDocument()
    })
  })

  it('honors the company query param when present', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({ get: (k: string) => (k === 'company' ? 'xyz' : null) })
    const mockCompany = { id: 'xyz', name: 'QueryCo', currency: 'USD', fiscalYearStart: '2023-01-01', plan: 'free' }

    ;(global as any).fetch = jest.fn((input: RequestInfo) => {
      const url = String(input)
      if (url.includes('/api/companies/xyz')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCompany) })
      }
      return Promise.resolve({ ok: false })
    })

    render(<CompanySwitcher />)

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('QueryCo')
    })
  })
})
