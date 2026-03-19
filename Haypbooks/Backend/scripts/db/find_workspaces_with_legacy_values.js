const { PrismaClient } = require('@prisma/client');
const suspects = [
  'businessType','industry','startDate','fiscalYearStart','address','country','taxId','vatRegistered','vatRate','taxFilingFrequency','taxExempt','logoUrl','defaultPaymentTerms','accountingMethod','name'
];
(async function(){
  const prisma = new PrismaClient();
  try{
    // Build a where clause safely using text concatenation for each field
    const conditions = suspects.map(s => `w."${s}" IS NOT NULL`).join(' OR ');
    const sql = `SELECT w.id, w.name, ${suspects.map(s => `w."${s}"`).join(', ')},
      (SELECT COUNT(*) FROM "Company" c WHERE c."workspaceId"=w.id)::int as company_count,
      (SELECT json_agg(json_build_object('id', c.id, 'name', c.name)) FROM "Company" c WHERE c."workspaceId"=w.id) as companies
      FROM "Workspace" w WHERE ${conditions} ORDER BY w.createdAt`;
    const rows = await prisma.$queryRawUnsafe(sql);
    console.log('Workspaces with legacy values:', rows);
  }catch(e){
    console.error('Error:', e.message);
  }finally{ await prisma.$disconnect(); }
})();