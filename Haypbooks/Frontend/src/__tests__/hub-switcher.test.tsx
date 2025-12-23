import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import HubSwitcher from '@/components/HubSwitcher'

jest.mock('@/lib/profile-cache', () => ({ getProfileCached: jest.fn(() => Promise.resolve({ preferredHub: 'OWNER', isAccountant: true })) }))

describe('HubSwitcher', () => {
  test('renders and shows current hub', async () => {
    render(<HubSwitcher />)
    await waitFor(() => expect(screen.getByRole('button', { name: /switch hub/i })).toBeInTheDocument())
    expect(screen.getByText(/Owner Hub/i)).toBeInTheDocument()
  })
})
