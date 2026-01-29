const { PrismaClient } = require('@prisma/client');
(async function main(){
  const prisma = new PrismaClient();
  const email = process.argv[2];
  if (!email) { console.error('Usage: node test-companies-query.js <email>'); process.exit(1) }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { console.log('User not found'); process.exit(0) }
  const tenantUsers = await prisma.workspaceUser.findMany({ where: { userId: user.id }, select: { workspaceId: true } });
  const tenantIds = tenantUsers.map(t => t.tenantId);
  console.log('tenantIds:', tenantIds);
  for (const tid of tenantIds) {
    const typeSql = `SELECT c."tenantId" AS company_tenantId, t.id AS tenant_id, pg_typeof(c."tenantId") AS company_tenant_type, pg_typeof(t.id) AS tenant_id_type FROM public."Company" c LEFT JOIN public."Tenant" t ON t.id::uuid = c."tenantId" WHERE c."tenantId"::text = '${tid}' LIMIT 1`;
    console.log('typeSql:', typeSql);
    try {
      const typeRows = await prisma.$queryRawUnsafe(typeSql);
      console.log('typeRows for', tid, typeRows);
    } catch (e) {
      console.error('type check error for', tid, e && e.message);
    }

    const sql = `SELECT c.id, c."tenantId", c.name, c."createdAt", COALESCE(t."workspace_name", t.name) AS "tenantWorkspaceName" FROM public."Company" c LEFT JOIN public."Tenant" t ON t.id::uuid = c."tenantId" WHERE c."tenantId"::text = '${tid}'`;
    console.log('sql:', sql);
    try {
      const rows = await prisma.$queryRawUnsafe(sql);
      console.log('rows for', tid, rows);
    } catch (e) {
      console.error('error for', tid, e && e.message);
    }
  }
  await prisma.$disconnect();
})();