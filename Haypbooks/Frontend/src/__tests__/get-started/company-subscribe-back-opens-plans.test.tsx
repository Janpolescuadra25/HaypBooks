import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/',
}))

import SubscribePage from '@/app/get-started/subscribe/page'

test('back from company subscribe navigates to plan selection', async () => {
  render(<SubscribePage />)
  const back = screen.getByRole('button', { name: /Back to Plan Selection/i })
  await userEvent.click(back)
  expect(pushMock).toHaveBeenCalledWith('/get-started/plans')
})
