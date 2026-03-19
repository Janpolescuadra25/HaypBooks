const { PrismaClient } = require('@prisma/client');
const t = process.argv[2];
if(!t){console.error('Usage: node list_table_columns.js <TableName>'); process.exit(1)}
(async function(){
  const p = new PrismaClient();
  try{
    const rows = await p.$queryRawUnsafe('SELECT column_name FROM information_schema.columns WHERE table_schema=\'public\' AND table_name = $1 ORDER BY ordinal_position', t);
    console.log(t, 'columns:');
    rows.forEach(r=>console.log(' -', r.column_name));
  }catch(e){
    console.error('Error', e.message);
  }finally{ await p.$disconnect(); }
})();
