import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { waitFor } from '@testing-library/react'

const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: mockReplace }) }))

import RoleSelectionModal from '@/components/RoleSelectionModal'

describe('RoleSelectionModal', () => {
  beforeEach(() => {
    mockReplace.mockReset()
  })

  it('renders two role choices and navigates on select', async () => {
    const close = jest.fn()
    render(<RoleSelectionModal onClose={close} />)

    const business = screen.getByRole('button', { name: 'My Business' })
    const accountant = screen.getByRole('button', { name: 'Accountant' })

    await act(async () => { await userEvent.click(accountant) })
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/signup?role=accountant&showSignup=1'))
    // Confirm we saved the flag that suppresses the intro
    expect(localStorage.getItem('hasSeenIntro')).toBe('true')
  })
})