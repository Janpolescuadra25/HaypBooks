import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Tenant' 
    ORDER BY ordinal_position
  `
  
  console.log('Tenant table columns:')
  console.table(result)
  
  const companyResult = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Company' 
    ORDER BY ordinal_position
  `
  
  console.log('\nCompany table columns:')
  console.table(companyResult)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
