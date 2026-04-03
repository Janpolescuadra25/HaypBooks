import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

class InvoiceLineDto {
  @IsUUID()
  @IsNotEmpty()
  accountId: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNumber()
  @Min(0.01)
  amount: number
}

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string

  @IsString()
  @IsNotEmpty()
  date: string

  @IsOptional()
  @IsString()
  dueDate?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  invoiceLines: InvoiceLineDto[]

  @IsOptional()
  @IsUUID()
  paymentTermId?: string

  @IsOptional()
  @IsString()
  memo?: string

  @IsOptional()
  @IsString()
  reference?: string
}
