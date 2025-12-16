import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RoleSelectionPage from '@/app/onboarding/role/page'

describe('Onboarding role selection', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('stores preferred role and navigates to signup with role param', () => {
    const nav = require('next/navigation')
    const pushMock = jest.fn()
    jest.spyOn(nav, 'useRouter').mockReturnValue({ push: pushMock })

    render(<RoleSelectionPage />)

    const accountantBtn = screen.getByRole('button', { name: /I am an accountant or bookkeeper/i })
    fireEvent.click(accountantBtn)

    expect(localStorage.getItem('preferred_role')).toBe('accountant')
    expect(pushMock).toHaveBeenCalledWith('/auth/signup?role=accountant')
  })
})
