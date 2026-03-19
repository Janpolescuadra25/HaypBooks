import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import PracticeTrialPage from '@/app/get-started/practice/trial/page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Practice Trial Page', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    mockPush.mockClear()
  })

  it('renders success message with free trial confirmation', () => {
    render(<PracticeTrialPage />)

    expect(screen.getByText(/Your 30-day free trial has started!/i)).toBeInTheDocument()
    expect(screen.getByText(/Welcome to HaypBooks — full access to all features./i)).toBeInTheDocument()
  })

  it('displays trial end date and no credit card required message', () => {
    render(<PracticeTrialPage />)

    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument()
    expect(screen.getByText(/Your trial ends on/i)).toBeInTheDocument()
    expect(screen.getByText(/Cancel or upgrade anytime/i)).toBeInTheDocument()
  })

  it('displays ready to get started section', () => {
    render(<PracticeTrialPage />)

    expect(screen.getByText(/Ready to get started?/i)).toBeInTheDocument()
    expect(screen.getByText(/Your practice setup is complete\. Let’s manage your clients with clarity\./i)).toBeInTheDocument()
  })

  it('has Go to Dashboard button that routes to dashboard', () => {
    render(<PracticeTrialPage />)

    const setupButton = screen.getByRole('button', { name: /Go to Dashboard/i })
    expect(setupButton).toBeInTheDocument()

    setupButton.click()
    expect(mockPush).toHaveBeenCalledWith('/practice-hub')
  })

  it('displays support link', () => {
    render(<PracticeTrialPage />)

    const supportLink = screen.getByText(/chat with us/i)
    expect(supportLink).toBeInTheDocument()
    expect(supportLink.tagName).toBe('A')
  })

  it('calculates and displays trial end date 30 days from now', () => {
    render(<PracticeTrialPage />)

    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 30)
    const formattedDate = trialEndDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })

    expect(screen.getByText(formattedDate)).toBeInTheDocument()
  })
})
