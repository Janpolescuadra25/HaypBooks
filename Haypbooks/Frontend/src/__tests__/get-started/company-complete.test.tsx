import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import CompanyCompletePage from '@/app/get-started/complete/page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Company Complete Page', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    mockPush.mockClear()
  })

  it('renders success message with paid subscription confirmation', () => {
    render(<CompanyCompletePage />)

    expect(screen.getByText(/Your subscription is active!/i)).toBeInTheDocument()
    expect(screen.getByText(/Welcome to HaypBooks — full access to all features./i)).toBeInTheDocument()
    expect(screen.getByText(/Your card has been charged/i)).toBeInTheDocument()
  })

  it('displays ready to get started section', () => {
    render(<CompanyCompletePage />)

    expect(screen.getByText(/Ready to get started?/i)).toBeInTheDocument()
    expect(screen.getByText(/Your company setup is complete\. Let’s manage your books with clarity\./i)).toBeInTheDocument()
  })

  it('has Go to Dashboard button that routes to dashboard', () => {
    render(<CompanyCompletePage />)

    const setupButton = screen.getByRole('button', { name: /Go to Dashboard/i })
    expect(setupButton).toBeInTheDocument()

    setupButton.click()
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('displays support link', () => {
    render(<CompanyCompletePage />)

    const supportLink = screen.getByText(/chat with us/i)
    expect(supportLink).toBeInTheDocument()
    expect(supportLink.tagName).toBe('A')
  })
})
