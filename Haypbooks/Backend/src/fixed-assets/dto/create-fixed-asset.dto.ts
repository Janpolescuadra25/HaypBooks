import { Type } from 'class-transformer'
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { AssetStatus, DepreciationMethod } from '@prisma/client'

export class CreateFixedAssetDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string

  @IsString()
  @IsNotEmpty()
  assetNumber: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsDateString()
  acquisitionDate: string

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  salvageValue?: number = 0

  @Type(() => Number)
  @IsInt()
  @Min(1)
  usefulLifeMonths: number

  @IsOptional()
  @IsEnum(DepreciationMethod)
  depreciationMethod?: DepreciationMethod = DepreciationMethod.STRAIGHT_LINE

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus = AssetStatus.ACTIVE

  @IsString()
  @IsNotEmpty()
  assetAccountId: string

  @IsString()
  @IsNotEmpty()
  accumulatedDepreciationId: string

  @IsString()
  @IsNotEmpty()
  depreciationExpenseAccountId: string
}
