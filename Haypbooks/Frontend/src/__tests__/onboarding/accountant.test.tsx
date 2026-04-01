import { render } from '@testing-library/react'

const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock }) }))

import AccountantOnboarding from '../../app/onboarding/accountant/page'

test('redirects immediately to practice onboarding', () => {
  render(<AccountantOnboarding />)
  expect(replaceMock).toHaveBeenCalledWith('/onboarding/practice')
})
