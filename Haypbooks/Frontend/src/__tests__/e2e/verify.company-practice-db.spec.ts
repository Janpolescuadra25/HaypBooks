import { test, expect } from '@playwright/test'
import path from 'path'

// This spec interacts directly with the database using Prisma. It demonstrates
// that we can create workspace, company and practice rows programmatically and
// then assert their existence. No UI or flaky backend helper endpoints are
// required.

// resolve PrismaClient from the backend package installation
const prismaClientPath = path.resolve(__dirname, '../../../../Backend/node_modules/@prisma/client')
const { PrismaClient } = require(prismaClientPath)

// make sure Prisma can connect to the development database
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'

const prisma = new PrismaClient()

test('create company and practice records directly via Prisma', async () => {
  const ts = Date.now()
  const email = `owner-db-${ts}@haypbooks.test`
  const companyName = `DBCo ${ts}`
  const practiceName = `DBPractice ${ts}`

  // create a user row
  const user = await prisma.user.create({
    data: { email, password: 'unused', name: 'OwnerDB' },
  })

  // create tenant workspace for user
  const workspace = await prisma.workspace.create({ data: { ownerUserId: user.id } })

  // insert company and practice records using relation connect syntax
  // company requires a countryConfig relation so provide a minimal value here
  await prisma.company.create({ data: {
      workspace: { connect: { id: workspace.id } },
      name: companyName,
      currency: 'USD',
      countryConfig: { connectOrCreate: { where: { code: 'US' }, create: { code: 'US', name: 'United States' } } },
    } })
  await prisma.practice.create({ data: {
      workspace: { connect: { id: workspace.id } },
      name: practiceName,
    } })

  // verify the rows exist
  const comps = await prisma.company.findMany({ where: { workspaceId: workspace.id } })
  expect(comps.map(c => c.name)).toContain(companyName)
  const pracs = await prisma.practice.findMany({ where: { workspaceId: workspace.id } })
  expect(pracs.map(p => p.name)).toContain(practiceName)

  await prisma.$disconnect()
})
