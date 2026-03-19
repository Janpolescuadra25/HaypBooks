import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import PracticeSubscribePage from '@/app/get-started/practice/subscribe/page'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

test('full practice checkout flow: choose plan → billing → review & confirm', async () => {
  render(<PracticeSubscribePage />)
  expect(screen.getByText(/Step 1: Choose Your Plan/i)).toBeInTheDocument()

  // Animated background should match sign-in background
  expect(screen.getByTestId('animated-background')).toBeInTheDocument()

  // Growth (popular) selected by default; select Starter to change
  expect(screen.getByText(/Most Popular/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Selected/i })).toBeInTheDocument()
  const starterSelect = screen.getAllByRole('button', { name: /Select/i })[0]
  act(() => { starterSelect.click() })
  expect(screen.getByRole('button', { name: /Selected/i })).toBeInTheDocument()

  // Continue to billing step
  const continueBtn = screen.getByRole('button', { name: /Continue/i })
  act(() => { continueBtn.click() })

  // Billing fields should be present (new company-style form with placeholders)
  expect(screen.getByPlaceholderText(/Card number/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/Name on card/i)).toBeInTheDocument()

  // Fill billing and continue to review
  const cardInput = screen.getByPlaceholderText(/Card number/i)
  await act(async () => { await userEvent.type(cardInput, '4242424242424242') })
  const continueBilling = screen.getByRole('button', { name: /Continue/i })
  act(() => { continueBilling.click() })

  // Review step should show plan and totals (query the heading to avoid matching the step indicator)
  expect(screen.getByRole('heading', { name: /Step 3: Review & Purchase/i })).toBeInTheDocument()
  expect(screen.getByText(/Total due today/i)).toBeInTheDocument()

  // Confirm purchase navigates to welcome/onboarding
  const confirm = screen.getByRole('button', { name: /Confirm purchase/i })
  act(() => { confirm.click() })
  await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/onboarding/welcome'))
})

test('back on choose-plan returns to onboarding practice profile', async () => {
  pushMock.mockClear()
  render(<PracticeSubscribePage />)
  // initial back button should route to onboarding practice (Practice Profile)
  const backBtn = screen.getByRole('button', { name: /^Back$/i })
  act(() => { backBtn.click() })
  await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/onboarding/practice'))
})