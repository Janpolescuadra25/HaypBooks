import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const roleCols: any = await prisma.$queryRawUnsafe("SELECT column_name, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Role';");
  console.log('Role columns:', roleCols);
  const permCols: any = await prisma.$queryRawUnsafe("SELECT column_name, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Permission';");
  console.log('Permission columns:', permCols);
  const rpCols: any = await prisma.$queryRawUnsafe("SELECT column_name, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name='RolePermission';");
  console.log('RolePermission columns:', rpCols);
}

run().finally(async () => await prisma.$disconnect());
