import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class PracticeService {
  constructor(private readonly prisma: PrismaService) {}

  async createPractice(userId: string, name: string, servicesOffered?: string, displayName?: string) {
    const workspace = await this.prisma.workspace.findFirst({ where: { ownerUserId: userId } })
    if (!workspace) {
      throw new NotFoundException('No owned workspace found for user')
    }
    if (!name || !name.trim()) {
      throw new BadRequestException('Practice name is required')
    }

    console.log('[PracticeService] createPractice executing prisma.practice.create for userId', userId, 'name', name, 'displayName', displayName)

    const practice = await this.prisma.practice.create({
      data: {
        name: name.trim().slice(0, 140),
        displayName: displayName?.trim().slice(0, 140) ?? null,
        workspaceId: workspace.id,
        isActive: true,
        ...(servicesOffered ? { servicesOffered } : {}),
      },
    })

    return practice
  }

  private async findPracticeForUser(userId: string) {
    const practiceUser = await this.prisma.practiceUser.findFirst({ where: { userId } })
    if (!practiceUser) return null
    const practice = await this.prisma.practice.findUnique({ where: { id: practiceUser.practiceId } })
    return practice
  }

  async getDashboardForUser(userId: string) {
    const practice = await this.findPracticeForUser(userId)
    if (!practice) throw new NotFoundException('Practice not found for user')

    const activeClientCount = await this.prisma.companyFirmAccess.count({
      where: {
        accountingFirm: { workspaceId: practice.workspaceId },
        status: 'ACCEPTED',
      },
    })

    return {
      firmName: practice.name,
      activeClientCount,
      pendingTasks: 0,
    }
  }

  async getClientsForUser(userId: string) {
    const practice = await this.findPracticeForUser(userId)
    if (!practice) throw new NotFoundException('Practice not found for user')

    const accesses = await this.prisma.companyFirmAccess.findMany({
      where: {
        accountingFirm: { workspaceId: practice.workspaceId },
        status: 'ACCEPTED',
      },
      include: { company: { select: { id: true, name: true, currency: true, isActive: true } } },
      orderBy: { id: 'asc' },
    })

    return accesses.map((a) => ({
      id: a.company?.id ?? null,
      name: a.company?.name ?? 'Unknown',
      currency: a.company?.currency ?? 'USD',
      isActive: a.company?.isActive ?? false,
    }))
  }
}
