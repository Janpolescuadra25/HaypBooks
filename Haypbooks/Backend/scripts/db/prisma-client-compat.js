const { PrismaClient } = require('@prisma/client')

// Single shared Prisma client with compatibility aliases for legacy scripts
const prisma = new PrismaClient()

// Legacy alias: tenant -> workspace (mapped in Prisma schema with @@map("Tenant"))
if (typeof prisma.tenant === 'undefined') {
  Object.defineProperty(prisma, 'tenant', {
    configurable: true,
    enumerable: true,
    value: prisma.workspace,
    writable: true,
  })
}

// Common related aliases
if (typeof prisma.tenantUser === 'undefined' && prisma.workspaceUser) {
  Object.defineProperty(prisma, 'tenantUser', {
    configurable: true,
    enumerable: true,
    value: prisma.workspaceUser,
    writable: true,
  })
}
if (typeof prisma.tenantInvite === 'undefined' && prisma.workspaceInvite) {
  Object.defineProperty(prisma, 'tenantInvite', {
    configurable: true,
    enumerable: true,
    value: prisma.workspaceInvite,
    writable: true,
  })
}

module.exports = prisma
