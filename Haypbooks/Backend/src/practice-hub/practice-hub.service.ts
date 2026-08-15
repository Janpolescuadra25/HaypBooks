import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { MailService } from '../common/mail.service'
import crypto from 'crypto'

@Injectable()
export class PracticeHubService {
  private readonly logger = new Logger(PracticeHubService.name)

  constructor(private readonly prisma: PrismaService, private readonly mailService: MailService) {}

  /** Find the practice record for a given workspace */
  async findPracticeByWorkspace(workspaceId: string) {
    return this.prisma.practice.findFirst({ where: { workspaceId, isActive: true } })
  }

  /** Dashboard stats: active clients, open tasks, pending reviews, completed MTD */
  async getDashboardStats(practiceId: string) {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [engagements, openTasks, pendingReviews, completedMtd] = await Promise.all([
      this.prisma.engagement.count({ where: { practiceId, status: 'ACTIVE' } }),
      this.prisma.task.count({ where: { practiceId, status: { in: ['PENDING', 'IN_PROGRESS'] }, deletedAt: null } }),
      this.prisma.task.count({ where: { practiceId, status: 'PENDING', deletedAt: null } }),
      this.prisma.task.count({ where: { practiceId, status: 'DONE', completedAt: { gte: monthStart }, deletedAt: null } }),
    ])

    return {
      activeClients: engagements,
      openTasks,
      pendingReviews,
      completedMtd,
    }
  }

  /** Recent activity: last 10 completed or updated tasks */
  async getRecentActivity(practiceId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { practiceId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: { company: { select: { name: true } } },
    })

