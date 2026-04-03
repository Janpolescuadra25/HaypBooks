import { IsString, IsOptional, IsUUID, IsNumber, IsEmail } from 'class-validator'

export class CreateCustomerDto {
  @IsString()
  displayName: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsUUID()
  paymentTermId?: string

  @IsOptional()
  @IsUUID()
  priceListId?: string

  @IsOptional()
  @IsNumber()
  creditLimit?: number

  @IsOptional()
  @IsUUID()
  groupId?: string
}
