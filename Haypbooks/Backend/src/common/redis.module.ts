import { Module, Global } from '@nestjs/common'
import Redis from 'ioredis'

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS',
      useFactory: () => {
        const url = process.env.REDIS_URL
        if (!url) {
          // Do not attempt to connect to Redis when not configured — use in-memory fallback
          console.info('REDIS_URL not set — Redis disabled; falling back to in-memory pending store')
          return null
        }

        // Use lazy connect to avoid immediate retry storms; we'll explicitly connect and log failures
        const client = new Redis(url, { lazyConnect: true })
        client.on('error', (err) => console.error('Redis client error', err))
        client.connect().catch(err => console.error('Redis connection failed during startup', err))
        return client
      },
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}
