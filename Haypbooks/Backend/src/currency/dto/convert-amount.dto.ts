import { IsString, IsNumber, Min, IsOptional, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export class ConvertAmountDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number

  @IsString()
  fromCurrencyCode: string

  @IsString()
  toCurrencyCode: string

  @IsOptional()
  @IsDateString()
  date?: string
}
