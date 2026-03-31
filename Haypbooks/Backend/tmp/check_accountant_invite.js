const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const email = 'accountant-1773547307787@test.com';
  const user = await prisma.user.findUnique({ where: { email } });
  console.log('user', user ? { id: user.id, email: user.email } : null);
  if (!user) {
    await prisma.$disconnect();
    return;
  }
  const wus = await prisma.workspaceUser.findMany({ where: { userId: user.id } });
  console.log('workspaceUsers', wus);
  const invites = await prisma.workspaceInvite.findMany({ where: { email } });
  console.log('invites', invites);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
