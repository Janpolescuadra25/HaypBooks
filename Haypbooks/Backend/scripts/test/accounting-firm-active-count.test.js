const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    // Create a workspace (Tenant)
    const user = await prisma.user.create({ data: { email: 'test-owner+' + Date.now() + '@example.com', password: 'x' } })
    const workspace = await prisma.workspace.create({ data: { ownerUserId: user.id } })
    console.log('Created workspace', workspace.id, 'owner', user.id)

    // Confirm initial count is 0
    let t = await prisma.workspace.findUnique({ where: { id: workspace.id } })
    console.log('Initial activeFirmCount:', t.activeFirmCount)

    // Create an accounting firm
    const firm = await prisma.accountingFirm.create({ data: { workspaceId: workspace.id, name: 'Test Firm' } })
    console.log('Created firm', firm.id)

    t = await prisma.workspace.findUnique({ where: { id: workspace.id } })
    console.log('After create activeFirmCount:', t.activeFirmCount)

    // Deactivate firm
    await prisma.accountingFirm.update({ where: { id: firm.id }, data: { isActive: false } })
    t = await prisma.workspace.findUnique({ where: { id: workspace.id } })
    console.log('After deactivate activeFirmCount:', t.activeFirmCount)

    // Delete firm
    await prisma.accountingFirm.delete({ where: { id: firm.id } })
    t = await prisma.workspace.findUnique({ where: { id: workspace.id } })
    console.log('After delete activeFirmCount:', t.activeFirmCount)

    // cleanup
    await prisma.workspace.delete({ where: { id: workspace.id } })
    console.log('Completed test (workspace removed)')
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
