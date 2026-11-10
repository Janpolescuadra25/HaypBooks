#!/usr/bin/env node
const http = require('http')
const https = require('https')
const defaultUrls = [
  'http://127.0.0.1:4000/health',
  'http://127.0.0.1:4000/api/health',
]
const rawUrl = process.argv[2]
const fallbackUrls = new Set(rawUrl ? [rawUrl] : defaultUrls)
if (rawUrl) {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.pathname === '/health') {
      fallbackUrls.add(`${parsed.origin}/api/health`)
    } else if (parsed.pathname === '/api/health') {
      fallbackUrls.add(`${parsed.origin}/health`)
    }
  } catch (err) {
    // ignore malformed URLs; they will fail naturally below
  }
}
const urls = [...fallbackUrls]
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
    let ok = false
    let healthyUrl = null
    for (const u of urls) {
      // eslint-disable-next-line no-await-in-loop
      ok = await ping(u)
      if (ok) {
        healthyUrl = u
        break
      }
    }
    if (ok) {
      // eslint-disable-next-line no-console
      console.log(`\nBackend healthy (${healthyUrl})`)
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
