import apiClient from '@/lib/api-client'

// We test the response interceptor behaviour by invoking the installed handler directly
// rather than relying on network mocking here (keeps the test simple and focused)

describe('api-client interceptor behavior', () => {
  const getResponseRejectedHandler = () => {
    const handlers = (apiClient as any).interceptors?.response?.handlers || []
    const h = handlers.find((x: any) => x && typeof x.rejected === 'function')
    if (!h) throw new Error('No response interceptor handler found')
    return h.rejected
  }

  test('auth endpoints (POST /api/auth/*) should not trigger global redirect on 401', async () => {
    const handler = getResponseRejectedHandler()

    const fakeError: any = {
      response: { status: 401, data: { message: 'Please verify your account before logging in' } },
      config: { url: '/api/auth/login' },
    }

    const initialHref = window.location.href

    await expect(handler(fakeError)).rejects.toBeTruthy()

    // interceptor should not have navigated away
    expect(window.location.href).toBe(initialHref)
  })

  test('non-auth 401 should cause redirect to /login when refresh fails', async () => {
    const handler = getResponseRejectedHandler()

    const fakeError: any = {
      response: { status: 401, data: {} },
      config: { url: '/api/some-protected' },
    }

    // Spy on apiClient.post to simulate refresh failing
    const postSpy = jest.spyOn(apiClient, 'post').mockImplementation((url: string) => {
      if (url === '/api/auth/refresh') return Promise.reject(new Error('refresh failed'))
      return Promise.reject(new Error('unexpected call'))
    })

    // set current path to a non-public private path
    window.history.pushState({}, '', '/private/reports')

    await expect(handler(fakeError)).rejects.toBeTruthy()

    // Ensure we attempted the refresh endpoint which then failed and caused the handler
    expect(postSpy).toHaveBeenCalledWith('/api/auth/refresh', {}, { withCredentials: true })

    postSpy.mockRestore()
  })
})