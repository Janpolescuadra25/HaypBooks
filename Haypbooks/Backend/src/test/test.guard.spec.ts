import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { TestEndpointGuard } from './test.guard'

describe('TestEndpointGuard', () => {
  let guard: TestEndpointGuard
  const originalEnv = process.env

  beforeEach(() => {
    guard = new TestEndpointGuard()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  function createMockContext(headers: Record<string, any> = {}): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    } as unknown as ExecutionContext
  }

  it('allows access in test environment', () => {
    process.env.NODE_ENV = 'test'
    const context = createMockContext()
    expect(guard.canActivate(context)).toBe(true)
  })

  it('allows access in development when ALLOW_TEST_ENDPOINTS is true', () => {
    process.env.NODE_ENV = 'development'
    process.env.ALLOW_TEST_ENDPOINTS = 'true'
    const context = createMockContext()
    expect(guard.canActivate(context)).toBe(true)
  })

  it('rejects access in production without a token', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.ALLOW_TEST_ENDPOINTS_TOKEN
    const context = createMockContext()
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
  })

  it('rejects access when token is configured but request is missing the header', () => {
    process.env.NODE_ENV = 'production'
    process.env.ALLOW_TEST_ENDPOINTS_TOKEN = 'secret-token-123'
    const context = createMockContext({})
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
  })

  it('rejects access when token is configured but the supplied token does not match', () => {
    process.env.NODE_ENV = 'production'
    process.env.ALLOW_TEST_ENDPOINTS_TOKEN = 'secret-token-123'
    const context = createMockContext({ 'x-test-token': 'wrong-token' })
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
  })

  it('allows access when the request includes the matching x-test-token', () => {
    process.env.NODE_ENV = 'production'
    process.env.ALLOW_TEST_ENDPOINTS_TOKEN = 'secret-token-123'
    const context = createMockContext({ 'x-test-token': 'secret-token-123' })
    expect(guard.canActivate(context)).toBe(true)
  })
})
