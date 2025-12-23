import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock next/navigation for useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

import GetStartedPlansPage from '@/app/get-started/plans/page'

describe('GetStartedPlansPage copy', () => {
  it('shows neutral company guidance for new or existing users', () => {
    render(<GetStartedPlansPage />)
    expect(screen.getByText("This will be the name of the new company you're adding to your HaypBooks account.")).toBeInTheDocument()
  })
})
