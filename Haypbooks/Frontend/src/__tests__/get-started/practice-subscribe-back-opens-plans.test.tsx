import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

import PracticeSubscribePage from '@/app/get-started/practice/subscribe/page'

test('back from practice subscribe navigates to onboarding practice with plans param', async () => {
  render(<PracticeSubscribePage />)
  const back = screen.getByRole('button', { name: /Back/i })
  await userEvent.click(back)
  expect(pushMock).toHaveBeenCalledWith('/onboarding/practice?plans=1')
})
