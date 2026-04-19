import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/',
}))

import PracticeSubscribePage from '@/app/get-started/practice/subscribe/page'

test('back from practice subscribe navigates to practice tiers', async () => {
  render(<PracticeSubscribePage />)
  const back = screen.getByRole('button', { name: /Back to Documentation/i })
  await userEvent.click(back)
  expect(pushMock).toHaveBeenCalledWith('/get-started/practice/tiers')
})
