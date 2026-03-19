import { IsString, IsOptional, IsBoolean } from 'class-validator'

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  currency?: string

  @IsString()
  @IsOptional()
  business?: string

  /** BIR TIN — Philippine tax-identification number */
  @IsString()
  @IsOptional()
  birTin?: string

  /** BIR Revenue District Office code */
  @IsString()
  @IsOptional()
  birRdoCode?: string
}
