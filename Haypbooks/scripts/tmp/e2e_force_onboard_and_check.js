const { execSync } = require('child_process')
// Use global fetch (Node >=18) — avoids requiring node-fetch dependency
const fetch = global.fetch || (() => { throw new Error('global fetch not available') })

const backend = process.env.BACKEND || 'http://localhost:4000'
const email = `e2e-check-${Date.now()}@haypbooks.test`
const password = 'Password123!'

async function run() {
  console.log('Using backend:', backend)
  console.log('Create user:', email)
  let res = await fetch(`${backend}/api/test/create-user`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, isEmailVerified: true, name: 'E2E Checker' }) })
  const create = await res.json().catch(() => null)
  console.log('create-user res:', create)

  console.log('Force run onboarding (should create tenant + company)')
  res = await fetch(`${backend}/api/test/force-run-onboarding`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, companyName: 'E2E Auto Company', mode: 'full' }) })
  const runOnboard = await res.json().catch(() => null)
  console.log('force-run-onboarding res:', runOnboard)

  console.log('Get companies via test endpoint')
  res = await fetch(`${backend}/api/test/companies?email=${encodeURIComponent(email)}`)
  const companies = await res.json().catch(() => null)
  console.log('companies endpoint res:', companies)

  console.log('\nNow running direct DB queries via prisma raw')
  try {
    const out = execSync(`node ./scripts/tmp/query_recent_companies.js ${email}`, { encoding: 'utf8' })
    console.log(out)
  } catch (e) {
    console.error('Error running DB query script:', e.message)
  }
}

run().catch(e => { console.error(e); process.exit(1) })
