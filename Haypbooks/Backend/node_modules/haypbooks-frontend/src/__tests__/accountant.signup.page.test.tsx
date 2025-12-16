import { render, screen, fireEvent } from '@testing-library/react'
import AccountantSignup from '@/app/accountant/signup/page'

jest.mock('@/services/auth.service', () => ({
  authService: {
    signup: jest.fn().mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, token: 't' }),
    sendVerification: jest.fn().mockResolvedValue({ otp: '123456' }),
  }
}))

describe('Accountant signup page', () => {
  it('renders and submits with role=accountant', async () => {
    render(<AccountantSignup />)
    expect(screen.getByText(/Hayp Accountant/i)).toBeTruthy()

    fireEvent.input(screen.getByPlaceholderText('First'), { target: { value: 'A' } })
    fireEvent.input(screen.getByPlaceholderText('Last'), { target: { value: 'B' } })
    fireEvent.input(screen.getByPlaceholderText('Your firm name'), { target: { value: 'Firm' } })
    fireEvent.input(screen.getByPlaceholderText('you@firm.com'), { target: { value: 'a@b.com' } })
    fireEvent.input(screen.getByPlaceholderText('Create a password'), { target: { value: 'Passw0rd' } })
    fireEvent.input(screen.getByPlaceholderText('Confirm'), { target: { value: 'Passw0rd' } })

    const btn = screen.getByRole('button', { name: /Sign up/i })
    fireEvent.click(btn)

    // Expect button to show signing up state (async)
    expect(await screen.findByText(/Signing up...|Sign up — Free/)).toBeTruthy()
  })
})