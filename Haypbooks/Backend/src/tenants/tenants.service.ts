import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

async updateWorkspaceName(tenantId: string, workspaceName: string) {
    const workspaceId = tenantId

    if (!tenantId || !workspaceName) return null
    try {
      // Cast to any to allow runtime DB fields that may be missing from Prisma schema in some environments
      return await this.prisma.workspace.update({ where: { id: workspaceId }, data: { workspaceName } as any })
    } catch (e) {
      console.warn('[TenantsService] Failed to update workspaceName (non-fatal):', e?.message || e)
      return null
    }
  }


async updateFirmName(tenantId: string, firmName: string) {
    const workspaceId = tenantId

    if (!tenantId || !firmName) return null
    try {
      // Cast as any to tolerate missing schema fields at type-check/runtime parity
      return await this.prisma.workspace.update({ where: { id: workspaceId }, data: { firmName } as any })
    } catch (e) {
      console.warn('[TenantsService] Failed to update firmName (non-fatal):', e?.message || e)
      return null
    }
  }

  /**
   * Get all tenants the user has access to via TenantUser
   */
  async listTenantsForUser(userId: string) {
    const tenantUsers = await this.prisma.workspaceUser.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            companies: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
        Role: { select: { id: true, name: true } },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    })

    return tenantUsers.map(tu => ({
      id: tu.workspace.id,
      name: (tu.workspace as any).workspaceName || null,
      workspaceName: (tu.workspace as any).workspaceName || null,
      activeNonOwnerUsersCount: (tu.workspace as any).activeNonOwnerUsersCount ?? 0,
      isOwner: tu.isOwner,
      role: tu.Role?.name || null,
      lastAccessedAt: tu.lastAccessedAt,
      companiesCount: tu.workspace.companies.length,
      companies: tu.workspace.companies,
    }))
  }

  /**
   * Get client list for accountant hub
   * Returns tenants where user is invited (not owner)
   */
  async listClientsForAccountant(userId: string) {
    const tenantUsers = await this.prisma.workspaceUser.findMany({
      where: {
        userId,
        isOwner: false, // Only non-owned tenants (clients)
      },
      include: {
        workspace: {
          include: {
            companies: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        Role: { select: { id: true, name: true } },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    })

    return tenantUsers.map(tu => ({
      workspaceId: tu.workspace.id,
      tenantName: (tu.workspace as any).workspaceName || null,
      workspaceName: (tu.workspace as any).workspaceName || null,
      activeNonOwnerUsersCount: (tu.workspace as any).activeNonOwnerUsersCount ?? 0,
      role: tu.Role?.name || null,
      lastAccessedAt: tu.lastAccessedAt,
      companiesCount: tu.workspace.companies.length,
      companies: tu.workspace.companies,
    }))
  }

  /**
   * Create a tenant invite
   * Owner invites accountant to access their tenant
   */
  async createInvite(tenantId: string, email: string, invitedBy: string, roleId?: string) {
    // Defensive validation: ensure tenantId is a valid UUID to avoid DB errors from malformed input
    if (!tenantId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenantId)) {
      throw new ForbiddenException('Invalid tenant')
    }

    const workspaceId = tenantId

    // Verify the inviter has permission (must be owner)
    const tenantUser = await this.prisma.workspaceUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: invitedBy,
        },
      },
    })

    if (!tenantUser || !tenantUser.isOwner) {
      throw new ForbiddenException('Only tenant owners can invite users')
    }

    // Check if invite already exists
    const existingInvite = await this.prisma.workspaceInvite.findUnique({
      where: {
        workspaceId_email: {
          workspaceId,
          email,
        },
      },
    })

    if (existingInvite && existingInvite.status === 'PENDING') {
      throw new BadRequestException('An invitation is already pending for this email')
    }

    // Check if user is already a member
    const invitedUser = await this.prisma.user.findUnique({
      where: { email },
    })

    if (invitedUser) {
      const existingMembership = await this.prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: invitedUser.id,
          },
        },
      })

      if (existingMembership) {
        throw new BadRequestException('This user is already a member of this tenant')
      }
    }

    // Create the invite
    const invite = await this.prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email,
        roleId,
        invitedBy,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        workspace: {
          select: {
            id: true,
          },
        },
        invitedByUser: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    // TODO: Send email notification to invitee
    // await this.mailService.sendInviteEmail(email, invite)

    return invite
  }

  /**
   * Get pending invites for an email
   */
  async getPendingInvitesForEmail(email: string) {
    const invites = await this.prisma.workspaceInvite.findMany({
      where: {
        email,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
          },
        },
        invitedByUser: {
          select: {
            email: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        invitedAt: 'desc',
      },
    })

    return invites
  }

  /**
   * Get tenant details if user has access
   */
async getTenantForUser(tenantId: string, userId: string) {
    const workspaceId = tenantId

    const tenantUser = await this.prisma.workspaceUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      include: {
        workspace: {
          include: {
            companies: {
              where: { isActive: true },
            },
          },
        },
        Role: { select: { id: true, name: true } },
      },
    })

    if (!tenantUser) {
      throw new NotFoundException('Tenant not found or access denied')
    }

    return {
      ...(tenantUser.workspace as any),
      isOwner: tenantUser.isOwner,
      role: tenantUser.Role?.name || null,
    }
  }

  /**
   * Update last accessed time when accountant switches to a client
   */

async updateLastAccessed(tenantId: string, userId: string) {
    const workspaceId = tenantId

    const tenantUser = await this.prisma.workspaceUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    })

    if (!tenantUser) {
      throw new NotFoundException('Tenant access not found')
    }

    await this.prisma.workspaceUser.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: {
        lastAccessedAt: new Date(),
      },
    })

    return { success: true }
  }
}
