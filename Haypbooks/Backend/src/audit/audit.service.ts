'use strict'

import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    workspaceId: string
    companyId?: string
    userId: string
    entityType: string
    entityId?: string
    action: string
    oldValue?: any
    newValue?: any
    metadata?: any
  }) {
    return this.prisma.auditLog.create({
      data: {
        workspaceId: params.workspaceId,
        companyId: params.companyId,
        userId: params.userId,
        action: params.action,
        tableName: params.entityType,
        recordId: params.entityId ?? null,
        changes: (params.oldValue != null || params.newValue != null || params.metadata != null)
          ? JSON.parse(JSON.stringify({ oldValue: params.oldValue, newValue: params.newValue, metadata: params.metadata }))
          : null,
      },
    })
  }

  async getEntityHistory(companyId: string, entityType: string, entityId: string) {
    try {
      return this.prisma.auditLog.findMany({
        where: { companyId, tableName: entityType, recordId: entityId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      })
    } catch (error) {
      console.error('Audit entity history query failed:', error)
      return []
    }
  }

  async getCompanyLogs(companyId: string, filters?: {
    entityType?: string
    action?: string
    userId?: string
    startDate?: Date
    endDate?: Date
    skip?: number
    take?: number
  }) {
    const where: any = { companyId }
    if (filters?.entityType) where.tableName = filters.entityType
    if (filters?.action) where.action = filters.action
    if (filters?.userId) where.userId = filters.userId
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    try {
      const [items, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          skip: filters?.skip || 0,
          take: filters?.take || 50,
        }),
        this.prisma.auditLog.count({ where }),
      ])

      return { items, total }
    } catch (error) {
      console.error('Audit log query failed:', error)
      return { items: [], total: 0 }
    }
  }
}
