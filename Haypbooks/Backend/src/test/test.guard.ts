import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Request } from 'express'

@Injectable()
export class TestEndpointGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    return this.validateAccess(request)
  }

  validateAccess(request: Request): boolean {
    const nodeEnv = process.env.NODE_ENV
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
    const allowFlag = process.env.ALLOW_TEST_ENDPOINTS === 'true'
    const expectedToken = process.env.ALLOW_TEST_ENDPOINTS_TOKEN

    if (nodeEnv === 'test') {
      return true
    }

    if (allowFlag && (nodeEnv === 'development' || isCI)) {
      return true
    }

    if (expectedToken && expectedToken.trim().length > 0) {
      const rawTokenHeader = request.headers['x-test-token']
      const headerToken = Array.isArray(rawTokenHeader)
        ? rawTokenHeader[0]
        : rawTokenHeader

      const authHeader = request.headers.authorization
      const authValue = Array.isArray(authHeader) ? authHeader[0] : authHeader
      const bearerToken = typeof authValue === 'string' && authValue.toLowerCase().startsWith('bearer ')
        ? authValue.slice(7).trim()
        : undefined

      const incomingToken = headerToken ?? bearerToken
      if (incomingToken && incomingToken === expectedToken) {
        return true
      }

      throw new ForbiddenException(
        'Test endpoints disabled in this environment: Invalid or missing X-Test-Token',
      )
    }

    throw new ForbiddenException(
      'Test endpoints disabled: Enable only in development/CI or provide valid X-Test-Token',
    )
  }
}
