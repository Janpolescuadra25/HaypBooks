import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OwnerTopBar from '@/components/owner/OwnerTopBar'
import * as authService from '@/services/auth.service'
import { useCompany } from '@/hooks/use-company'
import { useRouter } from 'next/navigation'

jest.mock('@/hooks/use-company')
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }))

describe('OwnerTopBar', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(useCompany as jest.Mock).mockReturnValue({ company: { id: 'c1', name: 'Acme Inc' }, loading: false })
    ;(useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), replace: jest.fn() })
    // localStorage stub for stored user
    (authService as any).getStoredUser = jest.fn().mockReturnValue({ name: 'Demo User' } as any)
    (authService as any).getCurrentUser = jest.fn().mockResolvedValue({ name: 'Demo User' } as any)
  })

  it('shows the current company name', () => {
    render(<OwnerTopBar />)
    expect(screen.getByText('Acme Inc')).toBeInTheDocument()
  })

  it('opens a user menu with sign out and switch hub', async () => {
    render(<OwnerTopBar />)
    // user button has accessible name including "User" plus role (e.g. "User Admin U")
    const userButton = screen.getByRole('button', { name: /User\s+Admin/ })
    fireEvent.click(userButton)
    await waitFor(() => {
      expect(screen.getByText('Switch hub')).toBeInTheDocument()
      expect(screen.getByText('Sign out')).toBeInTheDocument()
    })
    // clicking switch hub should call router.push
    const { push } = useRouter() as any
    fireEvent.click(screen.getByText('Switch hub'))
    expect(push).toHaveBeenCalledWith('/workspace')
  })
})
