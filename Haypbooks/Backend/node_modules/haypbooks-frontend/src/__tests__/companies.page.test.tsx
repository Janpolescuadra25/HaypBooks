import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({ usePathname: () => '/companies' }))

import CompaniesHub from '@/components/CompaniesHub'

describe('Companies hub', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('shows companies and allows creating new', async () => {
    const companies = [{ id: 'c1', name: 'Alpha LLC', lastAccessedAt: new Date().toISOString() }]
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => companies } as any)

    render(<CompaniesHub />)

    expect(await screen.findByText(/My Companies & Clients/i)).toBeInTheDocument()
    expect(await screen.findByText('Alpha LLC')).toBeInTheDocument()

    // mock create response
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'c2', name: 'Beta Inc' }) } as any)

    fireEvent.change(screen.getByPlaceholderText(/New company name/i), { target: { value: 'Beta Inc' } })
    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(screen.getByText('Beta Inc')).toBeInTheDocument())
  })
})
