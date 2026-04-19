'use client'

import React from 'react'
import { render, screen } from '../test-utils'
import EmptyStateEnhanced from '@/components/shared/EmptyStateEnhanced'

describe('EmptyStateEnhanced', () => {
  it('renders title text correctly', () => {
    render(<EmptyStateEnhanced title="No items" />)
    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyStateEnhanced title="No items" description="Try adding one" />)
    expect(screen.getByText('Try adding one')).toBeInTheDocument()
  })

  it('does not render description when omitted', () => {
    render(<EmptyStateEnhanced title="No items" />)
    expect(screen.queryByText('Try adding one')).not.toBeInTheDocument()
  })

  it('renders default illustration when illustration prop is set', () => {
    render(<EmptyStateEnhanced title="No items" illustration="inbox" />)
    expect(screen.getByTestId('illustration-inbox')).toBeInTheDocument()
  })

  it.each([['inbox'], ['search'], ['error'], ['documents'], ['users']])(
    'renders %s illustration type correctly', (type) => {
      render(<EmptyStateEnhanced title="Empty" illustration={type as any} />)
      expect(screen.getByTestId(`illustration-${type}`)).toBeInTheDocument()
    },
  )

  it('renders nothing in illustration slot when no illustration specified', () => {
    render(<EmptyStateEnhanced title="No items" />)
    expect(screen.queryByTestId(/illustration-/i)).not.toBeInTheDocument()
  })

  it('renders primary action button when primaryActionLabel provided', () => {
    render(<EmptyStateEnhanced title="Empty" primaryActionLabel="Create" />)
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('calls onPrimaryAction when primary button clicked', () => {
    const onPrimaryAction = jest.fn()
    render(<EmptyStateEnhanced title="Empty" primaryActionLabel="Create" onPrimaryAction={onPrimaryAction} />)
    screen.getByRole('button', { name: 'Create' }).click()
    expect(onPrimaryAction).toHaveBeenCalledTimes(1)
  })

  it('renders secondary action button when secondaryActionLabel provided', () => {
    render(<EmptyStateEnhanced title="Empty" secondaryActionLabel="Cancel" />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('calls onSecondaryAction when secondary button clicked', () => {
    const onSecondaryAction = jest.fn()
    render(<EmptyStateEnhanced title="Empty" secondaryActionLabel="Cancel" onSecondaryAction={onSecondaryAction} />)
    screen.getByRole('button', { name: 'Cancel' }).click()
    expect(onSecondaryAction).toHaveBeenCalledTimes(1)
  })

  it('renders no buttons when no actions provided', () => {
    render(<EmptyStateEnhanced title="No items" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has proper role="status" attribute', () => {
    const { container } = render(<EmptyStateEnhanced title="Empty" />)
    expect(container.firstChild).toHaveAttribute('role', 'status')
  })

  it('illustrations have aria-hidden="true"', () => {
    render(<EmptyStateEnhanced title="Empty" illustration="search" />)
    expect(screen.getByTestId('illustration-search')).toHaveAttribute('aria-hidden', 'true')
  })

  it('accepts and applies custom className', () => {
    const { container } = render(<EmptyStateEnhanced title="Empty" className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders customIllustration when provided', () => {
    render(
      <EmptyStateEnhanced
        title="Empty"
        customIllustration={<svg data-testid="custom-illustration" />}
        illustration="inbox"
      />,
    )
    expect(screen.getByTestId('custom-illustration')).toBeInTheDocument()
    expect(screen.queryByTestId('illustration-inbox')).not.toBeInTheDocument()
  })
})
