const fetch = global.fetch || (() => { throw new Error('global fetch not available') })
const backend = process.env.BACKEND || 'http://localhost:4000'
const email = `forgot2-${Date.now()}@haypbooks.test`
const password = 'Password1!'

async function run(){
  console.log('Create user via test endpoint:', email)
  let res = await fetch(`${backend}/api/test/create-user`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ email, password, name: 'Forgot Tester 2', isEmailVerified: true }) })
  const created = await res.json().catch(()=>null)
  console.log('create-user:', created)

  console.log('Call forgot-password')
  res = await fetch(`${backend}/api/auth/forgot-password`, { method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ email }) })
  const forgot = await res.json().catch(()=>null)
  console.log('forgot-password response:', forgot)
  const otp = forgot && forgot.otp
  if(!otp) return console.log('No OTP returned (unexpected in dev)')

  console.log('Verify OTP')
  res = await fetch(`${backend}/api/auth/verify-otp`, { method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ email, otpCode: otp }) })
  const verify = await res.json().catch(()=>null)
  console.log('verify-otp response:', verify)

  console.log('Resetting password using OTP')
  res = await fetch(`${backend}/api/auth/reset-password`, { method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ email, otpCode: otp, password: 'NewPass1!' }) })
  const reset = await res.json().catch(()=>null)
  console.log('reset-password response:', reset)
}

run().catch(e=>{ console.error(e); process.exit(1) })
