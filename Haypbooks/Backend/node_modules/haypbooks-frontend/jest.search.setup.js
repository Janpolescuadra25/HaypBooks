// Lightweight setup for focused search UI tests.
// Keep environment lean: avoid undici polyfills to reduce memory.
require('@testing-library/jest-dom')
// Silence act warnings in this narrow run but do not throw to reduce stack traces noise
try {
  const { interceptActWarnings } = require('./src/test-utils/act-helpers')
  interceptActWarnings({ mode: 'warn' })
} catch {}
