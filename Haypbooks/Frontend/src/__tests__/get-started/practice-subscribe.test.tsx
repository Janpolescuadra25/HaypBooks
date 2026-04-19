import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import PracticeSubscribePage from '@/app/get-started/practice/subscribe/page'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/',
}))

test('practice subscribe: checkout page renders payment details', async () => {
  render(<PracticeSubscribePage />)
  expect(screen.getByText(/Payment Details/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Confirm & Pay \$499\.00/i })).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/0000 0000 0000 0000/i)).toBeInTheDocument()
})

test('practice subscribe: back button returns to practice tiers', async () => {
  pushMock.mockClear()
  render(<PracticeSubscribePage />)
  const backBtn = screen.getByRole('button', { name: /Back to Documentation/i })
  act(() => { backBtn.click() })
  await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/get-started/practice/tiers'))
})
