const { PrismaClient } = require('@prisma/client')

async function main(){
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
      }
    }
  })

  try{
    const res = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='Company' AND column_name='legalName';")
    console.log('Result:', res)
  }catch(e){
    console.error('Error:', e)
  }finally{
    await prisma.$disconnect()
  }
}

main()
