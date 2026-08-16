import { IsString, IsNotEmpty, IsNumber, IsOptional, IsIn } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateExchangeRateDto {
  @IsString()
  @IsNotEmpty()
  fromCurrencyCode: string

  @IsString()
  @IsNotEmpty()
  toCurrencyCode: string

  @Type(() => Number)
  @IsNumber()
  rate: number

  @IsOptional()
  @IsString()
  @IsIn(['manual', 'auto'])
  source?: string
}
