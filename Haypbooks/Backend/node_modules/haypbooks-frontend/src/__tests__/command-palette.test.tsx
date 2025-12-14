import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import CommandPalette from '@/components/CommandPalette'
import { useCommandPalette } from '@/stores/commandPalette'
import React from 'react'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

describe('CommandPalette', () => {
  it('renders and filters commands', () => {
    const StoreWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>
    const { openPalette, setItems } = useCommandPalette.getState() as any
    // Seed minimal items
    setItems([
      { id: 'a', label: 'Go to Dashboard', group: 'Navigation', action: jest.fn() },
      { id: 'b', label: 'View Invoices', group: 'Navigation', action: jest.fn() },
      { id: 'c', label: 'New Invoice', group: 'Create', action: jest.fn() },
    ])
    openPalette()
    render(<CommandPalette />)
    const input = screen.getByPlaceholderText(/Type a command/i)
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'invoice' } })
    expect(screen.queryByText('Go to Dashboard')).not.toBeInTheDocument()
    expect(screen.getByText('View Invoices')).toBeInTheDocument()
    expect(screen.getByText('New Invoice')).toBeInTheDocument()
  })
})
