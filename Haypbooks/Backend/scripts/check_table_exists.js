const { PrismaClient } = require('@prisma/client');
const name = process.argv[2];
if (!name) { console.error('Usage: node check_table_exists.js <TableName>'); process.exit(1) }
(async function(){
  const prisma = new PrismaClient();
  try{
    const res = await prisma.$queryRawUnsafe(`SELECT to_regclass('public."${name}"')::text as r`);
    console.log(res);
  }catch(e){
    console.error('Error', e.message);
  }finally{
    await prisma.$disconnect();
  }
})();
