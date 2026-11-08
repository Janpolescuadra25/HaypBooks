import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import { DepreciationMethod } from '@prisma/client'

export class CreateAssetCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  standardCategory: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  defaultUsefulLifeMonths?: number

  @IsOptional()
  @IsEnum(DepreciationMethod)
  defaultDepreciationMethod?: DepreciationMethod

  @IsOptional()
  @IsString()
  description?: string
}
