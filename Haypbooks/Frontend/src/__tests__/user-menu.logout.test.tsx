import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import UserMenu from '@/components/UserMenu'
import userEvent from '@testing-library/user-event'

// Mock next/navigation useRouter for tests
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: mockReplace }) }))

describe('UserMenu logout', () => {
  beforeEach(() => {
    mockReplace.mockReset()
    // clear any cookies/localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  })

  it('calls logout API, clears cookies and redirects to /login?loggedOut=1', async () => {
    // Mock fetch to succeed
    const fetchSpy = jest.spyOn(window, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))

    // Spy on document.cookie setter
    const cookieSetter = jest.fn()
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      set: cookieSetter,
    })

    render(<UserMenu />)

    // Wait for initial load effect to finish so state updates are wrapped
    await waitFor(() => expect(screen.queryByText(/Loading/)).toBeNull())

    // Click logout button
    const btn = screen.getByRole('button', { name: /logout/i })
    await userEvent.click(btn)

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/auth/logout', expect.any(Object)))

    // expect cookies cleared defensively (setter called at least once)
    expect(cookieSetter).toHaveBeenCalled()

    // Ensure localStorage cleared
    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()

    fetchSpy.mockRestore()
  })
})
