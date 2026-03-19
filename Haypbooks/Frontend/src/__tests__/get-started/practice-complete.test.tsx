import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import PracticeCompletePage from '@/app/get-started/practice/complete/page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Practice Complete Page', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    mockPush.mockClear()
  })

  it('renders success message with paid subscription confirmation', () => {
    render(<PracticeCompletePage />)

    expect(screen.getByText(/Your subscription is active!/i)).toBeInTheDocument()
    expect(screen.getByText(/Welcome to HaypBooks — full access to all features./i)).toBeInTheDocument()
    expect(screen.getByText(/Your card has been charged/i)).toBeInTheDocument()
  })

  it('displays ready to get started section', () => {
    render(<PracticeCompletePage />)

    expect(screen.getByText(/Ready to get started?/i)).toBeInTheDocument()
    expect(screen.getByText(/Your practice setup is complete\. Let’s manage your clients with clarity\./i)).toBeInTheDocument()
  })

  it('has Go to Dashboard button that routes to dashboard', () => {
    render(<PracticeCompletePage />)

    const setupButton = screen.getByRole('button', { name: /Go to Dashboard/i })
    expect(setupButton).toBeInTheDocument()

    setupButton.click()
    expect(mockPush).toHaveBeenCalledWith('/practice-hub')
  })

  it('displays support link', () => {
    render(<PracticeCompletePage />)

    const supportLink = screen.getByText(/chat with us/i)
    expect(supportLink).toBeInTheDocument()
    expect(supportLink.tagName).toBe('A')
  })
})
