import { render, screen, fireEvent } from '@testing-library/react'
import AccountantLogin from '@/app/accountant/login/page'

jest.mock('@/services/auth.service', () => ({
  authService: {
    login: jest.fn().mockResolvedValue({ user: { id: 'u1', email: 'a@b.com', onboardingCompleted: true }, token: 't' })
  }
}))

describe('Accountant login page', () => {
  it('renders and submits login', async () => {
    render(<AccountantLogin />)
    expect(screen.getByText(/Hayp Accountant/i)).toBeTruthy()

    fireEvent.input(screen.getByPlaceholderText('you@firm.com'), { target: { value: 'a@b.com' } })
    fireEvent.input(screen.getByPlaceholderText('Password'), { target: { value: 'Passw0rd' } })

    const btn = screen.getByRole('button', { name: /Sign in/i })
    fireEvent.click(btn)

    expect(await screen.findByText(/Signing in...|Sign in/)).toBeTruthy()
  })
})