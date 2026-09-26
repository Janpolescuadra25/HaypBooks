import { execSync } from 'child_process'
import path from 'path'

export default async function globalSetup() {
  const cwd = path.resolve(__dirname, '..')
  console.log('[Jest globalSetup] Preparing test environment...')
  try {
    execSync('node ./scripts/test/setup-test-db.js', { cwd, stdio: 'inherit' })
  } catch (err) {
    console.warn('[Jest globalSetup] Setup completed with warning:', err.message)
  }
}