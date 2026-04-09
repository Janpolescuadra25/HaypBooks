// load environment variables from .env before anything else
require('dotenv').config();

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
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
  // Fail fast if required secrets are missing — prevents starting with an insecure config
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.')
    process.exit(1)
  }

  const app = await NestFactory.create(AppModule)
  const isProduction = process.env.NODE_ENV === 'production'

  // Log the database hostname only (not the full URL with credentials) in production
  if (!isProduction) {
    // eslint-disable-next-line no-console
    console.log('Using database URL:', process.env.DATABASE_URL)
  } else {
    try {
      const dbUrl = new URL(process.env.DATABASE_URL || '')
      // eslint-disable-next-line no-console
      console.log('Using database host:', dbUrl.hostname)
    } catch {
      // eslint-disable-next-line no-console
      console.log('Database URL configured (redacted)')
    }
  }

  // Security headers via Helmet (must be first middleware)
  try {
    const helmet = require('helmet')
    app.use(helmet({
      // Allow inline scripts/styles needed for Swagger UI in development
      contentSecurityPolicy: isProduction ? undefined : false,
    }))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('helmet not available, skipping security headers')
  }

  // Enable CORS — restrict to explicit frontend origin in production
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
    : (isProduction ? [] : true)
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  })

  // Add a lightweight request-id middleware (helps correlate e2e traces and server logs)
  try {
    const requestIdMiddleware = require('./common/request-id.middleware').default
    app.use(requestIdMiddleware)
  } catch (e) {
    // ignore if middleware can't be loaded; this is best-effort for diagnostics
  }

  // Add request logging middleware to trace all incoming requests
  const fs = require('fs')
  const path = require('path')
  const logPath = path.join(__dirname, '..', 'logs', 'http-requests.log')
  try { fs.mkdirSync(path.dirname(logPath), { recursive: true }) } catch (e) {}
  
  app.use((req: any, res: any, next: any) => {
    const start = Date.now()
    const logRequest = () => {
      const duration = Date.now() - start
      const hasAuth = !!req.headers.authorization || !!req.cookies?.token
      const logLine = `[${new Date().toISOString()}] [HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) [Auth: ${hasAuth ? '✓' : '✗'}]\n`
      console.log(logLine.trim())
      try { fs.appendFileSync(logPath, logLine) } catch (e) {}
    }
    res.on('finish', logRequest)
    res.on('close', logRequest)
    next()
  })

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

  // Swagger API documentation (development + staging only)
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Haypbooks API')
      .setDescription('Haypbooks accounting platform REST API — Philippine market edition')
      .setVersion('1.0')
      .addCookieAuth('token')
      .addTag('auth', 'Authentication & session management')
      .addTag('companies', 'Company management')
      .addTag('accounting', 'Chart of Accounts, Journal Entries, Periods')
      .addTag('ar', 'Accounts Receivable — Customers, Invoices, Payments')
      .addTag('ap', 'Accounts Payable — Vendors, Bills, Bill Payments')
      .addTag('banking', 'Bank Accounts, Reconciliation, Deposits')
      .addTag('reporting', 'P&L, Balance Sheet, Cash Flow, Dashboards')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
    // eslint-disable-next-line no-console
    console.log('📚 Swagger docs available at /api/docs')
  }

  const port = process.env.PORT || 4000
  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`🚀 Haypbooks Backend running on http://localhost:${port}`)
}

bootstrap()
