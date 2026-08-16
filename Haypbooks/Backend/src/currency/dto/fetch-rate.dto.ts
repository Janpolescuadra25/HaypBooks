import { IsString, Length } from 'class-validator'

export class FetchRateDto {
  @IsString()
  @Length(3, 3)
  fromCurrencyCode: string

  @IsString()
  @Length(3, 3)
  toCurrencyCode: string
}
