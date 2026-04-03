import { IsString, IsOptional, IsUUID, IsNumber, IsEmail, ValidateIf } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateCustomerDto {
  @IsString()
  displayName: string

  @IsOptional()
  @ValidateIf(o => o.email !== '' && o.email != null)
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  companyName?: string

  @IsOptional()
  @IsString()
  taxId?: string

  @IsOptional()
  @IsString()
  billingAddress?: string

  @IsOptional()
  @IsString()
  shippingAddress?: string

  /** Human-readable payment term identifier (e.g. 'NET_30') — resolved to paymentTermId in service */
  @IsOptional()
  @IsString()
  paymentTerms?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsUUID()
  paymentTermId?: string

  @IsOptional()
  @IsUUID()
  priceListId?: string

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined
    const n = Number(value)
    return isNaN(n) ? undefined : n
  })
  @IsNumber()
  creditLimit?: number

  @IsOptional()
  @IsUUID()
  groupId?: string
}
