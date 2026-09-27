import { BadRequestException } from '@nestjs/common'

export interface PeriodValidationContext {
  companyId?: string
  workspaceId?: string
}

export async function assertPeriodOpen(
  prisma: any,
  context: PeriodValidationContext | string,
  entryDate: Date,
): Promise<void> {
  const companyId = typeof context === 'string' ? context : context.companyId
  let workspaceId = typeof context === 'string' ? undefined : context.workspaceId
  const date = entryDate instanceof Date ? entryDate : new Date(entryDate)

  if (!workspaceId && companyId && prisma.company) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { workspaceId: true },
    })
    workspaceId = company?.workspaceId
  }

  if (prisma.accountingPeriod) {
    const periodWhere: any = {
      startDate: { lte: date },
      endDate: { gte: date },
      status: { in: ['CLOSED', 'LOCKED'] },
    }

    if (workspaceId) {
      periodWhere.workspaceId = workspaceId
    } else if (companyId) {
      periodWhere.companyId = companyId
    }

    const closedPeriod = await prisma.accountingPeriod.findFirst({
      where: periodWhere,
    })

    if (closedPeriod) {
      const label = closedPeriod.name || closedPeriod.id
      const status = String(closedPeriod.status).toLowerCase()
      throw new BadRequestException(
        `Cannot post or reverse transaction: Accounting period '${label}' is ${status} for date ${date.toISOString().split('T')[0]}.`,
      )
    }
  }

  if (prisma.postingLock) {
    const lockWhere: any = {
      isActive: true,
      startDate: { lte: date },
      endDate: { gte: date },
    }

    if (workspaceId) {
      lockWhere.workspaceId = workspaceId
    } else if (companyId) {
      lockWhere.companyId = companyId
    }

    const activeLock = await prisma.postingLock.findFirst({
      where: lockWhere,
    })

    if (activeLock) {
      throw new BadRequestException(
        `Cannot post or reverse transaction: A posting lock is active through ${activeLock.endDate.toISOString().split('T')[0]}.`,
      )
    }
  }
}
