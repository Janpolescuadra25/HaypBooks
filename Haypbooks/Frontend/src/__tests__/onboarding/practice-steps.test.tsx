import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import PracticeOnboarding from '@/app/onboarding/practice/page'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

jest.mock('@/lib/api-client', () => ({ __esModule: true, default: { post: jest.fn().mockResolvedValue({ ok: true }) } }))
import apiClient from '@/lib/api-client'
const postMock = (apiClient as any).post as jest.Mock

test('saves step data and completes onboarding', async () => {
  render(<PracticeOnboarding />)
  // Step 1 is Practice Profile
  const name = screen.getByPlaceholderText(/e.g. Rivera CPA/i)
  await act(async () => { await userEvent.type(name, 'Rivera CPA') })

  // select required fields
  const typeBtn = screen.getByRole('button', { name: /Practice type/i })
  await act(async () => { await userEvent.click(typeBtn) })
  await act(async () => { await userEvent.click(screen.getByRole('option', { name: 'Sole Practitioner' })) })

  const industryBtn = screen.getByRole('button', { name: /Industry focus/i })
  await act(async () => { await userEvent.click(industryBtn) })
  await act(async () => { await userEvent.click(screen.getByRole('option', { name: 'General Practice' })) })

  const timezoneBtn = screen.getByRole('button', { name: /Time Zone/i })
  await act(async () => { await userEvent.click(timezoneBtn) })
  await act(async () => { await userEvent.click(screen.getByRole('option', { name: 'Asia/Manila' })) })

  // move to step 2
  const next1 = screen.getByRole('button', { name: /Continue to operations/i })
  await act(async () => { await userEvent.click(next1) })

  // move to step 3 without doing anything else
  const next2 = screen.getByRole('button', { name: /Continue to team/i })
  await act(async () => { await userEvent.click(next2) })

  // finish
  const finishBtn = screen.getByTestId('finish-onboarding-button')
  await act(async () => { await userEvent.click(finishBtn) })

  // POST should have been called at least once
  await waitFor(() => expect(postMock).toHaveBeenCalled())
  // Modal is shown so we do not expect an immediate redirect to dashboard
  expect(pushMock).not.toHaveBeenCalled()
})
