const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main(){
  try{
    const rows = await prisma.$queryRaw`
      SELECT table_schema, table_name, column_name, data_type
      FROM information_schema.columns
      WHERE column_name IN ('tenantId','workspaceId')
      ORDER BY table_name
    `
    console.table(rows)
  }catch(e){
    console.error(e)
  }finally{
    await prisma.$disconnect()
  }
}

main()
