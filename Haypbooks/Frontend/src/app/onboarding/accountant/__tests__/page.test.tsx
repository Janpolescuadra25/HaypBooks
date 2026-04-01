import React from 'react'
import { render } from '@testing-library/react'
import AccountantOnboarding from '../page'

const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock }) }))

describe('AccountantOnboarding redirect', () => {
  it('redirects to practice onboarding', () => {
    render(<AccountantOnboarding />)
    expect(replaceMock).toHaveBeenCalledWith('/onboarding/practice')
  })
})
