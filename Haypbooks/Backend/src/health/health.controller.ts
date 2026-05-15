import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const start = Date.now()
    let dbStatus = 'ok'
    let dbLatencyMs: number

    try {
      await this.prisma.$queryRaw`SELECT 1`
      dbLatencyMs = Date.now() - start
    } catch (e) {
      dbStatus = 'error'
      dbLatencyMs = -1
    }

    return {
      status: dbStatus === 'ok' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
    }
  }
}
