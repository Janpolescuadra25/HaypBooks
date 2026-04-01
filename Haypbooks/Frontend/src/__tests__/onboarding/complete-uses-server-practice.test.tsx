import React from 'react'
import { render, screen, waitFor, act, within } from '@testing-library/react'
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

import PracticeOnboarding from '@/app/onboarding/practice/page'
import apiClient from '@/lib/api-client'

beforeEach(() => {
  ;(apiClient.post as jest.Mock).mockReset()
  ;(apiClient.get as jest.Mock).mockReset()
  pushMock.mockClear()
  toastPush.mockClear()
})

test('finish from practice profile shows plans modal and does not redirect immediately', async () => {
  const practiceName = 'Rivera CPA'
  ;(apiClient.post as jest.Mock).mockResolvedValue({ status: 200, data: { practice: { name: practiceName } } })

  render(<PracticeOnboarding />)

  // Fill required fields (step1)
  const nameInput = screen.getByPlaceholderText(/e.g. Rivera CPA/i)
  await act(async () => { await userEvent.type(nameInput, practiceName) })

  const typeBtn = screen.getByRole('button', { name: /Practice type/i })
  await act(async () => { await userEvent.click(typeBtn) })
  await act(async () => { await userEvent.click(screen.getByRole('option', { name: 'Sole Practitioner' })) })

  const industryBtn = screen.getByRole('button', { name: /Industry focus/i })
  await act(async () => { await userEvent.click(industryBtn) })
  await act(async () => { await userEvent.click(screen.getByRole('option', { name: 'General Practice' })) })

  const timezoneBtn = screen.getByRole('button', { name: /Time Zone/i })
  await act(async () => { await userEvent.click(timezoneBtn) })
  await act(async () => { await userEvent.click(screen.getByRole('option', { name: 'Asia/Manila' })) })

  // advance to operations
  const continue1 = screen.getByRole('button', { name: /Continue to operations/i })
  await act(async () => { await userEvent.click(continue1) })

  // you can optionally select country/currency but not required
  expect(screen.getByRole('button', { name: /Country/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Base Currency/i })).toBeInTheDocument()

  // move on without changing
  const continue2 = screen.getByRole('button', { name: /Continue to team/i })
  await act(async () => { await userEvent.click(continue2) })

  // now we're on final step, finish onboarding
  const finishButton = screen.getByRole('button', { name: /Finish Onboarding/i })
  expect(finishButton).toBeInTheDocument()
  await act(async () => { await userEvent.click(screen.getByTestId('finish-onboarding-button')) })

  // Wait for server completion and toast
  await waitFor(() => expect(apiClient.post).toHaveBeenCalled())
  await waitFor(() => expect(toastPush).toHaveBeenCalled())

  // The dialog should appear
  await waitFor(() => expect(screen.queryByTestId('plans-modal')).toBeInTheDocument(), { timeout: 1000 })
  const modal = screen.getByTestId('plans-modal')
  expect(within(modal).getByTestId('start-free-trial')).toBeInTheDocument()
  expect(within(modal).getByTestId('view-paid-plans')).toBeInTheDocument()

  // Ensure we did not navigate to dashboard immediately
  expect(pushMock).not.toHaveBeenCalled()

  // User can go back to the profile from the modal
  const backBtn = within(modal).getByTestId('plans-back-button')
  await act(async () => { await userEvent.click(backBtn) })
  await waitFor(() => expect(screen.queryByTestId('plans-modal')).toBeNull(), { timeout: 500 })
  expect(screen.getByRole('heading', { name: /Practice Profile/i })).toBeInTheDocument()
})
