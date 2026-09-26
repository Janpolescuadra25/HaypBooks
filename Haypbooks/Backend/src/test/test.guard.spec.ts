import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { TestEndpointGuard } from './test.guard'

describe('TestEndpointGuard (Production Mode & Tenant Security)', () => {
  let guard: TestEndpointGuard
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    guard = new TestEndpointGuard()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  function createMockContext(headers: Record<string, string> = {}): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    } as unknown as ExecutionContext
  }

  describe('Non-production environments', () => {
    it('allows access when NODE_ENV is test', () => {
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

    it('throws ForbiddenException in development when ALLOW_TEST_ENDPOINTS is not true', () => {
      process.env.NODE_ENV = 'development'
      delete process.env.ALLOW_TEST_ENDPOINTS
      const context = createMockContext()

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
    })
  })

  describe('Production containment (fail-closed)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
      process.env.ALLOW_TEST_ENDPOINTS_TOKEN = 'secret-test-token-xyz'
    })

    it('throws ForbiddenException when no test token header is provided', () => {
      const context = createMockContext()

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
    })

    it('throws ForbiddenException when an invalid X-Test-Token is provided', () => {
      const context = createMockContext({ 'x-test-token': 'wrong-token' })

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
    })

    it('throws ForbiddenException when ALLOW_TEST_ENDPOINTS_TOKEN is not configured on the server', () => {
      delete process.env.ALLOW_TEST_ENDPOINTS_TOKEN
      const context = createMockContext({ 'x-test-token': 'secret-test-token-xyz' })

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
    })

    it('allows access when the request includes the matching X-Test-Token', () => {
      const context = createMockContext({ 'x-test-token': 'secret-test-token-xyz' })

      expect(guard.canActivate(context)).toBe(true)
    })

    it('allows access when the request includes a valid Bearer token', () => {
      const context = createMockContext({ authorization: 'Bearer secret-test-token-xyz' })

      expect(guard.canActivate(context)).toBe(true)
    })
  })
})
