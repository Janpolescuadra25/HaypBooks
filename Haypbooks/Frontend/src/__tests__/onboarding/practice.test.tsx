import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PracticeOnboarding from '@/app/onboarding/practice/page'
import PracticeProfile from '@/components/PracticeOnboarding/PracticeProfile'
import { act } from 'react-dom/test-utils'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

import apiClient from '@/lib/api-client'
jest.mock('@/lib/api-client', () => ({ __esModule: true, default: { post: jest.fn().mockResolvedValue({ ok: true }) } }))

test('renders practice onboarding initial step and completes flow on save', async () => {
  render(<PracticeOnboarding />)
  expect(screen.getByRole('heading', { name: /Let\'s get started/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /Practice Profile/i })).toBeInTheDocument()

  // fill step 1 fields
  const name = screen.getByPlaceholderText(/e.g. Rivera CPA/i)
  await act(async () => { await userEvent.type(name, 'Rivera CPA') })

  const typeBtn = screen.getByRole('button', { name: /Practice type/i })
  await act(async () => { await userEvent.click(typeBtn) })
  await act(async () => { await userEvent.click(screen.getByRole('option', { name: 'Sole Practitioner' })) })

  const industryBtn = screen.getByRole('button', { name: /Industry focus/i })
  await act(async () => { await userEvent.click(industryBtn) })
  await act(async () => { await userEvent.click(screen.getByRole('option', { name: 'Professional Services' })) })

  const timezoneBtn = screen.getByRole('button', { name: /Time Zone/i })
  await act(async () => { await userEvent.click(timezoneBtn) })
  await act(async () => { await userEvent.click(screen.getByRole('option', { name: 'Asia/Manila' })) })

  // proceed to operations (step 2)
  const continue1 = screen.getByRole('button', { name: /Continue to operations/i })
  await act(async () => { await userEvent.click(continue1) })

  // step 2 heading should show
  expect(screen.getByRole('heading', { name: /Operations/i })).toBeInTheDocument()
  // country & base currency fields should be present
  expect(screen.getByRole('button', { name: /Country/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Base Currency/i })).toBeInTheDocument()
  // address is toggled by button, not present initially
  const addAddrBtn = screen.getByRole('button', { name: /Practice Address/i })
  expect(addAddrBtn).toBeInTheDocument()
  expect(screen.queryByLabelText(/Address Line 1/i)).not.toBeInTheDocument()

  await act(async () => { await userEvent.click(addAddrBtn) })
  const addrLine1 = screen.getByLabelText(/Address Line 1/i)
  await act(async () => { await userEvent.type(addrLine1, '123 Test St') })
  const cityInput = screen.getByLabelText(/City \/ Municipality/i)
  await act(async () => { await userEvent.type(cityInput, 'Makati City') })

  // move to final step
  const continue2 = screen.getByRole('button', { name: /Continue to team/i })
  await act(async () => { await userEvent.click(continue2) })

  expect(screen.getByRole('heading', { name: /Team & Finalize/i })).toBeInTheDocument()

  // finish onboarding
  const finishBtn = screen.getByTestId('finish-onboarding-button')
  await act(async () => { await userEvent.click(finishBtn) })

  // final API call should include address and be step index 2
  await waitFor(() => expect((apiClient as any).post).toHaveBeenCalled())
  expect((apiClient as any).post).toHaveBeenLastCalledWith(
    '/api/onboarding/practice/step',
    expect.objectContaining({
      step: 2,
      data: expect.objectContaining({
        address: expect.objectContaining({ line1: expect.stringContaining('123 Test St') })
      })
    })
  )

  // Modal shown — no redirect yet
  await waitFor(() => expect(screen.getByTestId('plans-modal')).toBeInTheDocument())
  expect(pushMock).not.toHaveBeenCalled()

  const modal = screen.getByTestId('plans-modal')
  const planBtn = within(modal).getByTestId('view-paid-plans')
  await act(async () => { await userEvent.click(planBtn) })
  expect(pushMock).toHaveBeenCalledWith('/get-started/practice/subscribe')
})

test('shows address input when initial.address is provided', () => {
  const onSave = jest.fn().mockResolvedValue(undefined)
  render(<PracticeProfile initial={{ address: { line1: '123 Rizal Ave', city: 'Makati City', province: 'Metro Manila', zip: '1226', country: 'Philippines', line2: '' } }} onSave={onSave} onFinish={jest.fn()} />)
  // the toggle button is present and the address section should be visible on mount when initial has values
  expect(screen.getByRole('button', { name: /Practice Address/i })).toBeInTheDocument()
  const line1 = screen.getByLabelText(/Address Line 1/i)
  expect(line1).toBeInTheDocument()
  expect((line1 as HTMLInputElement).value).toBe('123 Rizal Ave')
})