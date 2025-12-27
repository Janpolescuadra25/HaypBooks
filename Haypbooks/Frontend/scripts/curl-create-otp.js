(async () => {
  const res = await fetch('http://127.0.0.1:4000/api/test/create-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'foo@haypbooks.test', otp: '654321', purpose: 'VERIFY' })
  })
  console.log('status', res.status)
  console.log(await res.text())
})().catch(e => { console.error('ERR', e) })