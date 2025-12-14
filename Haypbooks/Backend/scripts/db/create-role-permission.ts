import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const role = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
  const perm = await prisma.permission.findFirst({ where: { key: 'manage:all' } });
  if (!role || !perm) {
    console.error('Missing role or permission');
    return;
  }
  try {
    await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: perm.id } });
    console.log('Inserted RolePermission row');
  } catch (err: any) {
    console.error('Create failed:', err.message);
  }
}

run().finally(async () => await prisma.$disconnect());
