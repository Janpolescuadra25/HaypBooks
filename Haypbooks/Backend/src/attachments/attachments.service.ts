import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, entityType: string, entityId: string) {
    return this.prisma.attachment.findMany({ where: { tenantId, entityType, entityId, deletedAt: null }, orderBy: { uploadedAt: 'desc' } })
  }

  async create(data: { tenantId: string; entityType: string; entityId: string; fileUrl: string; fileName?: string; mimeType?: string; fileSize?: number; uploadedById?: string; description?: string }) {
    return this.prisma.attachment.create({ data })
  }

  async softDelete(id: string) {
    return this.prisma.attachment.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async setPublic(id: string, isPublic: boolean) {
    return this.prisma.attachment.update({ where: { id }, data: { isPublic } })
  }
}
