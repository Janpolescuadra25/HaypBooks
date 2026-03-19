const { PrismaClient } = require('@prisma/client');
const suspectColumns = [
  'firmName','businessType','industry','startDate','fiscalStart','country','address','taxId','vatRegistered','vatRate','taxFilingFrequency','taxExempt','logoUrl','invoicePrefix','defaultPaymentTerms','accountingMethod','name'
];
(async function(){
  const prisma = new PrismaClient();
  try{
    const suspectColsList = ['firmName','businessType','industry','startDate','fiscalStart','country','address','taxId','vatRegistered','vatRate','taxFilingFrequency','taxExempt','logoUrl','invoicePrefix','defaultPaymentTerms','accountingMethod','name'];
    const sql = `SELECT w.id, ${suspectColsList.map(c => `w."${c}"`).join(', ')}, (SELECT COUNT(*) FROM "Company" c WHERE c."workspaceId"=w.id)::int as company_count, (SELECT json_agg(json_build_object('id', c.id, 'name', c.name)) FROM "Company" c WHERE c."workspaceId"=w.id) as companies FROM "Workspace" w WHERE ${suspectColsList.map(c => `w."${c}" IS NOT NULL`).join(' OR ')} ORDER BY w."createdAt"`;
    const report = await prisma.$queryRawUnsafe(sql);
    console.log('Workspace legacy values report:', JSON.stringify(report, null, 2));
  }catch(e){ console.error('Error:', e.message); } finally { await prisma.$disconnect(); }
})();