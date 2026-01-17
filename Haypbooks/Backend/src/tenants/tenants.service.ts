import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all tenants the user has access to via TenantUser
   */
  async listTenantsForUser(userId: string) {
    const tenantUsers = await this.prisma.tenantUser.findMany({
      where: { userId },
      include: {
        tenant: {
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
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    })

    return tenantUsers.map(tu => ({
      id: tu.tenant.id,
      name: tu.tenant.name,
      isOwner: tu.isOwner,
      role: tu.role,
      lastAccessedAt: tu.lastAccessedAt,
      companiesCount: tu.tenant.companies.length,
      companies: tu.tenant.companies,
    }))
  }

  /**
   * Get client list for accountant hub
   * Returns tenants where user is invited (not owner)
   */
  async listClientsForAccountant(userId: string) {
    const tenantUsers = await this.prisma.tenantUser.findMany({
      where: {
        userId,
        isOwner: false, // Only non-owned tenants (clients)
      },
      include: {
        tenant: {
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
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    })

    return tenantUsers.map(tu => ({
      tenantId: tu.tenant.id,
      tenantName: tu.tenant.name,
      role: tu.role,
      lastAccessedAt: tu.lastAccessedAt,
      companiesCount: tu.tenant.companies.length,
      companies: tu.tenant.companies,
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

    // Verify the inviter has permission (must be owner)
    const tenantUser = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: invitedBy,
        },
      },
    })

    if (!tenantUser || !tenantUser.isOwner) {
      throw new ForbiddenException('Only tenant owners can invite users')
    }

    // Check if invite already exists
    const existingInvite = await this.prisma.tenantInvite.findUnique({
      where: {
        tenantId_email: {
          tenantId,
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
      const existingMembership = await this.prisma.tenantUser.findUnique({
        where: {
          tenantId_userId: {
            tenantId,
            userId: invitedUser.id,
          },
        },
      })

      if (existingMembership) {
        throw new BadRequestException('This user is already a member of this tenant')
      }
    }

    // Create the invite
    const invite = await this.prisma.tenantInvite.create({
      data: {
        tenantId,
        email,
        roleId,
        invitedBy,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        tenant: {
          select: {
            name: true,
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
    const invites = await this.prisma.tenantInvite.findMany({
      where: {
        email,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
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
    const tenantUser = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
      include: {
        tenant: {
          include: {
            companies: {
              where: { isActive: true },
            },
          },
        },
      },
    })

    if (!tenantUser) {
      throw new NotFoundException('Tenant not found or access denied')
    }

    return {
      ...tenantUser.tenant,
      isOwner: tenantUser.isOwner,
      role: tenantUser.role,
    }
  }

  /**
   * Update last accessed time when accountant switches to a client
   */
  async updateLastAccessed(tenantId: string, userId: string) {
    const tenantUser = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    })

    if (!tenantUser) {
      throw new NotFoundException('Tenant access not found')
    }

    await this.prisma.tenantUser.update({
      where: {
        tenantId_userId: {
          tenantId,
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
