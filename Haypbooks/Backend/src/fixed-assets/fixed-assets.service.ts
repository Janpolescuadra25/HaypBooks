import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, AssetStatus, DepreciationMethod, PostingStatus } from '@prisma/client'
import { AuditService } from '../audit/audit.service'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { CalculateDepreciationDto, CreateAssetCategoryDto, CreateFixedAssetDto } from './dto'

@Injectable()
export class FixedAssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private async getWorkspaceId(companyId: string): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { workspaceId: true },
    })

    if (!company) {
      throw new NotFoundException(`Company ${companyId} not found.`)
    }

    return company.workspaceId
  }

  private async logAudit(
    companyId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, any>,
  ) {
    return this.auditService.log({
      workspaceId: await this.getWorkspaceId(companyId),
      companyId,
      userId,
      action,
      entityType,
      entityId,
      metadata: details,
    })
  }

  async createCategory(companyId: string, userId: string, dto: CreateAssetCategoryDto) {
    const category = await this.prisma.fixedAssetCategory.create({
      data: {
        companyId,
        name: dto.name,
        standardCategory: dto.standardCategory as any,
        defaultUsefulLifeMonths: dto.defaultUsefulLifeMonths ?? null,
        defaultDepreciationMethod: dto.defaultDepreciationMethod ?? DepreciationMethod.STRAIGHT_LINE,
        description: dto.description ?? null,
        isActive: true,
      },
    })

    await this.logAudit(companyId, userId, 'CREATE_FIXED_ASSET_CATEGORY', 'FixedAssetCategory', category.id, {
      name: category.name,
      defaultUsefulLifeMonths: category.defaultUsefulLifeMonths,
      defaultDepreciationMethod: category.defaultDepreciationMethod,
    })

    return category
  }

  async getCategories(companyId: string) {
    return this.prisma.fixedAssetCategory.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    })
  }

  async createAsset(companyId: string, userId: string, dto: CreateFixedAssetDto) {
    const category = await this.prisma.fixedAssetCategory.findFirst({
      where: { companyId, id: dto.categoryId, isActive: true },
    })

    if (!category) {
      throw new NotFoundException(`Asset category with ID ${dto.categoryId} not found for company ${companyId}.`)
    }

    const effectiveMethod = dto.depreciationMethod ?? category.defaultDepreciationMethod ?? DepreciationMethod.STRAIGHT_LINE
    if (effectiveMethod !== DepreciationMethod.STRAIGHT_LINE) {
      throw new BadRequestException(
        `Depreciation method ${effectiveMethod} is not supported in Phase 17 Journey 4. Only STRAIGHT_LINE is active.`,
      )
    }

    const accountIds = [dto.assetAccountId, dto.accumulatedDepreciationId, dto.depreciationExpenseAccountId]
    const matchingAccounts = await this.prisma.account.findMany({
      where: {
        id: { in: accountIds },
        companyId,
        deletedAt: null,
      },
      select: { id: true },
    })

    const foundIds = matchingAccounts.map((account) => account.id)
    const missingIds = accountIds.filter((accountId) => !foundIds.includes(accountId))

    if (missingIds.length > 0) {
      throw new BadRequestException(`Chart of Accounts validation failed. Missing accounts: ${missingIds.join(', ')}`)
    }

    const asset = await this.prisma.fixedAsset.create({
      data: {
        companyId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description ?? null,
        acquisitionDate: new Date(dto.acquisitionDate),
        cost: new Prisma.Decimal(Number(dto.cost).toFixed(4)),
        salvageValue: new Prisma.Decimal(Number(dto.salvageValue ?? 0).toFixed(4)),
        usefulLifeMonths: dto.usefulLifeMonths,
        depreciationMethod: effectiveMethod,
        status: dto.status ?? AssetStatus.ACTIVE,
        assetAccountId: dto.assetAccountId,
        accumulatedDepreciationId: dto.accumulatedDepreciationId,
        depreciationExpenseAccountId: dto.depreciationExpenseAccountId,
      },
    })

    await this.logAudit(companyId, userId, 'ACQUIRE_FIXED_ASSET', 'FixedAsset', asset.id, {
      assetNumber: asset.id,
      name: asset.name,
      cost: Number(asset.cost),
      usefulLifeMonths: asset.usefulLifeMonths,
    })

    return asset
  }

  async getAssets(companyId: string) {
    return this.prisma.fixedAsset.findMany({
      where: { companyId, deletedAt: null },
      include: { category: true },
      orderBy: { acquisitionDate: 'desc' },
    })
  }

  async getAssetById(companyId: string, assetId: string) {
    const asset = await this.prisma.fixedAsset.findFirst({
      where: { id: assetId, companyId, deletedAt: null },
      include: {
        category: true,
        fixedAssetSchedules: {
          orderBy: { createdAt: 'desc' },
        },
        depreciations: {
          orderBy: { periodStart: 'asc' },
        },
      },
    })

    if (!asset) {
      throw new NotFoundException(`Fixed asset ${assetId} not found.`)
    }

    return asset
  }

  async softDeleteAsset(companyId: string, assetId: string, userId: string) {
    const asset = await this.prisma.fixedAsset.findFirst({
      where: { id: assetId, companyId, deletedAt: null },
    })

    if (!asset) {
      throw new NotFoundException(`Fixed asset ${assetId} not found.`)
    }

    const deletedAsset = await this.prisma.fixedAsset.update({
      where: { id: assetId },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    })

    await this.logAudit(companyId, userId, 'SOFT_DELETE_FIXED_ASSET', 'FixedAsset', assetId, {
      assetName: asset.name,
      assetNumber: asset.id,
      deletedAt: deletedAsset.deletedAt,
    })

    return deletedAsset
  }

  async generateDepreciationSchedule(companyId: string, assetId: string, fiscalYear: number, userId: string) {
    const asset = await this.prisma.fixedAsset.findFirst({
      where: { id: assetId, companyId, deletedAt: null },
    })

    if (!asset) {
      throw new NotFoundException(`Fixed asset ${assetId} not found.`)
    }

    if (asset.depreciationMethod !== DepreciationMethod.STRAIGHT_LINE) {
      throw new BadRequestException(
        `Depreciation method ${asset.depreciationMethod} is not supported. Only STRAIGHT_LINE is valid in Phase 17 Journey 4.`,
      )
    }

    const assetCost = Number(asset.cost)
    const salvageValue = Number(asset.salvageValue ?? 0)
    const usefulLifeMonths = asset.usefulLifeMonths ?? 0

    if (usefulLifeMonths <= 0) {
      throw new BadRequestException('Asset useful life must be greater than zero months.')
    }

    const monthlyDepreciation = Math.round(((assetCost - salvageValue) / usefulLifeMonths) * 100) / 100
    const annualDepreciation = Math.round((monthlyDepreciation * 12) * 100) / 100

    const result = await this.prisma.$transaction(async (tx) => {
      const schedule = await tx.fixedAssetSchedule.create({
        data: {
          companyId,
          assetId,
          method: asset.depreciationMethod,
          startDate: new Date(fiscalYear, 0, 1),
          endDate: new Date(fiscalYear, 11, 31, 23, 59, 59, 999),
          totalAmount: new Prisma.Decimal(annualDepreciation.toFixed(4)),
        },
      })

      const periods = [] as any[]
      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        const periodStart = new Date(fiscalYear, monthIndex, 1, 0, 0, 0, 0)
        const periodEnd = new Date(fiscalYear, monthIndex + 1, 0, 23, 59, 59, 999)

        const period = await tx.fixedAssetDepreciation.create({
          data: {
            assetId,
            companyId,
            scheduleId: schedule.id,
            periodStart,
            periodEnd,
            amount: new Prisma.Decimal(monthlyDepreciation.toFixed(4)),
            postingStatus: PostingStatus.DRAFT,
          },
        })

        periods.push(period)
      }

      return { schedule, periods, monthlyDepreciation, annualTotal: annualDepreciation }
    })

    await this.logAudit(companyId, userId, 'GENERATE_DEPRECIATION_SCHEDULE', 'FixedAssetSchedule', result.schedule.id, {
      assetId,
      fiscalYear,
      monthlyDepreciation: result.monthlyDepreciation,
      annualTotal: result.annualTotal,
      periodCount: result.periods.length,
    })

    return result
  }
}
