'use client'

import { fireEvent, render, screen } from '@testing-library/react'
import DataPage from '@/components/shared/DataPage'

interface TestRow {
  id: string
  name: string
  status: string
}

describe('DataPage', () => {
  const columns = [
    { id: 'id', header: 'ID', accessorKey: 'id' },
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'status', header: 'Status', accessorKey: 'status' },
  ]

  const rows: TestRow[] = [
    { id: '1', name: 'First item', status: 'PAID' },
    { id: '2', name: 'Second item', status: 'DRAFT' },
  ]

  it('renders title and subtitle correctly', () => {
    render(
      <DataPage
        title="Test Table"
        subtitle="A useful subtitle"
        columns={columns}
        data={rows}
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
      />,
    )

    expect(screen.getByText('Test Table')).toBeInTheDocument()
    expect(screen.getByText('A useful subtitle')).toBeInTheDocument()
  })

  it('renders primary action button and calls onPrimaryAction', () => {
    const onPrimaryAction = jest.fn()

    render(
      <DataPage
        title="Test Table"
        primaryActionLabel="New Item"
        onPrimaryAction={onPrimaryAction}
        columns={columns}
        data={rows}
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
      />,
    )

    const button = screen.getByRole('button', { name: 'New Item' })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(onPrimaryAction).toHaveBeenCalledTimes(1)
  })

  it('renders filter section when filters prop is provided', () => {
    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={rows}
        currentPage={1}
        totalPages={1}
        filters={<div data-testid="filters">filter controls</div>}
        onPageChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
      />,
    )

    expect(screen.getByTestId('filters')).toBeInTheDocument()
    expect(screen.getByText('filter controls')).toBeInTheDocument()
  })

  it('does not render filter section when filters prop is omitted', () => {
    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={rows}
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
      />,
    )

    expect(screen.queryByTestId('filters')).not.toBeInTheDocument()
  })

  it('renders DataTable headers and rows correctly', () => {
    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={rows}
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
      />,
    )

    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('First item')).toBeInTheDocument()
    expect(screen.getByText('Second item')).toBeInTheDocument()
  })

  it('shows BulkActionBar when items are selected', () => {
    const bulkActions = [
      { label: 'Delete', onClick: jest.fn(), variant: 'destructive' as const },
    ]

    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={rows}
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
        selectedIds={['1']}
        onSelectionChange={jest.fn()}
        bulkActions={bulkActions}
      />,
    )

    expect(screen.getByText('1 item selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('hides BulkActionBar when nothing is selected', () => {
    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={rows}
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
      />,
    )

    expect(screen.queryByText('item selected')).not.toBeInTheDocument()
  })

  it('shows loading skeleton when isLoading is true', () => {
    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={rows}
        isLoading
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
      />,
    )

    expect(screen.getByTestId('data-page-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('First item')).not.toBeInTheDocument()
  })

  it('shows EmptyStateEnhanced when data is empty', () => {
    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={[]}
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
        emptyTitle="No entries"
        emptyDescription="There are no entries available."
        emptyPrimaryAction="Create entry"
      />,
    )

    expect(screen.getByText('No entries')).toBeInTheDocument()
    expect(screen.getByText('There are no entries available.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create entry' })).toBeInTheDocument()
  })

  it('renders pagination controls and handles page changes', () => {
    const onPageChange = jest.fn()

    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={rows}
        currentPage={1}
        totalPages={3}
        totalCount={26}
        onPageChange={onPageChange}
        pageSize={10}
        onPageSizeChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('Showing 1-10 of 26')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables Next button when on last page', () => {
    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={rows}
        currentPage={3}
        totalPages={3}
        totalCount={26}
        onPageChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('passes selection state to DataTable correctly', () => {
    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={rows}
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
        selectedIds={['2']}
        onSelectionChange={jest.fn()}
      />,
    )

    const rowCheckbox = screen.getByRole('checkbox', { name: 'Select row 2' }) as HTMLInputElement
    expect(rowCheckbox.checked).toBe(true)
  })

  it('handles compact mode prop and applies dense table styling', () => {
    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={rows}
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
        compact
      />,
    )

    const table = screen.getByRole('table')
    expect(table).toHaveClass('text-sm')
  })

  it('wraps content in a role="main" element', () => {
    render(
      <DataPage
        title="Test Table"
        columns={columns}
        data={rows}
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
      />,
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
