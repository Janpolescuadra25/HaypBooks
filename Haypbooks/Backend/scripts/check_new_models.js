const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main(){
  console.log('Counts:')
  try{
    const subledgerCount = await prisma.subledgerReconciliation.count().catch(()=>null)
    const estimateCount = await prisma.estimate.count().catch(()=>null)
    console.log('SubledgerReconciliation:', subledgerCount)
    console.log('Estimate:', estimateCount)
  }catch(e){
    console.error('Error:', e.message)
    process.exit(1)
  }finally{
    await prisma.$disconnect()
  }
}

main()