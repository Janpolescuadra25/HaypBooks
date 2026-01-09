import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

const toastPush = jest.fn()
jest.mock('@/components/ToastProvider', () => ({ useToast: () => ({ push: toastPush }) }))

// Ensure non-mock API branch
process.env.NEXT_PUBLIC_USE_MOCK_API = 'false'

// Mock apiClient
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  }
}))

import OnboardingPage from '@/app/onboarding/page'
import apiClient from '@/lib/api-client'

beforeEach(() => {
  ;(apiClient.post as jest.Mock).mockReset()
  ;(apiClient.get as jest.Mock).mockReset()
  pushMock.mockClear()
  toastPush.mockClear()
})

test('uses created company from server response and shows toast + navigates to hub', async () => {
  const companyName = "ACME Test Co"
  // apiClient.post returns created company
  ;(apiClient.post as jest.Mock).mockResolvedValue({ status: 200, data: { company: { name: companyName } } })
  // apiClient.get for companies returns the created company
  ;(apiClient.get as jest.Mock).mockResolvedValue({ data: [{ id: 'cid', name: companyName, plan: 'Free' }] })

  render(<OnboardingPage />)

  // click Save and continue until Finish is visible
  for (let i = 0; i < 6; i++) {
    const btn = screen.getByRole('button', { name: /save and continue/i })
    // wrap in act to avoid state update warnings
    await act(async () => { await userEvent.click(btn) })
  }

  const finish = screen.getByRole('button', { name: /Finish onboarding/i })
  await act(async () => { await userEvent.click(finish) })

  // Wait for toast and navigation
  await waitFor(() => expect(toastPush).toHaveBeenCalledWith(expect.objectContaining({ type: 'success', message: expect.stringContaining(companyName) })))
  await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/hub/companies'))
})
