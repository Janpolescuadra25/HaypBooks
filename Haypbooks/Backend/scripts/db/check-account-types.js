const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const types = await prisma.accountType.findMany();
  console.log('AccountTypes:');
  console.table(types);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
