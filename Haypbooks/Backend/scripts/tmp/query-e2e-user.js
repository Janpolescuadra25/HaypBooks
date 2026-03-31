const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRawUnsafe("SELECT u.id as user_id, u.email, tu.\"tenantId\" as tenant_id, t.id as tenant_id_ref, c.id as company_id, c.name as company_name FROM public.\"User\" u JOIN public.\"TenantUser\" tu ON tu.\"userId\" = u.id LEFT JOIN public.\"Tenant\" t ON CAST(t.id AS text) = CAST(tu.\"tenantId\" AS text) LEFT JOIN public.\"Company\" c ON CAST(c.\"tenantId\" AS text) = CAST(tu.\"tenantId\" AS text) WHERE u.email LIKE $1 ORDER BY u.\"createdAt\" DESC LIMIT 10", '%e2e-full-%');
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('query error', e);
  } finally {
    await prisma.$disconnect();
  }
})();