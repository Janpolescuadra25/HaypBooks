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

  // Add a lightweight request-id middleware (helps correlate e2e traces and server logs)
  try {
    const requestIdMiddleware = require('./common/request-id.middleware').default
    app.use(requestIdMiddleware)
  } catch (e) {
    // ignore if middleware can't be loaded; this is best-effort for diagnostics
  }

  // Parse cookies so routes can read req.cookies (required for refresh/logout flows)
  try {
    // use require to avoid runtime failure in environments where cookie-parser isn't installed
    const cookieParser = require('cookie-parser')
    app.use(cookieParser())
  } catch (e) {
    // ignore in environments where cookie-parser isn't available
  }

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
