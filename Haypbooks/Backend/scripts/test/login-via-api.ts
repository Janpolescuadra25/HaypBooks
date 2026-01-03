import axios from 'axios'

async function main(){
  const email = process.argv[2]
  const password = process.argv[3]
  if(!email || !password){ console.error('Usage: npx ts-node scripts/test/login-via-api.ts <email> <password>'); process.exit(1) }

  try{
    const resp = await axios.post('http://localhost:4000/api/auth/login', { email, password }, { withCredentials: true })
    console.log('Status:', resp.status)
    console.log('Data:', resp.data)
    console.log('Headers:', resp.headers)
  }catch(e:any){
    if(e.response){
      console.error('Status:', e.response.status)
      console.error('Data:', e.response.data)
      console.error('Headers:', e.response.headers)
    } else {
      console.error(e.message)
    }
    process.exit(1)
  }
}

main().catch(e=>{ console.error(e); process.exit(1) })