/** @jest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

jest.mock('@/services/auth.service', () => ({ authService: { login: jest.fn() } }))
const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: jest.fn(), back: jest.fn(), refresh: jest.fn() }) }))

import LoginPage from '@/app/(public)/login/page'
import { authService } from '@/services/auth.service'

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.resetAllMocks()
  })

  test('stores user in localStorage after successful login and redirects', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com', onboardingCompleted: true } })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/name@company.com/i)
    const passInput = screen.getByLabelText(/password/i)
    const submit = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'a@b.com' } })
    fireEvent.change(passInput, { target: { value: 'Pass1!' } })
    fireEvent.click(submit)

    await waitFor(() => expect(authService.login).toHaveBeenCalled())
    expect(localStorage.getItem('user')).toBeTruthy()
    expect(replaceMock).toHaveBeenCalled()
  })
})