    return tasks.map((t) => ({
      id: t.id,
      client: t.company?.name ?? 'General',
      action: t.title,
      time: t.updatedAt.toISOString(),
      status: t.status === 'DONE' ? 'done' : t.status === 'BLOCKED' ? 'warn' : 'info',
    }))
  }

  /** Upcoming deadlines: next 10 calendar events or due tasks */
  async getUpcomingDeadlines(practiceId: string) {
    const now = new Date()

    const events = await this.prisma.practiceCalendar.findMany({
      where: { practiceId, startAt: { gte: now } },
      orderBy: { startAt: 'asc' },
      take: 10,
      include: { company: { select: { name: true } } },
    })

    if (events.length > 0) {
      return events.map((e) => ({
        id: e.id,
        label: e.title + (e.company ? ` — ${e.company.name}` : ''),
        date: e.startAt.toISOString(),
        urgent: e.eventType === 'DEADLINE' || e.eventType === 'TAX_FILING',
      }))
    }

    // Fallback: use task due dates if no calendar events
    const tasks = await this.prisma.task.findMany({
      where: { practiceId, dueDate: { gte: now }, status: { not: 'DONE' }, deletedAt: null },
      orderBy: { dueDate: 'asc' },
      take: 10,
      include: { company: { select: { name: true } } },
    })

    return tasks.map((t) => ({
      id: t.id,
      label: t.title + (t.company ? ` — ${t.company.name}` : ''),
      date: t.dueDate!.toISOString(),
      urgent: t.priority === 'URGENT' || t.priority === 'HIGH',
    }))
  }

  /** Client list: all active engagements with company info */
  async getClientList(practiceId: string) {
    const engagements = await this.prisma.engagement.findMany({
      where: { practiceId, status: 'ACTIVE' },
      include: { company: { select: { id: true, name: true } } },
      orderBy: { startDate: 'desc' },
    })

    return engagements.map((e) => ({
      id: e.id,
      companyId: e.companyId,
      companyName: e.company.name,
      engagementName: e.name,
      type: e.type,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
    }))
  }

  private async findPracticeForUser(userId: string) {
    const practiceUser = await this.prisma.practiceUser.findFirst({ where: { userId } })
    if (!practiceUser) return null
    return this.prisma.practice.findUnique({ where: { id: practiceUser.practiceId } })
  }

  async createInvite(userId: string, dto: { email: string; companyName?: string; engagementName: string; engagementType: string; startDate: string }) {
    const practice = await this.findPracticeForUser(userId)
    if (!practice) throw new NotFoundException('Practice not found for user')

    const normalizedEmail = dto.email.trim().toLowerCase()
    if (!normalizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new BadRequestException('Invalid email format')
    }

    const allowedTypes = ['AUDIT', 'TAX', 'ADVISORY', 'BOOKKEEPING']
    if (!allowedTypes.includes(dto.engagementType)) {
      throw new BadRequestException('Invalid engagement type')
    }

    const existingPending = await this.prisma.practiceInvite.findFirst({
      where: { practiceId: practice.id, email: normalizedEmail, status: 'PENDING' },
    })
    if (existingPending) {
      throw new ConflictException('An active invite already exists for this email')
    }

    const existingEngagement = await this.prisma.engagement.findFirst({
      where: {
        practiceId: practice.id,
        status: 'ACTIVE',
        company: {
          companyUsers: {
            some: {
              member: {
                status: 'ACTIVE',
                user: { email: normalizedEmail },
              },
            },
          },
        },
      },
    })

    if (existingEngagement) {
      throw new ConflictException('This practice already has an active engagement with a company for that email')
    }

    const code = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const invite = await this.prisma.practiceInvite.create({
      data: {
        practiceId: practice.id,
        code,
        email: normalizedEmail,
        companyName: dto.companyName?.trim() || null,
        engagementName: dto.engagementName.trim(),
        engagementType: dto.engagementType,
        startDate: new Date(dto.startDate),
        expiresAt,
      },
    })

    const inviteUrl = `${process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'}/accept-practice-invite?code=${invite.code}`
    try {
      const inviterName = practice.name || 'Your practice'
      const workspaceName = practice.name || 'HaypBooks'
      const html = this.mailService.buildInviteHtml(inviterName, workspaceName, inviteUrl)
      const text = this.mailService.buildInviteText(inviterName, workspaceName, inviteUrl)
      await this.mailService.sendEmail(normalizedEmail, `You're invited to join ${practice.name} on HaypBooks`, html, text)
    } catch (error) {
      console.error('[PracticeHubService] invite email send failed (non-fatal):', error)
    }

    return invite
  }

  async getInvites(userId: string) {
    const practice = await this.findPracticeForUser(userId)
    if (!practice) throw new NotFoundException('Practice not found for user')

    return this.prisma.practiceInvite.findMany({
      where: { practiceId: practice.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getInviteByCode(code: string) {
    const invite = await this.prisma.practiceInvite.findUnique({
      where: { code },
      include: { practice: true },
    })
    if (!invite) throw new NotFoundException('Invite not found')
    if (invite.status !== 'PENDING') {
      throw new BadRequestException('This invitation has already been used or is no longer valid')
    }
    if (invite.expiresAt < new Date()) {
      await this.prisma.practiceInvite.update({ where: { id: invite.id }, data: { status: 'EXPIRED' } })
      throw new BadRequestException('This invitation has expired')
    }
    return invite
  }

  async acceptInvite(userId: string, code: string, companyId: string) {
    return this.prisma.$transaction(async (tx) => {
      const invite = await tx.practiceInvite.findUnique({ where: { code } })
      if (!invite) throw new NotFoundException('Invite not found')
      if (invite.status !== 'PENDING') {
        throw new BadRequestException('This invitation has already been used or is no longer valid')
      }
      if (invite.expiresAt < new Date()) {
        await tx.practiceInvite.update({ where: { id: invite.id }, data: { status: 'EXPIRED' } })
        throw new BadRequestException('This invitation has expired')
      }
      const user = await tx.user.findUnique({ where: { id: userId } })
      if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
        throw new ForbiddenException('This invitation was sent to a different email')
      }

      const company = await tx.company.findFirst({
        where: { id: companyId, workspace: { users: { some: { userId, status: 'ACTIVE' } } } },
      })
      if (!company) {
        throw new ForbiddenException("You don't have access to this company")
      }

      const activeEngagement = await tx.engagement.findFirst({
        where: { practiceId: invite.practiceId, companyId, status: 'ACTIVE' },
      })
      if (activeEngagement) {
        throw new ConflictException('An active engagement already exists for this company and practice')
      }

      const engagement = await tx.engagement.create({
        data: {
          practiceId: invite.practiceId,
          companyId,
          name: invite.engagementName,
          type: invite.engagementType,
          status: 'ACTIVE',
          startDate: invite.startDate,
        },
      })

      await tx.practiceInvite.update({
        where: { id: invite.id },
        data: {
          status: 'ACCEPTED',
          acceptedByUserId: userId,
          companyId,
          engagementId: engagement.id,
          acceptedAt: new Date(),
        },
      })

      return engagement
    })
  }
}
