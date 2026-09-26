import { execSync } from 'child_process'
import path from 'path'

export default async function globalTeardown() {
  const cwd = path.resolve(__dirname, '..')
  console.log('[Jest globalTeardown] Cleaning up test environment...')
  try {
    execSync('node ./scripts/test/teardown-test-db.js', { cwd, stdio: 'inherit' })
  } catch (err) {
    console.warn('[Jest globalTeardown] Teardown warning:', err instanceof Error ? err.message : String(err))
  }
}
