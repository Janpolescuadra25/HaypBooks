// Minimal e2e setup for Jest
// Sets a generous timeout for e2e tests and any global setup needed by tests
jest.setTimeout(120000)

// Optionally, enable more logging when running locally
// process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'debug'

// If native bcrypt isn't available on this platform, fall back to bcryptjs for tests.
try {
  require('bcrypt')
} catch (e) {
  try {
    const bcryptjs = require('bcryptjs')
    // Monkey-patch require so imports for 'bcrypt' return bcryptjs in tests
    const Module = require('module')
    const originalRequire = Module.prototype.require
    Module.prototype.require = function (path) {
      if (path === 'bcrypt') return bcryptjs
      return originalRequire.apply(this, arguments)
    }
  } catch (e2) {
    // nothing we can do — tests that require bcrypt may fail
  }
}
