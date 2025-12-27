import { render, screen, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(public)/login/page'

const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

describe('LoginPage - prefill email from query', () => {
  it('prefills the email input when email query param is present', async () => {
    const testEmail = 'prefill@haypbooks.test'
    // simulate query param in URL
    window.history.pushState({}, '', `/login?email=${encodeURIComponent(testEmail)}`)

    render(<LoginPage />)

    const input = await screen.findByLabelText(/Email address/i)

    await waitFor(() => expect(input).toHaveValue(testEmail))
  })
})