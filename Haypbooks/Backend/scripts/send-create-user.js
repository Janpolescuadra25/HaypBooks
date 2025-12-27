const http = require('http')

async function main() {
  const data = JSON.stringify({
    email: `e2e-node-${Date.now()}@haypbooks.test`,
    password: 'DemoPass!23',
    name: 'Node Create Test',
    phone: '+15550001234'
  })

  const opts = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/test/create-user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  }

  const req = http.request(opts, (res) => {
    console.log('STATUS', res.statusCode)
    let body = ''
    res.on('data', (chunk) => (body += chunk))
    res.on('end', () => {
      console.log('BODY', body)
      process.exit(0)
    })
  })

  req.on('error', (e) => {
    console.error('ERROR', e)
    process.exit(2)
  })

  req.write(data)
  req.end()
}

main()
