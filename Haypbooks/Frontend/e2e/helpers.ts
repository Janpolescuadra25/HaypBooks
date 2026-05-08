import type { APIRequestContext, BrowserContext } from '@playwright/test'

const BACKEND = 'http://127.0.0.1:4000'

export async function getTestToken(request: APIRequestContext, email = 'demo@haypbooks.test') {
  const res = await request.post(`${BACKEND}/api/test/create-token`, {
    data: { email },
  })

  if (res.status() === 401) {
    throw new Error('Test endpoints disabled; enable ALLOW_TEST_ENDPOINTS to use setupTestAuth')
  }
  if (res.status() === 404) {
    throw new Error(`Test user not found for email: ${email}`)
  }
  if (!res.ok()) {
    const body = await res.text()
    throw new Error(`Failed to get test token: ${res.status()} ${body}`)
  }

  const payload = await res.json()
  if (!payload?.token) {
    throw new Error('Token endpoint did not return a token')
  }

  return payload.token as string
}

export async function setupTestAuth(context: BrowserContext, request: APIRequestContext, email = 'demo@haypbooks.test') {
  const token = await getTestToken(request, email)

  await context.addCookies([
    {
      name: 'token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'onboardingComplete',
      value: 'true',
      domain: 'localhost',
      path: '/',
      secure: false,
      sameSite: 'Lax',
    },
  ])
}
