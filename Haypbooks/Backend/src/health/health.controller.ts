import { Controller, Get, Inject, Optional } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'

/** Health check controller — compatible with Kubernetes liveness & readiness probes. */
@SkipThrottle()
@Controller()
export class HealthController {
  constructor(
    @Optional() @Inject('PRISMA_SERVICE') private readonly prisma?: any,
  ) {}

  /** Liveness probe — responds as long as the process is running. */
  @Get('api/health/live')
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }

  /** Readiness probe — verifies the database connection before accepting traffic. */
  @Get('api/health/ready')
  async ready() {
    const checks: Record<string, string> = { process: 'ok' }
    let healthy = true

    // Database connectivity check
    if (this.prisma) {
      try {
        await this.prisma.$queryRaw`SELECT 1`
        checks.database = 'ok'
      } catch (err) {
        checks.database = 'error'
        healthy = false
      }
    }

    return {
      status: healthy ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    }
  }

  /** Legacy health endpoint — kept for backward compatibility. */
  @Get('api/health')
  health() {
    return { ok: true }
  }
}
