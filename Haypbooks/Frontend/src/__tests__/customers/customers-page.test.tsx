import React from 'react'
import { render, screen, within } from '@testing-library/react'
import CustomersPage from '@/components/owner/CustomersCrudPage'
import { useCrud } from '@/hooks/useCrud'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'

jest.mock('@/hooks/useCrud', () => ({ __esModule: true, useCrud: jest.fn() }))
jest.mock('@/hooks/useCompanyCurrency', () => ({ __esModule: true, useCompanyCurrency: jest.fn() }))

describe('CustomersPage', () => {
  const customerItem = {
    id: 'c1',
    displayName: 'John Corp',
    email: 'john@test.com',
    phone: '123456',
    status: 'Active',
    totalSales: 5000,
    openBalance: 2000,
    paymentTerms: 'NET_30',
  }

  beforeEach(() => {
    jest.resetAllMocks()
    ;(useCompanyCurrency as jest.Mock).mockReturnValue({ currency: 'PHP', loading: false })
    ;(useCrud as jest.Mock).mockReturnValue({
      data: [customerItem],
      loading: false,
      error: null,
      refetch: jest.fn(),
      modalOpen: false,
      modalMode: 'view',
      modalTitle: '',
      editingRow: null,
      openCreate: jest.fn(),
      openEdit: jest.fn(),
      openView: jest.fn(),
      openDelete: jest.fn(),
      closeModal: jest.fn(),
      saving: false,
      submitForm: jest.fn(),
      deleteRecord: jest.fn(),
      search: '',
      setSearch: jest.fn(),
      filteredData: [customerItem],
      selectedIds: [],
      toggleSelectAll: jest.fn(),
      toggleSelect: jest.fn(),
      clearSelection: jest.fn(),
      viewAction: jest.fn(() => ({ label: 'View', icon: null, onClick: jest.fn() })),
      editAction: jest.fn(() => ({ label: 'Edit', icon: null, onClick: jest.fn() })),
      deleteAction: jest.fn(() => ({ label: 'Delete', icon: null, onClick: jest.fn(), variant: 'danger' })),
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    })
  })

  it('renders customer name, email, phone in table', () => {
    render(<CustomersPage />)

    const row = screen.getByText('John Corp').closest('tr')
    expect(row).toBeInTheDocument()
    expect(row).toHaveTextContent('john@test.com')
    expect(row).toHaveTextContent('123456')
  })

  it('renders status badge with Active class', () => {
    render(<CustomersPage />)
    const row = screen.getByText('John Corp').closest('tr')
    expect(row).toBeInTheDocument()
    const statusCell = within(row!).getByText('Active')
    expect(statusCell).toHaveClass('text-emerald-700')
  })

  it('renders payment terms badge and amounts', () => {
    render(<CustomersPage />)
    const row = screen.getByText('John Corp').closest('tr')
    expect(row).toHaveTextContent('NET_30')
    expect(row).toHaveTextContent('5,000')
    expect(row).toHaveTextContent('2,000')
  })

  it('shows empty state when no customers', () => {
    ;(useCrud as jest.Mock).mockReturnValueOnce({
      data: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
      modalOpen: false,
      modalMode: 'view',
      modalTitle: '',
      editingRow: null,
      openCreate: jest.fn(),
      openEdit: jest.fn(),
      openView: jest.fn(),
      openDelete: jest.fn(),
      closeModal: jest.fn(),
      saving: false,
      submitForm: jest.fn(),
      deleteRecord: jest.fn(),
      search: '',
      setSearch: jest.fn(),
      filteredData: [],
      selectedIds: [],
      toggleSelectAll: jest.fn(),
      toggleSelect: jest.fn(),
      clearSelection: jest.fn(),
      viewAction: jest.fn(() => ({ label: 'View', icon: null, onClick: jest.fn() })),
      editAction: jest.fn(() => ({ label: 'Edit', icon: null, onClick: jest.fn() })),
      deleteAction: jest.fn(() => ({ label: 'Delete', icon: null, onClick: jest.fn(), variant: 'danger' })),
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    })

    render(<CustomersPage />)
    expect(screen.getByText('No customers yet')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    ;(useCrud as jest.Mock).mockReturnValueOnce({
      data: [],
      loading: true,
      error: null,
      refetch: jest.fn(),
      modalOpen: false,
      modalMode: 'view',
      modalTitle: '',
      editingRow: null,
      openCreate: jest.fn(),
      openEdit: jest.fn(),
      openView: jest.fn(),
      openDelete: jest.fn(),
      closeModal: jest.fn(),
      saving: false,
      submitForm: jest.fn(),
      deleteRecord: jest.fn(),
      search: '',
      setSearch: jest.fn(),
      filteredData: [],
      selectedIds: [],
      toggleSelectAll: jest.fn(),
      toggleSelect: jest.fn(),
      clearSelection: jest.fn(),
      viewAction: jest.fn(() => ({ label: 'View', icon: null, onClick: jest.fn() })),
      editAction: jest.fn(() => ({ label: 'Edit', icon: null, onClick: jest.fn() })),
      deleteAction: jest.fn(() => ({ label: 'Delete', icon: null, onClick: jest.fn(), variant: 'danger' })),
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    })

    render(<CustomersPage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
