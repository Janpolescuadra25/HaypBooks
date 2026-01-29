import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AccountantOnboarding from '../page'
import apiClient from '@/lib/api-client'
import { useRouter } from 'next/navigation'

jest.mock('@/lib/api-client')
const mockPost = apiClient.post as jest.Mock

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))

describe('AccountantOnboarding', () => {
  it('disables create and shows inline error when workspace name missing', () => {
    render(<AccountantOnboarding />)
    const btn = screen.getByRole('button', { name: /Create Accountant Workspace/i })
    expect(btn).toBeDisabled()
    const input = screen.getByPlaceholderText(/Maria Santos Accounting/i)
    fireEvent.blur(input)
    expect(screen.getByText(/Accountant Workspace name is required/i)).toBeInTheDocument()
    expect(screen.queryByText(/skip for now/i)).toBeNull()
  })

  it('posts to API and navigates on success', async () => {
    mockPost.mockResolvedValueOnce({ status: 200 })
    const mockPatch = apiClient.patch as jest.Mock
    mockPatch.mockResolvedValueOnce({ data: {} })

    const pushMock = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ push: pushMock })
    render(<AccountantOnboarding />)
    const input = screen.getByPlaceholderText(/your firm name/i)
    fireEvent.change(input, { target: { value: 'Rivera CPA' } })
    const btn = screen.getByRole('button', { name: /finish setup/i })
    fireEvent.click(btn)
    await waitFor(() => expect(mockPost).toHaveBeenCalled())
    expect(mockPatch).toHaveBeenCalledWith('/api/users/profile', { firmName: 'Rivera CPA' })
    expect(pushMock).toHaveBeenCalledWith('/hub/accountant')
  })
})