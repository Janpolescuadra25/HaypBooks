import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

import SubscribePage from '@/app/get-started/subscribe/page'

test('back from company subscribe navigates to onboarding review with plans param', async () => {
  render(<SubscribePage />)
  const back = screen.getByRole('button', { name: /Back/i })
  await userEvent.click(back)
  expect(pushMock).toHaveBeenCalledWith('/onboarding?tab=review&plans=1')
})
