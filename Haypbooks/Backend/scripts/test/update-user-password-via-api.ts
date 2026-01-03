import axios from 'axios'

async function main() {
  const email = process.argv[2]
  const hash = process.argv[3]
  if (!email || !hash) {
    console.error('Usage: npx ts-node scripts/test/update-user-password-via-api.ts <email> <hash>')
    process.exit(1)
  }

  const resp = await axios.post('http://localhost:4000/api/test/update-user', { email, data: { password: hash } })
  console.log('Response:', resp.data)
}

main().catch(e => { console.error(e.response?.data || e.message || e); process.exit(1) })