import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const roles = await prisma.role.findMany({ select: { id: true, name: true, tenantId: true }, take: 10 });
  console.log('Roles:', roles);
  const perms = await prisma.permission.findMany({ select: { id: true, key: true, desc: true }, take: 10 });
  console.log('Permissions:', perms);
  const rp = await prisma.rolePermission.findMany({ select: { roleId: true, permissionId: true }, take: 50 });
  console.log('RolePermissions count:', rp.length);
  console.log(rp.slice(0, 20));
}

run().finally(async () => await prisma.$disconnect());
