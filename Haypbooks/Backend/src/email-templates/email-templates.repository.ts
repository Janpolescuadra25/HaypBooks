import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class EmailTemplatesRepository {
    constructor(private readonly prisma: PrismaService) { }

    findAll(companyId: string) {
        return this.prisma.emailTemplate.findMany({
            where: { companyId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        })
    }

    findById(companyId: string, id: string) {
        return this.prisma.emailTemplate.findFirst({
            where: { id, companyId },
        })
    }

    create(companyId: string, data: {
        name: string
        subject: string
        body: string
        tone?: string
        cc?: string
        isDefault?: boolean
    }) {
        return this.prisma.emailTemplate.create({
            data: { companyId, ...data },
        })
    }

    update(id: string, data: Partial<{
        name: string
        subject: string
        body: string
        tone: string
        cc: string
        isDefault: boolean
    }>) {
        return this.prisma.emailTemplate.update({
            where: { id },
            data,
        })
    }

    delete(id: string) {
        return this.prisma.emailTemplate.delete({ where: { id } })
    }

    /** Clear all isDefault=true on other templates for the same company */
    clearDefault(companyId: string, excludeId: string) {
        return this.prisma.emailTemplate.updateMany({
            where: { companyId, isDefault: true, id: { not: excludeId } },
            data: { isDefault: false },
        })
    }
}
