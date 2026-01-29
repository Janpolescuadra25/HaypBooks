import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AccountantOnboarding from '../app/onboarding/accountant/page'
import apiClient from '@/lib/api-client'

jest.mock('@/lib/api-client')
const mockPost = apiClient.post as jest.Mock

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))

describe('AccountantOnboarding', () => {
  it('disables finish and shows inline error when firm name missing', () => {
    render(<AccountantOnboarding />)
    // The UI now uses an explicit 'Create Accountant Workspace' button aria-label
    const btn = screen.getByRole('button', { name: /Create Accountant Workspace/i })
    // Button should be disabled when no firm name
    expect(btn).toBeDisabled()
    const input = screen.getByPlaceholderText(/Maria Santos Accounting/i)
    // Blurring empty input should display validation
    fireEvent.blur(input)
    expect(screen.getByText(/Accountant Workspace name is required/i)).toBeInTheDocument()
    // Skip action should not be present
    expect(screen.queryByText(/skip for now/i)).toBeNull()
  })

  it('posts to API and navigates on success', async () => {
    mockPost.mockResolvedValue({ status: 200 })
    const pushMock = jest.fn()
    const rn = require('next/navigation')
    rn.useRouter = () => ({ push: pushMock })
    render(<AccountantOnboarding />)
    const input = screen.getByPlaceholderText(/Maria Santos Accounting/i)
    fireEvent.change(input, { target: { value: 'Rivera CPA' } })
    const btn = screen.getByRole('button', { name: /Create Accountant Workspace/i })
    fireEvent.click(btn)
    await waitFor(() => expect(mockPost).toHaveBeenCalled())
    expect(pushMock).toHaveBeenCalledWith('/hub/accountant')
  })
})