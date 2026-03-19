import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class PracticeHubService {
  constructor(private readonly prisma: PrismaService) {}

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
}
