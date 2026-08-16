import { IsString, IsInt, IsArray, ValidateNested, Min, Max, IsNotEmpty, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

class BudgetLineDto {
  @IsString()
  @IsNotEmpty()
  accountId: string

  @IsInt()
  @Min(1)
  @Max(12)
  month: number

  @IsInt()
  @Min(0)
  amount: number
}

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsInt()
  @Min(2020)
  fiscalYear: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetLineDto)
  lines: BudgetLineDto[]
}

export class UpdateBudgetDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsInt()
  @Min(2020)
  @IsOptional()
  fiscalYear?: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetLineDto)
  @IsOptional()
  lines?: BudgetLineDto[]
}
