import { BadRequestException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

export async function assertCompanyBelongsToTenant(prisma: PrismaClient, companyId: string | null | undefined, workspaceId: string) {
  if (!companyId) return
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) throw new BadRequestException('company not found')
  if (company.workspaceId !== workspaceId) throw new BadRequestException('company does not belong to workspace')
}
