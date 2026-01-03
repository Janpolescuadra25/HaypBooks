import axios from 'axios'

async function main(){
  const base = 'http://127.0.0.1:4000'
  const email = `local-check-${Date.now()}@haypbooks.test`
  const phone = `+1555000${String(1000 + Math.floor(Math.random()*9000))}`
  const password = 'CheckPass1!'

  console.log('Using', { email, phone })

  // Pre-signup
  const pre = await axios.post(base + '/api/auth/pre-signup', { email, password, name: 'Check', phone }).catch(e=>{ throw e.response?.data || e.message })
  console.log('pre-signup resp:', Object.keys(pre.data))
  const token = pre.data.signupToken
  let otpPhone = pre.data.otpPhone || null
  if(!otpPhone){
    // fetch latest
    const otpRes = await axios.get(base + '/api/test/otp/latest', { params: { phone, purpose: 'MFA' } })
    otpPhone = otpRes.data?.otpCode
  }
  console.log('otpPhone:', otpPhone)

  // complete signup using phone
  const complete = await axios.post(base + '/api/auth/complete-signup', { signupToken: token, code: String(otpPhone), method: 'phone' }).catch(e=>{ return e.response?.data || e.message })
  console.log('complete-signup:', complete.data ? { token: !!complete.data.token, user: !!complete.data.user } : complete)

  // check user verification
  const chk = await axios.get(base + '/api/test/check-user-verification', { params: { email } }).catch(e=>{ return e.response?.data || e.message })
  console.log('check-user-verif:', chk.data || chk)

  // try login
  const login = await axios.post(base + '/api/auth/login', { email, password }).catch(e=>{ return e.response?.data || e.message })
  console.log('login:', login.data || login)
}

main().catch(e=>{ console.error('ERROR', e); process.exit(1) })
