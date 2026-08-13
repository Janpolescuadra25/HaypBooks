// load environment variables from .env before anything else
require('dotenv').config();

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { validateEnv } from './common/utils/env-validation.util'

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
  const envCheck = validateEnv()
  if (!envCheck.valid) {
    process.exit(1)
  }
  if (envCheck.warnings.length > 0) {
    console.warn('[env] Optional variables not set:')
    envCheck.warnings.forEach(w => console.warn(`  ⚠️  ${w}`))
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

  // Enable CORS — restrict to explicit origins and avoid wildcards in production
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000']
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-CSRF-Token'],
  })

  // Parse cookies so routes can read req.cookies (required for refresh/logout flows)
  try {
    // use require to avoid runtime failure in environments where cookie-parser isn't installed
    const cookieParser = require('cookie-parser')
    app.use(cookieParser())

    // ── CSRF Protection: Double-Submit Cookie Pattern ──────────────────────────
    // Generates a csrf_token cookie on first GET request. All mutation requests
    // (POST / PUT / PATCH / DELETE) must include an X-CSRF-Token header matching
    // the cookie value. Public auth endpoints are exempt (no session exists yet).
    const crypto = require('crypto')
    const CSRF_EXEMPT_PATHS = [
      '/api/auth/login',
      '/api/auth/pre-signup',
      '/api/auth/complete-signup',
      '/api/auth/verify-otp',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
    ]
    app.use((req, res, next) => {
      const method = req.method
      // Safe methods — set cookie if missing, then pass through
      if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        if (!req.cookies?.csrf_token) {
          const token = crypto.randomBytes(32).toString('hex')
          // Derive cookie domain from FRONTEND_URL for cross-subdomain CSRF
          const cookieDomain = process.env.FRONTEND_URL
            ? '.' + new URL(process.env.FRONTEND_URL).hostname
            : undefined
          res.cookie('csrf_token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 86400000, // 24 hours
            ...(cookieDomain ? { domain: cookieDomain } : {}),
          })
        }
        return next()
      }
      // Exempt paths — public auth endpoints (no session to protect yet)
      if (CSRF_EXEMPT_PATHS.some(p => req.path.startsWith(p))) {
        return next()
      }
      // Skip CSRF if request carries an Authorization header (JWT auth is immune to CSRF)
      if (req.headers['authorization']) {
        return next()
      }
      // Unsafe methods — validate CSRF token (double-submit: cookie === header)
      const cookieToken = req.cookies?.csrf_token
      const headerToken = req.headers['x-csrf-token']
      if (!cookieToken || !headerToken) {
        return res.status(403).json({ message: 'CSRF token missing', statusCode: 403 })
      }
      try {
        const a = Buffer.from(String(cookieToken))
        const b = Buffer.from(String(headerToken))
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
          return res.status(403).json({ message: 'CSRF token mismatch', statusCode: 403 })
        }
      } catch {
        return res.status(403).json({ message: 'CSRF token mismatch', statusCode: 403 })
      }
      next()
    })
  } catch (e) {
    // ignore in environments where cookie-parser isn't available
  }

  // Body size limits — prevent oversized payloads (DoS protection)
  const express = require('express')
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ limit: '10mb', extended: true }))

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.useGlobalFilters(new AllExceptionsFilter())

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
