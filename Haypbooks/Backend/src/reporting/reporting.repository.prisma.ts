import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class ReportingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createDashboard(data: { companyId: string; workspaceId: string; name: string; ownerId: string; widgets?: Array<any> }) {
    const { widgets = [], ...payload } = data
    const dashboard = await (this.prisma as any).kpiDashboard.create({
      data: {
        ...payload,
        widgets: { create: widgets.map(w => ({ type: w.type, title: w.title, config: w.config || {}, position: w.position || 0, size: w.size || 'full' })) },
      },
      include: { widgets: true },
    })
    return dashboard
  }

  async getDashboard(id: string) {
    return (this.prisma as any).kpiDashboard.findUnique({ where: { id }, include: { widgets: true } })
  }
}
