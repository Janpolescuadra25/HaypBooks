import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

// Global handlers to surface crashes in logs quickly
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('UNCAUGHT EXCEPTION:', err && err.stack ? err.stack : err)
  process.exit(1)
})
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('UNHANDLED REJECTION:', reason)
})
// Additional shutdown hooks for diagnostics
process.on('exit', (code) => {
  // eslint-disable-next-line no-console
  console.error('PROCESS EXIT EVENT, code=', code)
})
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.error('Received SIGTERM, exiting')
  process.exit(0)
})
process.on('SIGINT', () => {
  // eslint-disable-next-line no-console
  console.error('Received SIGINT, exiting')
  process.exit(0)
})

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS for frontend
  app.enableCors({
    origin: true, // In production: specify frontend URL
    credentials: true,
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`🚀 Haypbooks Backend running on http://localhost:${port}`)
}

bootstrap()
