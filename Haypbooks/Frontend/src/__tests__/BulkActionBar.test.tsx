'use client'

import React from 'react'
import { render, screen } from '@/test-utils'
import BulkActionBar, { type BulkAction } from '@/components/shared/BulkActionBar'

describe('BulkActionBar', () => {
  it('renders nothing when selectedCount is 0', () => {
    render(<BulkActionBar selectedCount={0} actions={[]} onClearSelection={() => {}} />)
    expect(screen.queryByRole('toolbar', { name: 'Bulk actions' })).not.toBeInTheDocument()
  })

  it('shows correct selected count when count > 0', () => {
    render(<BulkActionBar selectedCount={3} actions={[]} onClearSelection={() => {}} />)
    expect(screen.getByText('3 items selected')).toBeInTheDocument()
  })

  it('shows singular form when count is 1', () => {
    render(<BulkActionBar selectedCount={1} actions={[]} onClearSelection={() => {}} />)
    expect(screen.getByText('1 item selected')).toBeInTheDocument()
  })

  it('calls onClearSelection when × button clicked', () => {
    const onClear = jest.fn()
    render(<BulkActionBar selectedCount={2} actions={[]} onClearSelection={onClear} />)
    screen.getByRole('button', { name: 'Clear selection' }).click()
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('does not render × button when onClearSelection not provided', () => {
    render(<BulkActionBar selectedCount={2} actions={[]} />)
    expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument()
  })

  it('renders all provided action buttons with correct labels', () => {
    const actions: BulkAction[] = [
      { label: 'Export', onClick: () => {} },
      { label: 'Delete', onClick: () => {} },
    ]
    render(<BulkActionBar selectedCount={2} actions={actions} onClearSelection={() => {}} />)
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('calls correct onClick handler for each action button', () => {
    const exportAction = jest.fn()
    const deleteAction = jest.fn()
    const actions: BulkAction[] = [
      { label: 'Export', onClick: exportAction },
      { label: 'Delete', onClick: deleteAction },
    ]
    render(<BulkActionBar selectedCount={2} actions={actions} onClearSelection={() => {}} />)
    screen.getByRole('button', { name: 'Export' }).click()
    screen.getByRole('button', { name: 'Delete' }).click()
    expect(exportAction).toHaveBeenCalledTimes(1)
    expect(deleteAction).toHaveBeenCalledTimes(1)
  })

  it('applies destructive styling to destructive variant actions', () => {
    const actions: BulkAction[] = [
      { label: 'Delete', onClick: () => {}, variant: 'destructive' },
    ]
    render(<BulkActionBar selectedCount={1} actions={actions} onClearSelection={() => {}} />)
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('text-red-600')
  })

  it('shows icon alongside action label when icon prop provided', () => {
    const actions: BulkAction[] = [
      { label: 'Export', onClick: () => {}, icon: <span data-testid="action-icon">I</span> },
    ]
    render(<BulkActionBar selectedCount={2} actions={actions} onClearSelection={() => {}} />)
    expect(screen.getByTestId('action-icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export$/ })).toBeInTheDocument()
  })

  it('has proper role="toolbar" ARIA attribute', () => {
    render(<BulkActionBar selectedCount={2} actions={[]} onClearSelection={() => {}} />)
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toBeInTheDocument()
  })

  it('handles empty actions array gracefully', () => {
    render(<BulkActionBar selectedCount={2} actions={[]} onClearSelection={() => {}} />)
    expect(screen.getByText('2 items selected')).toBeInTheDocument()
  })

  it('respects visible={false} prop even when count > 0', () => {
    render(<BulkActionBar selectedCount={2} actions={[]} onClearSelection={() => {}} visible={false} />)
    expect(screen.queryByRole('toolbar', { name: 'Bulk actions' })).not.toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const { container } = render(
      <BulkActionBar selectedCount={2} actions={[]} onClearSelection={() => {}} className="custom-bar" />,
    )
    expect(container.firstChild).toHaveClass('custom-bar')
  })

  it('disables individual actions when disabled=true', () => {
    const actions: BulkAction[] = [
      { label: 'Delete', onClick: () => {}, disabled: true },
    ]
    render(<BulkActionBar selectedCount={1} actions={actions} onClearSelection={() => {}} />)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })
})
