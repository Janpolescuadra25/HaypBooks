import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'
import { getCompanyId, getUserId, getWorkspaceId } from '../../shared/async-context'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Compatibility aliases for older code that references Tenant/tenantUser/tenantInvite
  // These provide a minimal runtime and type-level bridge to the renamed Workspace models.
  get tenant(): any { return (this as any).workspace }
  get tenantUser(): any { return (this as any).workspaceUser }
  get tenantInvite(): any { return (this as any).workspaceInvite }

  async onModuleInit() {
    // Attach request-scoped metadata (company/workspace/user) into the PostgreSQL session
    // so that RLS policies can enforce tenant isolation without relying solely on app filtering.
    this.$use(async (params, next) => {
      // Skip setting session vars for raw SQL executions to avoid recursion.
      if (params.action === 'executeRaw' || params.action === 'queryRaw') return next(params)

      const companyId = getCompanyId()
      const workspaceId = getWorkspaceId()
      const userId = getUserId()

      if (companyId || workspaceId || userId) {
        try {
          if (companyId) {
            await this.$executeRaw(Prisma.sql`SET LOCAL haypbooks.company_id = ${companyId}`)
          }
          if (workspaceId) {
            await this.$executeRaw(Prisma.sql`SET LOCAL haypbooks.workspace_id = ${workspaceId}`)
          }
          if (userId) {
            await this.$executeRaw(Prisma.sql`SET LOCAL haypbooks.user_id = ${userId}`)
          }
        } catch (e) {
          // best-effort: if we can't set the session variable, continue without blocking the request
        }
      }

      // Soft-delete read filtering
      const softDeleteModels = [
        'Workspace', 'User', 'Invoice', 'Bill', 'Contact', 'Customer', 'Vendor',
        'Employee', 'Item', 'FixedAsset', 'TaxRate', 'BankAccount'
      ]
      if (params.model && softDeleteModels.includes(params.model)) {
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          params.action = 'findFirst'
          if (!params.args) params.args = { where: {} }
          if (!params.args.where) params.args.where = {}
          if (params.args.where.deletedAt === undefined) {
            params.args.where.deletedAt = null
          }
        }
        if (params.action === 'findMany' || params.action === 'count') {
          if (!params.args) params.args = { where: {} }
          if (!params.args.where) params.args.where = {}
          if (params.args.where.deletedAt === undefined) {
            params.args.where.deletedAt = null
          }
        }
      }
      return next(params)
    })

    this.$use(async (params, next) => {
      if (params.model !== 'WorkspaceUser' && params.model !== 'Company' && params.model !== 'AccountingFirm' && params.model !== 'Project') return next(params)

      const action = params.action
      if (action !== 'create' && action !== 'update' && action !== 'delete') {
        return next(params)
      }

      let prev: any = null
      if (action === 'update' || action === 'delete') {
        try {
          if (params.model === 'WorkspaceUser') {
            prev = await this.workspaceUser.findUnique({ where: params.args.where })
          } else if (params.model === 'Company') {
            prev = await this.company.findUnique({ where: params.args.where })
          } else if (params.model === 'Project') {
            prev = await this.project.findUnique({ where: params.args.where })
          }
        } catch (e) {
          prev = null
        }
      }

      const result = await next(params)

      // Resolve the affected workspace id early for use in the different model handlers
      let workspaceId: string | undefined = undefined
      if (action === 'create') workspaceId = result?.workspaceId || params.args.data?.workspaceId || undefined
      if (action === 'update') workspaceId = prev?.workspaceId || result?.workspaceId || params.args.data?.workspaceId || undefined
      if (action === 'delete') workspaceId = prev?.workspaceId || undefined

      // Company active count maintenance
      if (params.model === 'Company') {
        if (!workspaceId) return result

        const prevActive = prev ? prev.isActive === true : false
        const nextActive = result?.isActive === true || params.args.data?.isActive === true

        let delta = 0
        if (action === 'create' && nextActive) delta = 1
        if (action === 'delete' && prevActive) delta = -1
        if (action === 'update') {
          if (!prevActive && nextActive) delta = 1
          if (prevActive && !nextActive) delta = -1
        }

        if (delta !== 0) {
          try {
            await this.workspace.update({
              where: { id: workspaceId },
              data: { activeCompaniesCount: { increment: delta } },
            })
          } catch (e) {
            // best-effort; do not block the original mutation
          }
        }

        return result
      }

      // AccountingFirm active count maintenance
      if (params.model === 'AccountingFirm') {
        if (!workspaceId) return result

        const prevActive = prev ? prev.isActive === true : false
        const nextActive = result?.isActive === true || params.args.data?.isActive === true

        let delta = 0
        if (action === 'create' && nextActive) delta = 1
        if (action === 'delete' && prevActive) delta = -1
        if (action === 'update') {
          if (!prevActive && nextActive) delta = 1
          if (prevActive && !nextActive) delta = -1
        }

        if (delta !== 0) {
          try {
            await this.workspace.update({
              where: { id: workspaceId },
              data: { activeFirmCount: { increment: delta } },
            })
          } catch (e) {
            // best-effort; do not block the original mutation
          }
        }

        return result
      }

      // Project active count maintenance
      if (params.model === 'Project') {
        if (!workspaceId) return result

        const prevActive = prev ? prev.isActive === true : false
        const nextActive = result?.isActive === true || params.args.data?.isActive === true

        let delta = 0
        if (action === 'create' && nextActive) delta = 1
        if (action === 'delete' && prevActive) delta = -1
        if (action === 'update') {
          if (!prevActive && nextActive) delta = 1
          if (prevActive && !nextActive) delta = -1
        }

        if (delta !== 0) {
          try {
            await this.workspace.update({
              where: { id: workspaceId },
              data: { activeProjectCount: { increment: delta } },
            })
          } catch (e) {
            // best-effort; do not block the original mutation
          }
        }

        return result
      }

      const prevStatus = prev?.status || null
      const nextStatus = result?.status || params.args.data?.status || prevStatus || 'ACTIVE'

      const wasActive = prevStatus ? prevStatus === 'ACTIVE' : false
      const isActive = nextStatus === 'ACTIVE'

      const prevIsOwner = prev?.isOwner === true
      const nextIsOwner = (result?.isOwner === true) || (params.args.data?.isOwner === true)

      const wasClient = wasActive && !prevIsOwner
      const isClient = isActive && !nextIsOwner

      let delta = 0
      if (action === 'create' && isClient) delta = 1
      if (action === 'delete' && wasClient) delta = -1
      if (action === 'update') {
        if (!wasClient && isClient) delta = 1
        if (wasClient && !isClient) delta = -1
      }

      if (delta !== 0) {
        try {
          await this.workspace.update({
            where: { id: workspaceId },
            data: { activeNonOwnerUsersCount: { increment: delta } },
          })
        } catch (e) {
          // best-effort; do not block the original mutation
        }
      }

      return result
    })
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
