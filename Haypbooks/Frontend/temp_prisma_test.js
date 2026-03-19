const path = require('path');
const PrismaClient = require('C:/Users/HomePC/Desktop/Haypbooksv9/Haypbooks/Backend/node_modules/@prisma/client').PrismaClient;
process.env.DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev';
const prisma = new PrismaClient();
(async ()=>{
  let user, workspace, company, practice;
  const fs = require('fs');
  function logError(tag, e) {
    const msg = `${tag} error: ${e.message}\n`;
    console.error(msg);
    fs.appendFileSync('prisma_errors.log', msg);
  }

  try {
    user = await prisma.user.create({data:{email:'tt'+Date.now()+'@x.test', password:'pwd', name:'Test'}});
    console.log('user', user);
  } catch (e) { logError('user create', e); }

  try {
    workspace = await prisma.workspace.create({data:{ownerUserId: user.id}});
    console.log('ws', workspace);
  } catch (e) { logError('workspace create', e); }

  try {
    company = await prisma.company.create({
      data:{
        workspace:{connect:{id:workspace.id}},
        name:'foo',
        currency:'USD',
        countryConfig: { create: { code: 'US', name: 'United States' } },
      }
    });
    console.log('company', company);
  } catch (e) { logError('company create', e); }

  try {
    practice = await prisma.practice.create({data:{workspace:{connect:{id:workspace.id}},name:'bar'}});
    console.log('practice', practice);
  } catch (e) { logError('practice create', e); }

  await prisma.$disconnect();
})();
