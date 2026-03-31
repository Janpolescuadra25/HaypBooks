const { execSync } = require('child_process')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const { PendingSignupService } = require('../../dist/src/auth/pending-signup.service')

const BACKEND_DIR = path.resolve(__dirname, '..', '..')

async function run() {
  try {
    console.log('Running test DB setup...')
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env } })

    const prisma = new PrismaClient()
    await prisma.$connect()

    const svc = new PendingSignupService(prisma)

    const email = `presignup-tmp-${Date.now()}@haypbooks.test`
    console.log('Creating token for', email)
    const token = await svc.create({ email, hashedPassword: 'x', name: 'DB PreSignup' })
    console.log('Token created:', token)

    const row = await prisma.emailVerificationToken.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    console.log('Row found:', row ? 'yes' : 'no', row)

    const payload = await svc.get(token)
    console.log('Payload from svc.get:', payload)

    const updated = await svc.update(token, { name: 'Updated' })
    console.log('Updated:', updated)

    const ok = await svc.delete(token)
    console.log('Deleted:', ok)

    await prisma.$disconnect()
    process.exit(0)
  } catch (e) {
    console.error('Script failed:', e && e.message ? e.message : e)
    process.exit(1)
  }
}
run()
