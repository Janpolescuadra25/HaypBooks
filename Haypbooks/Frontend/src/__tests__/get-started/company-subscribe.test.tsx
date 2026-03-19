import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import SubscribePage from '@/app/get-started/subscribe/page'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

test('company subscribe: back on choose-plan returns to onboarding review tab', async () => {
  pushMock.mockClear()
  render(<SubscribePage />)
  expect(screen.getByText(/Step 1: Choose Your Plan/i)).toBeInTheDocument()
  
  // Click the Back button on step 1
  const backBtn = screen.getByRole('button', { name: /^Back$/i })
  act(() => { backBtn.click() })
  
  // Should navigate to onboarding review
  await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/onboarding?tab=review'))
})

test('company subscribe: full flow navigates through steps', async () => {
  pushMock.mockClear()
  render(<SubscribePage />)
  
  // Step 1: Growth plan selected by default
  expect(screen.getByText(/Most Popular/i)).toBeInTheDocument()
  
  // Continue to billing
  const continueBtn = screen.getByRole('button', { name: /Continue/i })
  act(() => { continueBtn.click() })
  
  // Step 2: Billing details
  expect(screen.getByText(/Step 2: Billing Details/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/Card number/i)).toBeInTheDocument()
  
  // Continue to review
  const continueBilling = screen.getByRole('button', { name: /Continue/i })
  act(() => { continueBilling.click() })
  
  // Step 3: Review & Purchase
  expect(screen.getByText(/Step 3: Review & Purchase/i)).toBeInTheDocument()
  expect(screen.getByText(/Total due today/i)).toBeInTheDocument()
  
  // Confirm purchase navigates to welcome
  const confirm = screen.getByRole('button', { name: /Confirm purchase/i })
  act(() => { confirm.click() })
  await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/onboarding/welcome'))
})
