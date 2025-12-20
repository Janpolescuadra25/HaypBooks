#!/usr/bin/env node
const http = require('http')
const https = require('https')
const url = process.argv[2] || 'http://127.0.0.1:4000/api/health'
const timeoutSec = parseInt(process.argv[3] || '30', 10)
const intervalMs = 1000
let elapsed = 0

function ping(u) {
  return new Promise((resolve) => {
    const lib = u.startsWith('https') ? https : http
    const req = lib.get(u, (res) => {
      resolve(res.statusCode === 200)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(2000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

;(async () => {
  while (elapsed < timeoutSec * 1000) {
    // eslint-disable-next-line no-console
    process.stdout.write('.')
    // eslint-disable-next-line no-await-in-loop
    const ok = await ping(url)
    if (ok) {
      // eslint-disable-next-line no-console
      console.log('\nBackend healthy')
      process.exit(0)
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, intervalMs))
    elapsed += intervalMs
  }
  // eslint-disable-next-line no-console
  console.log('\nTimed out waiting for backend')
  process.exit(1)
})()
