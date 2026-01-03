import * as bcrypt from 'bcryptjs'

async function main(){
  const pwd = process.argv[2]
  if(!pwd){ console.error('Usage: npx ts-node scripts/test/hash-password.ts <password>'); process.exit(1) }
  const h = await bcrypt.hash(pwd, 10)
  console.log(h)
}

main().catch(e=>{ console.error(e); process.exit(1) })