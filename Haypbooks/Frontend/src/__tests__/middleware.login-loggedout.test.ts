import { middleware } from '../../middleware'

function makeReq(path: string, hasToken = true) {
  const url = new URL('http://localhost' + path)
  return {
    nextUrl: url,
    url: url.toString(),
    cookies: {
      get: (name: string) => hasToken && name === 'token' ? { value: 'abc' } : undefined
    }
  } as any
}

describe('middleware login loggedOut handling', () => {
  it('allows /login?loggedOut=1 even when token cookie exists', () => {
    const req = makeReq('/login?loggedOut=1')
    const res: any = middleware(req)
    // When middleware does a redirect it sets a Location header. If it allowed the request,
    // the returned response should not have a location header
    expect(res?.headers?.get && res.headers.get('location')).toBeNull()
  })

  it('allows /login?showLogin=1 even when token cookie exists', () => {
    const req = makeReq('/login?showLogin=1')
    const res: any = middleware(req)
    expect(res?.headers?.get && res.headers.get('location')).toBeNull()
  })

  it('still redirects /login when token exists and loggedOut not present', () => {
    const req = makeReq('/login')
    const res: any = middleware(req)
    // With a token and request to /login, middleware redirects to /companies
    expect(res?.headers?.get && res.headers.get('location')).toContain('/companies')
  })
})
