'use client'

import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import ModalForm from '@/components/shared/ModalForm'

describe('ModalForm', () => {
  it('renders nothing when isOpen is false', () => {
    render(<ModalForm isOpen={false} onClose={jest.fn()} title="Test modal">Content</ModalForm>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders title correctly when open', () => {
    render(<ModalForm isOpen onClose={jest.fn()} title="Test modal">Content</ModalForm>)
    expect(screen.getByRole('dialog', { name: 'Test modal' })).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(
      <ModalForm isOpen onClose={jest.fn()} title="Test modal" subtitle="More details">
        Content
      </ModalForm>,
    )
    expect(screen.getByText('More details')).toBeInTheDocument()
  })

  it('renders children in the body area', () => {
    render(
      <ModalForm isOpen onClose={jest.fn()} title="Test modal">
        <div data-testid="modal-body">Child content</div>
      </ModalForm>,
    )
    expect(screen.getByTestId('modal-body')).toBeInTheDocument()
  })

  it('calls onClose when cancel button clicked', () => {
    const onClose = jest.fn()
    render(<ModalForm isOpen onClose={onClose} title="Test modal">Content</ModalForm>)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button clicked', () => {
    const onClose = jest.fn()
    render(<ModalForm isOpen onClose={onClose} title="Test modal">Content</ModalForm>)
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit when submit button clicked', () => {
    const onSubmit = jest.fn()
    render(
      <ModalForm isOpen onClose={jest.fn()} title="Test modal" onSubmit={onSubmit}>
        Content
      </ModalForm>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('shows loading spinner when isSubmitting is true', () => {
    render(
      <ModalForm isOpen onClose={jest.fn()} title="Test modal" onSubmit={jest.fn()} isSubmitting>
        Content
      </ModalForm>,
    )
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('disables buttons during isSubmitting state', () => {
    render(
      <ModalForm isOpen onClose={jest.fn()} title="Test modal" onSubmit={jest.fn()} isSubmitting>
        Content
      </ModalForm>,
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
  })

  it('respects size prop and applies correct max-width class', () => {
    const { container } = render(
      <ModalForm isOpen onClose={jest.fn()} title="Test modal" size="xl">
        Content
      </ModalForm>,
    )
    expect(container.querySelector('[role="dialog"]')).toHaveClass('max-w-4xl')
  })

  it('closes on Escape key press when closeOnEscape is true', () => {
    const onClose = jest.fn()
    render(
      <ModalForm isOpen onClose={onClose} title="Test modal" onSubmit={jest.fn()}>
        Content
      </ModalForm>,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on Escape when closeOnEscape is false', () => {
    const onClose = jest.fn()
    render(
      <ModalForm isOpen onClose={onClose} title="Test modal" onSubmit={jest.fn()} closeOnEscape={false}>
        Content
      </ModalForm>,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on overlay click when closeOnOverlayClick is true', () => {
    const onClose = jest.fn()
    render(<ModalForm isOpen onClose={onClose} title="Test modal">Content</ModalForm>)
    fireEvent.click(screen.getByTestId('modal-overlay'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has role dialog and aria-modal true', () => {
    render(<ModalForm isOpen onClose={jest.fn()} title="Test modal">Content</ModalForm>)
    const dialog = screen.getByRole('dialog', { name: 'Test modal' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('hides footer when showFooter is false', () => {
    render(
      <ModalForm isOpen onClose={jest.fn()} title="Test modal" onSubmit={jest.fn()} showFooter={false}>
        Content
      </ModalForm>,
    )
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
  })

  it('hides submit button when onSubmit not provided', () => {
    render(<ModalForm isOpen onClose={jest.fn()} title="Test modal">Content</ModalForm>)
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const { container } = render(
      <ModalForm isOpen onClose={jest.fn()} title="Test modal" className="custom-modal">
        Content
      </ModalForm>,
    )
    expect(container.querySelector('[role="dialog"]')).toHaveClass('custom-modal')
  })

  it('backdrop uses fixed positioning, inset-0, and z-50', () => {
    render(<ModalForm isOpen onClose={jest.fn()} title="Test modal">Content</ModalForm>)
    const overlay = screen.getByTestId('modal-overlay')
    expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50')
  })
})
