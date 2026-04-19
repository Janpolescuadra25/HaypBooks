import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@/test-utils'

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

    const addButton = await screen.findByRole('button', { name: 'Add Customer' })
    await userEvent.click(addButton)

    expect(await screen.findByRole('dialog', { name: /new customer/i })).toBeInTheDocument()
  })

  it('shows customer status badges in the table', async () => {
    render(<CustomersPage />)

    expect(await screen.findByText('Active')).toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: 'Add Customer' })).toBeInTheDocument()
  })

  it('shows bulk actions after selecting a row', async () => {
    render(<CustomersPage />)

    const rowCheckbox = await screen.findByRole('checkbox', { name: 'Select row 1' })
    await userEvent.click(rowCheckbox)

    expect(await screen.findByText('1 item selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Selected' })).toBeInTheDocument()
  })

  it('opens delete confirmation and deletes the customer', async () => {
    render(<CustomersPage />)

    const deleteButton = await screen.findByTitle('Delete')
    await userEvent.click(deleteButton)

    expect(await screen.findByRole('dialog', { name: /delete customer/i })).toBeInTheDocument()

    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    await userEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/companies/company-1/ar/customers/cust-1')
    })
  })
})
