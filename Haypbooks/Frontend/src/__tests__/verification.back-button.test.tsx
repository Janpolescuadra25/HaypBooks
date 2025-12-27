import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VerificationPage from '@/app/verification/page'

jest.mock('@/services/auth.service', () => ({ authService: { getCurrentUser: jest.fn(() => Promise.resolve({ email: 'a@b.test', hasPin: false })), logout: jest.fn(() => Promise.resolve()) } }))

describe('VerificationPage - Back button behavior', () => {
  it('EmailCodeForm Back returns to options view', async () => {
    render(<VerificationPage />)

    // open email view
    const sendEmailBtn = await screen.findByRole('button', { name: /Send Code to Email/i })
    fireEvent.click(sendEmailBtn)

    // email view should be present
    await waitFor(() => expect(screen.getByText(/Enter verification code/i)).toBeInTheDocument())

    // click Back should return to options
    const back = screen.getByRole('button', { name: /Back/i })
    fireEvent.click(back)

    await waitFor(() => expect(screen.getByText(/Enter Your PIN/i)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Send Code to Email/i)).toBeInTheDocument())
  })

  it('PIN option removed - page shows Email Code option only', async () => {
    const auth = require('@/services/auth.service')
    auth.authService.getCurrentUser.mockResolvedValue({ email: 'a@b.test' })

    render(<VerificationPage />)

    // The options view should NOT render a PIN option any more; only email flow present
    await waitFor(() => expect(screen.getByText(/Send Code to Email/i)).toBeInTheDocument())
    expect(screen.queryByText(/Enter Your PIN/i)).toBeNull()
  })
})