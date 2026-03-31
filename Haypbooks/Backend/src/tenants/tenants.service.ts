import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { MailService } from '../common/mail.service'

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name)
  constructor(private readonly prisma: PrismaService, private readonly mailService: MailService) {}

async updateWorkspaceName(tenantId: string, workspaceName: string) {
    const workspaceId = tenantId

    if (!tenantId || !workspaceName) return null
    try {
      // Cast to any to allow runtime DB fields that may be missing from Prisma schema in some environments
      return await this.prisma.workspace.update({ where: { id: workspaceId }, data: { workspaceName } as any })
    } catch (e) {
      this.logger.warn('[TenantsService] Failed to update workspaceName (non-fatal): ' + (e?.message || e))
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
      this.logger.warn('[TenantsService] Failed to update firmName (non-fatal): ' + (e?.message || e))
      return null
    }
  }

  /**
   * Create a Practice under the owned workspace of the given user.
   */
  async createPractice(userId: string, name: string, servicesOffered?: string) {
    const workspace = await this.prisma.workspace.findFirst({ where: { ownerUserId: userId } })
    if (!workspace) {
      throw new BadRequestException('No workspace found for user. Complete onboarding first.')
    }
    const practice = await this.prisma.practice.create({
      data: {
        name: name.trim().slice(0, 140),
        workspaceId: workspace.id,
        isActive: true,
        ...(servicesOffered ? { servicesOffered } : {}),
      },
    })
    return practice
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
  async createInvite(tenantId: string, email: string | null, invitedBy: string, roleId?: string, roleName?: string, isLinkInvite: boolean = false, contactName?: string, message?: string) {
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
    let existingInvite: any | null = null

    if (isLinkInvite) {
      existingInvite = await this.prisma.workspaceInvite.findFirst({
        where: { workspaceId, isLinkInvite: true, status: 'PENDING' },
      })
    } else if (email) {
      existingInvite = await this.prisma.workspaceInvite.findUnique({
        where: {
          workspaceId_email: {
            workspaceId,
            email,
          },
        },
      })
    }

    if (existingInvite && existingInvite.status === 'PENDING') {
      return existingInvite
    }

    // Check if user is already a member (only applies to email invites)
    const invitedUser = email ? await this.prisma.user.findUnique({ where: { email } }) : null

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

    // Ensure roleId is always set (WorkspaceUser.roleId is required by schema).
    // If the caller did not provide a roleId, we can optionally accept a roleName (e.g. "Client")
    // and resolve/create it. Otherwise default to an 'Accountant' role.
    let effectiveRoleId = roleId

    const resolveRoleByName = async (name: string) => {
      const existingRole = await this.prisma.role.findFirst({
        where: { workspaceId, name: { equals: name, mode: 'insensitive' } },
      })
      if (existingRole) return existingRole.id
      const createdRole = await this.prisma.role.create({ data: { workspaceId, name } })
      return createdRole.id
    }

    if (!effectiveRoleId) {
      if (roleName) {
        effectiveRoleId = await resolveRoleByName(roleName)
      } else {
        effectiveRoleId = await resolveRoleByName('Accountant')
      }
    }

    // Create the invite
    const invite = await this.prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email: isLinkInvite ? null : email,
        roleId: effectiveRoleId,
        invitedBy,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isLinkInvite,
        message,
        contactName,
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

    this.logger.log(`Created tenant invite for ${email} in workspace ${workspaceId}`)

    // Send the invite email asynchronously (failure should not block the API)
    // For link-based invites, we do not have a real recipient email and should not attempt to email.
    if (!isLinkInvite && email) {
      try {
        const inv = invite as any
        const workspaceName = inv.workspace?.workspaceName || 'your workspace'
        const inviterName = inv.invitedByUser?.name || inv.invitedByUser?.email || 'a colleague'
        const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite?code=${invite.id}`
        const html = this.mailService.buildInviteHtml(inviterName, workspaceName, link)
        const text = this.mailService.buildInviteText(inviterName, workspaceName, link)
        await this.mailService.sendEmail(email, 'You have been invited to HaypBooks', html, text)
      } catch (e) {
        this.logger.warn('Failed to send invite email: ' + (e?.message || e))
      }
    }

    return invite
  }

  /**
   * Get pending invites for an email
   */
  async getPendingInvitesForEmail(email: string) {
    const invites = await this.prisma.workspaceInvite.findMany({
      where: {
        email,
        status: { in: ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'] },
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

    // For backwards-compatibility with older client code/tests that expect a `tenant` key
    // (legacy naming from when the system used a Tenant model), provide it alongside `workspace`.
    const now = new Date()
    return invites.map(invite => {
      const expired = invite.expiresAt ? invite.expiresAt.getTime() < now.getTime() : false
      const displayStatus = expired && invite.status === 'PENDING' ? 'EXPIRED' : invite.status
      return {
        ...invite,
        status: displayStatus,
        isExpired: expired,
        tenant: (invite as any).workspace,
      }
    })
  }

  async declineInviteForEmail(email: string, inviteId: string) {
    const invite = await this.prisma.workspaceInvite.findUnique({ where: { id: inviteId } })
    if (!invite) {
      throw new Error('Invite not found')
    }
    if ((invite.email || '').toLowerCase() !== (email || '').toLowerCase()) {
      throw new Error('Invite does not belong to this email')
    }
    if (invite.status !== 'PENDING') {
      throw new Error('Only pending invites can be declined')
    }

    await this.prisma.workspaceInvite.update({
      where: { id: inviteId },
      data: { status: 'DECLINED' },
    })

    return { success: true }
  }

  async cancelInviteByOwner(tenantId: string, userId: string, inviteId: string) {
    // Verify owner permission
    const tenantUser = await this.prisma.workspaceUser.findUnique({
      where: { workspaceId_userId: { workspaceId: tenantId, userId } },
    })

    if (!tenantUser || !tenantUser.isOwner) {
      throw new ForbiddenException('Only tenant owners can cancel invites')
    }

    const invite = await this.prisma.workspaceInvite.findUnique({ where: { id: inviteId } })
    if (!invite) {
      throw new Error('Invite not found')
    }
    if (invite.workspaceId !== tenantId) {
      throw new ForbiddenException('Invite does not belong to this tenant')
    }

    if (invite.status !== 'PENDING') {
      throw new Error('Only pending invites can be cancelled')
    }

    await this.prisma.workspaceInvite.update({
      where: { id: inviteId },
      data: { status: 'CANCELLED' },
    })

    return { success: true }
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
