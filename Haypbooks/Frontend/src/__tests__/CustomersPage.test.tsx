import React from 'react'
import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/react'
import { render, screen, waitFor, within } from '@/test-utils'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

jest.mock('@/hooks/useCompanyId', () => ({ useCompanyId: () => ({ companyId: 'company-1', loading: false, error: null }) }))
jest.mock('@/hooks/useCompanyCurrency', () => ({ useCompanyCurrency: () => ({ currency: 'USD', loading: false }) }))

const mockGet = jest.fn()
const mockDelete = jest.fn()
const mockPost = jest.fn()
const mockPatch = jest.fn()
jest.mock('@/lib/api-client', () => ({ __esModule: true, default: { get: mockGet, delete: mockDelete, post: mockPost, patch: mockPatch } }))

import CustomersPage from '@/components/sales/CustomersPage'

const customer = {
  id: 'cust-1',
  name: 'Acme Corp',
  email: 'contact@acme.com',
  phone: '555-0100',
  status: 'ACTIVE',
  groupName: 'Retail',
  paymentTermName: 'Net 30',
  openBalance: 1234.56,
}

const defaultApiMocks = () => {
  mockGet.mockImplementation((url: string) => {
    if (url.includes('/ar/customers/export')) {
      return Promise.resolve({ data: 'id,name\n1,Acme Corp' })
    }
    if (url.includes('/ar/customers')) {
      return Promise.resolve({ data: { data: [customer], total: 1 } })
    }
    if (url.includes('/ar/payment-terms')) {
      return Promise.resolve({ data: [] })
    }
    if (url.includes('/customer-groups')) {
      return Promise.resolve({ data: [] })
    }
    return Promise.resolve({ data: [] })
  })
  mockDelete.mockResolvedValue({})
  mockPost.mockResolvedValue({})
  mockPatch.mockResolvedValue({})
}

describe('CustomersPage', () => {
  const clickAddCustomerButton = async () => {
    const addButtons = await screen.findAllByRole('button', { name: 'Add Customer' })
    await act(async () => {
      await userEvent.click(addButtons[0])
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    defaultApiMocks()
  })

  it('renders the customers title and subtitle', async () => {
    render(<CustomersPage />)

    expect(await screen.findByRole('heading', { name: /customers/i })).toBeInTheDocument()
    expect(screen.getByText('1 customer')).toBeInTheDocument()
  })

  it('opens the add customer modal when Add Customer is clicked', async () => {
    render(<CustomersPage />)

    expect(await screen.findByText('1 customer')).toBeInTheDocument()
    await clickAddCustomerButton()

    expect(await screen.findByRole('dialog', { name: /new customer/i })).toBeInTheDocument()
  })

  it('shows customer status badges in the table', async () => {
    render(<CustomersPage />)

    const activeNodes = await screen.findAllByText('Active')
    expect(activeNodes.some((node) => node.tagName.toLowerCase() === 'span')).toBe(true)
  })

  it('shows empty state when no customers exist', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/ar/customers')) return Promise.resolve({ data: { data: [], total: 0 } })
      if (url.includes('/ar/payment-terms')) return Promise.resolve({ data: [] })
      if (url.includes('/customer-groups')) return Promise.resolve({ data: [] })
      return Promise.resolve({ data: [] })
    })

    render(<CustomersPage />)

    expect(await screen.findByText('No customers yet')).toBeInTheDocument()
    const addButtons = screen.getAllByRole('button', { name: 'Add Customer' })
    expect(addButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows bulk actions after selecting a row', async () => {
    render(<CustomersPage />)

    expect(await screen.findByText('1 customer')).toBeInTheDocument()
    const rowCheckboxes = await screen.findAllByRole('checkbox')
    await act(async () => {
      await userEvent.click(rowCheckboxes[0])
    })

    await waitFor(() => {
      expect(screen.getByText('1 item selected')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Delete Selected' })).toBeInTheDocument()
  })

  it('opens delete confirmation and deletes the customer', async () => {
    render(<CustomersPage />)

    expect(await screen.findByText('1 customer')).toBeInTheDocument()
    const deleteButton = await screen.findByTitle('Delete')
    await act(async () => {
      await userEvent.click(deleteButton)
    })

    const deleteDialog = await screen.findByRole('dialog', { name: /delete customer/i })
    expect(deleteDialog).toBeInTheDocument()

    const confirmButton = within(deleteDialog).getByRole('button', { name: 'Delete' })
    await act(async () => {
      await userEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/companies/company-1/ar/customers/cust-1')
    })
  })
})
