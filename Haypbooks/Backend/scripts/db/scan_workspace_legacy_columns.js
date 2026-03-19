const { PrismaClient } = require('@prisma/client');
const suspects = [
  'firmname', 'businessType', 'industry', 'startDate', 'fiscalYearStart', 'address', 'country', 'taxId',
  'vatRegistered', 'vatRate', 'taxFilingFrequency', 'taxExempt', 'logoUrl', 'defaultPaymentTerms', 'accountingMethod', 'name'
];
(async function(){
  const prisma = new PrismaClient();
  try{
    // Get actual columns in Workspace table
    const cols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name='Workspace' AND table_schema='public'`;
    const colNames = cols.map(r => r.column_name);
    console.log('Workspace columns found:', colNames.length);

    const found = suspects.filter(s => colNames.includes(s) || colNames.includes(s.replace(/[A-Z]/g, m => '_' + m.toLowerCase())));
    console.log('Suspect columns present in DB:', found);

    for(const s of found){
      // Count non-null occurrences
      const q = `SELECT COUNT(*)::int as cnt, COUNT(DISTINCT id)::int as workspace_rows FROM "Workspace" WHERE "${s}" IS NOT NULL`;
      const res = await prisma.$queryRawUnsafe(q);
      console.log(`Column '${s}' non-null rows:`, res[0].cnt);
      if(res[0].cnt > 0){
        // sample up to 10 rows with workspace id and value
        const samples = await prisma.$queryRawUnsafe(`SELECT id, "${s}" as val FROM "Workspace" WHERE "${s}" IS NOT NULL LIMIT 10`);
        console.log('Samples:', samples);
      }
    }

    // For any workspace with non-null suspect column, check company count under that workspace
    const workspacesWithData = await prisma.$queryRaw`
      SELECT w.id, w.name, count(c.id)::int as company_count
      FROM "Workspace" w
      LEFT JOIN "Company" c ON c."workspaceId" = w.id
      WHERE (
        ${suspects.map((s, i)=> `w."${s}" IS NOT NULL`).join(' OR ')}
      )
      GROUP BY w.id, w.name
      LIMIT 50`;
    console.log('Workspaces with suspect data (id, name, company_count):', workspacesWithData);

  }catch(e){
    console.error('Error scanning workspace columns:', e.message);
  }finally{ await prisma.$disconnect(); }
})();