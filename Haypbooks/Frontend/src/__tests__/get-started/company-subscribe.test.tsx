import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import SubscribePage from '@/app/get-started/subscribe/page'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/',
}))

test('company subscribe: checkout page renders payment details for selected plan', async () => {
  pushMock.mockClear()
  render(<SubscribePage />)

  expect(screen.getByText(/Payment Details/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Confirm & Pay \$29\.00/i })).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/0000 0000 0000 0000/i)).toBeInTheDocument()
})

test('company subscribe: back button returns to plan selection', async () => {
  pushMock.mockClear()
  render(<SubscribePage />)

  const backBtn = screen.getByRole('button', { name: /Back to Plan Selection/i })
  act(() => { backBtn.click() })

  await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/get-started/plans'))
})
