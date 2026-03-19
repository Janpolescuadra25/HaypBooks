import { ExecutionContext, Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

/**
 * Custom throttler guard that uses the request email (when present) as part of the
 * key to avoid per-IP throttling when the same IP is used for many distinct users
 * (e.g. E2E tests running locally).
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  // Override default throttling tracker to use the user's email (when present)
  // rather than only IP, which avoids rate limiting flakiness in local E2E runs.
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const email = (req?.body?.email || req?.query?.email || req?.headers?.email)
    if (typeof email === 'string' && email.trim()) {
      return email.trim().toLowerCase()
    }

    return super.getTracker(req)
  }
}
