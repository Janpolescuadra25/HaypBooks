const axios = require('axios')
;(async ()=>{
  try{
    const base = 'http://127.0.0.1:4000'
    const email = `local-signin-${Date.now()}@haypbooks.test`
    const phone = `+1555000${1000 + Math.floor(Math.random()*9000)}`
    const password = 'CheckPass1!'
    console.log('Using', { email, phone })

    const pre = await axios.post(base + '/api/auth/pre-signup', { email, password, name: 'Check', phone })
    console.log('pre-signup keys:', Object.keys(pre.data))
    const token = pre.data.signupToken
    let otpPhone = pre.data.otpPhone || null
    if(!otpPhone){
      const otpRes = await axios.get(base + '/api/test/otp/latest', { params: { phone, purpose: 'MFA' } })
      otpPhone = otpRes.data?.otpCode
    }
    console.log('otpPhone:', otpPhone)

    const complete = await axios.post(base + '/api/auth/complete-signup', { signupToken: token, code: String(otpPhone), method: 'phone' })
    console.log('complete token present:', !!complete.data.token)

    const chk = await axios.get(base + '/api/test/check-user-verification', { params: { email } })
    console.log('check-user-verif:', chk.data)

    try{
      const login = await axios.post(base + '/api/auth/login', { email, password })
      console.log('login OK, token len:', login.data.token?.length)
    }catch(e){
      console.error('Login failed:', e.response?.status, e.response?.data)
    }
  }catch(e){
    console.error('ERROR', e.response?.data || e.message || e)
    process.exit(1)
  }
})()
