import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'

let fakeCompany = { companyId: null as string | null, loading: false, error: null as string | null }
jest.mock('@/hooks/useCompanyId', () => ({
  useCompanyId: () => fakeCompany,
}))

jest.mock('@/lib/api-client', () => ({
  get: jest.fn().mockResolvedValue({ data: [] }),
  post: jest.fn().mockResolvedValue({}),
  put: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

import AccountingHubPage from '@/components/accounting/AccountingHubPage'

describe('AccountingHubPage', () => {
  it('shows the Journal Entries tab and loads the Journal Entries panel', async () => {
    fakeCompany = { companyId: 'abc', loading: false, error: null }
    render(<AccountingHubPage />)

    const tab = screen.getByRole('button', { name: /journal entries/i })
    expect(tab).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(tab)
    })

    expect(await screen.findByRole('heading', { name: /journal entries/i })).toBeInTheDocument()
  })
})
