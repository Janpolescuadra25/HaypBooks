import apiClient from '@/lib/api-client'
import { authService } from '@/services/auth.service'

describe('authService.signup', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.resetAllMocks()
    jest.spyOn(apiClient, 'post').mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com', onboardingCompleted: false } } } as any)
  })

  test('does not persist user to localStorage', async () => {
    const resp = await authService.signup({ email: 'a@b.com', password: 'Pass1!', companyName: 'X', firstName: 'F', lastName: 'L' } as any)
    expect(resp.user?.email).toBe('a@b.com')
    expect(localStorage.getItem('user')).toBeNull()
  })
})
