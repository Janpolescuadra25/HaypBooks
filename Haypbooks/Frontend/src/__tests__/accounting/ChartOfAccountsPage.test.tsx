import React from 'react'
import { render, screen, act, fireEvent, within } from '@testing-library/react'

let fakeCompany = { companyId: null as string | null, loading: false, error: null as string | null }
jest.mock('@/hooks/useCompanyId', () => ({
  useCompanyId: () => fakeCompany,
}))

// make sure apiClient doesn't actually hit network
jest.mock('@/lib/api-client', () => ({
  get: jest.fn().mockResolvedValue({ data: [] }),
  post: jest.fn().mockResolvedValue({}),
  put: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

import apiClient from '@/lib/api-client'
import ChartOfAccountsPage from '@/app/(owner)/accounting/core-accounting/chart-of-accounts/page'

describe('ChartOfAccountsPage', () => {
  it('disables New Account button when no company', async () => {
    fakeCompany = { companyId: null, loading: false, error: null }
    await act(async () => { render(<ChartOfAccountsPage />) })
    const btn = screen.getByRole('button', { name: /new account/i })
    expect(btn).toBeDisabled()
    // disabled, clicking should have no effect
    await act(async () => { fireEvent.click(btn) })
    // modal should still not be present
    expect(screen.queryByRole('heading', { name: /new account/i })).not.toBeInTheDocument()
  })

  it('opens modal when companyId present', async () => {
    fakeCompany = { companyId: 'fake-id', loading: false, error: null }
    const { rerender } = render(<ChartOfAccountsPage />)
    const btn = screen.getByRole('button', { name: /new account/i })
    expect(btn).not.toBeDisabled()
    await act(async () => { fireEvent.click(btn) })
    // modal heading should appear
    expect(await screen.findByRole('heading', { name: /new account/i })).toBeInTheDocument()
  })

  it('locks account type to parent type when a parent account is selected', async () => {
    fakeCompany = { companyId: 'fake-id', loading: false, error: null }

    // For this test, ensure the accounts endpoint returns a parent header account
    ;(apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: 'p1',
          code: '1000',
          name: 'Assets',
          type: 'Asset',
          normalSide: 'Debit',
          isActive: true,
          isHeader: true,
          parentId: null,
          balance: 0,
        },
      ],
    })

    render(<ChartOfAccountsPage />)
    const btn = screen.getByRole('button', { name: /new account/i })
    await act(async () => { fireEvent.click(btn) })

    // Parent selector should include the header account
    const parentSelect = await screen.findByLabelText(/parent account/i)
    await act(async () => { fireEvent.change(parentSelect, { target: { value: 'p1' } }) })

    // Account type should lock to Asset (parent type) and become disabled
    const typeSelect = screen.getByLabelText(/account type/i)
    expect(typeSelect).toBeDisabled()
    expect((typeSelect as HTMLSelectElement).value).toBe('Asset')
  })

  it('disables deactivate on parent accounts with children', async () => {
    fakeCompany = { companyId: 'fake-id', loading: false, error: null }

    ;(apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: 'p1',
          code: '1000',
          name: 'Assets',
          type: 'Asset',
          normalSide: 'Debit',
          isActive: true,
          isHeader: true,
          parentId: null,
          balance: 0,
        },
        {
          id: 'c1',
          code: '1100',
          name: 'Cash',
          type: 'Asset',
          normalSide: 'Debit',
          isActive: true,
          isHeader: false,
          parentId: 'p1',
          balance: 0,
        },
      ],
    })

    render(<ChartOfAccountsPage />)

    // Wait for the parent row to render
    const parentRow = await screen.findByText('Assets')
    const rowElement = parentRow.closest('tr')
    expect(rowElement).not.toBeNull()

    // Ensure the parent row is recognized as having children (it should have an expand/collapse button + menu button)
    const rowButtons = (rowElement as HTMLElement).querySelectorAll('button')
    expect(rowButtons.length).toBeGreaterThan(1)

    // Open the actions menu for the parent account
    const menuButton = within(rowElement as HTMLElement).getByRole('button', { name: /more options/i })
    await act(async () => { fireEvent.click(menuButton) })

    // Deactivate should be disabled because the parent has children
    const deactivateButton = await screen.findByRole('button', { name: /deactivate/i })
    expect(deactivateButton).toBeDisabled()
  })

  it('disables type change when account has transactions', async () => {
    fakeCompany = { companyId: 'fake-id', loading: false, error: null }

    ;(apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: 'a1',
          code: '1100',
          name: 'Cash',
          type: 'Asset',
          normalSide: 'Debit',
          isActive: true,
          isHeader: false,
          parentId: null,
          balance: 123.45,
        },
      ],
    })

    render(<ChartOfAccountsPage />)
    const row = await screen.findByText('Cash')
    const rowElement = row.closest('tr')
    expect(rowElement).not.toBeNull()

    const menuButton = within(rowElement as HTMLElement).getByRole('button', { name: /more options/i })
    await act(async () => { fireEvent.click(menuButton) })

    const editButton = await screen.findByRole('button', { name: /edit account/i })
    await act(async () => { fireEvent.click(editButton) })

    const typeSelect = await screen.findByLabelText(/account type/i)
    expect(typeSelect).toBeDisabled()
    expect(await screen.findByText(/cannot change account type once the account has transactions/i)).toBeInTheDocument()
  })
})
