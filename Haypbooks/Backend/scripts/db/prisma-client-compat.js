const { PrismaClient } = require('@prisma/client')

// Single shared Prisma client with compatibility aliases for legacy scripts
const prisma = new PrismaClient()

// Legacy alias: tenant -> workspace (mapped in Prisma schema with @@map("Tenant"))
if (!('tenant' in prisma)) {
  Object.defineProperty(prisma, 'tenant', {
    configurable: true,
    enumerable: true,
    get() { return this.workspace }
  })
}

// Common related aliases
if (!('tenantUser' in prisma) && prisma.workspaceUser) prisma.tenantUser = prisma.workspaceUser
if (!('tenantInvite' in prisma) && prisma.workspaceInvite) prisma.tenantInvite = prisma.workspaceInvite

module.exports = prisma
