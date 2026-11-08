import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common'
import { CalculateDepreciationDto, CreateAssetCategoryDto, CreateFixedAssetDto } from './dto'
import { FixedAssetsService } from './fixed-assets.service'

@Controller('companies/:companyId/fixed-assets')
export class FixedAssetsController {
  constructor(private readonly fixedAssetsService: FixedAssetsService) {}

  @Post('categories')
  async createCategory(
    @Param('companyId') companyId: string,
    @Body() dto: CreateAssetCategoryDto,
    @Req() req: any,
  ) {
    const userId = req?.user?.id ?? 'SYSTEM'
    return this.fixedAssetsService.createCategory(companyId, userId, dto)
  }

  @Get('categories')
  async getCategories(@Param('companyId') companyId: string) {
    return this.fixedAssetsService.getCategories(companyId)
  }

  @Post()
  async createAsset(
    @Param('companyId') companyId: string,
    @Body() dto: CreateFixedAssetDto,
    @Req() req: any,
  ) {
    const userId = req?.user?.id ?? 'SYSTEM'
    return this.fixedAssetsService.createAsset(companyId, userId, dto)
  }

  @Get()
  async getAssets(@Param('companyId') companyId: string) {
    return this.fixedAssetsService.getAssets(companyId)
  }

  @Get(':assetId')
  async getAssetById(
    @Param('companyId') companyId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.fixedAssetsService.getAssetById(companyId, assetId)
  }

  @Delete(':assetId')
  async softDeleteAsset(
    @Param('companyId') companyId: string,
    @Param('assetId') assetId: string,
    @Req() req: any,
  ) {
    const userId = req?.user?.id ?? 'SYSTEM'
    return this.fixedAssetsService.softDeleteAsset(companyId, assetId, userId)
  }

  @Post(':assetId/depreciation-schedule')
  async generateDepreciationSchedule(
    @Param('companyId') companyId: string,
    @Param('assetId') assetId: string,
    @Body() dto: CalculateDepreciationDto,
    @Req() req: any,
  ) {
    const userId = req?.user?.id ?? 'SYSTEM'
    return this.fixedAssetsService.generateDepreciationSchedule(companyId, assetId, dto.fiscalYear, userId)
  }
}
