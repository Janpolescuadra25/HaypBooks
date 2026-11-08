import { Type } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'

export class CalculateDepreciationDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  fiscalYear: number

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  months?: number = 12
}
