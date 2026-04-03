import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, Min } from 'class-validator'

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string

  @IsNumber()
  @Min(0.01)
  amount: number

  @IsString()
  @IsNotEmpty()
  date: string

  @IsOptional()
  @IsString()
  paymentMethod?: string

  @IsOptional()
  @IsString()
  reference?: string

  @IsOptional()
  @IsString()
  memo?: string
}
