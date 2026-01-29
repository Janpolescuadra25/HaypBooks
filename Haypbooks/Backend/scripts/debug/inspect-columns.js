const { PrismaClient } = require('@prisma/client');
;(async()=>{
  const p=new PrismaClient()
  const rows = await p.$queryRawUnsafe("SELECT table_name,column_name,data_type FROM information_schema.columns WHERE table_name IN ('Company','Tenant') ORDER BY table_name, column_name")
  console.log(rows)
  await p.$disconnect()
})().catch(e=>{console.error(e);process.exit(1)})