import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Compatibility aliases for older code that references Tenant/tenantUser/tenantInvite
  // These provide a minimal runtime and type-level bridge to the renamed Workspace models.
  get tenant(): any { return (this as any).workspace }
  get tenantUser(): any { return (this as any).workspaceUser }
  get tenantInvite(): any { return (this as any).workspaceInvite }

  async onModuleInit() {
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
