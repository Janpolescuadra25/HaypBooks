import { IsString, IsOptional, IsUUID, IsNumber, IsBoolean } from 'class-validator'

export class CreateVendorDto {
  @IsString()
  displayName: string

  @IsOptional()
  @IsUUID()
  paymentTermId?: string

  @IsOptional()
  @IsBoolean()
  isNonResident?: boolean

  @IsOptional()
  @IsNumber()
  defaultWithholding?: number
}
