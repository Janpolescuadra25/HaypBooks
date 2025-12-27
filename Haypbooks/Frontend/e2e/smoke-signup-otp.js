(async () => {
  try {
    const email = `smoke-${Date.now()}@haypbooks.test`
    const body = { email, password: 'Abcd1234', name: 'Smoke' }

    console.log('Signing up user:', email)
    const signupRes = await fetch('http://127.0.0.1:4000/api/auth/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    if (!signupRes.ok) {
      console.error('Signup failed:', signupRes.status)
      process.exit(2)
    }
    const signupJson = await signupRes.json()
    console.log('Signup response user:', signupJson.user?.email)

    let otp = signupJson._devOtp || null
    if (!otp) {
      console.log('No _devOtp in signup; requesting send-verification')
      const sendRes = await fetch('http://127.0.0.1:4000/api/auth/send-verification', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
      if (!sendRes.ok) {
        console.error('send-verification failed:', sendRes.status)
        process.exit(3)
      }
      const sendJson = await sendRes.json()
      otp = sendJson?.otp || null
    }

    if (!otp) {
      console.error('No OTP available (dev flow)')
      process.exit(4)
    }

    console.log('Using OTP:', otp)
    const verifyRes = await fetch('http://127.0.0.1:4000/api/auth/verify-otp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, otpCode: String(otp) }) })
    if (!verifyRes.ok) {
      console.error('verify-otp failed:', verifyRes.status)
      process.exit(5)
    }
    const verifyJson = await verifyRes.json()
    console.log('verify-otp response:', verifyJson)
    if (!verifyJson.success) {
      console.error('OTP verification returned success=false')
      process.exit(6)
    }

    console.log('Smoke signup->OTP->verify succeeded ✅')
    process.exit(0)
  } catch (e) {
    console.error('Unexpected error:', e?.message || e)
    process.exit(99)
  }
})()
