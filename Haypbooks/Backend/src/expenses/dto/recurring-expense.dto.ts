import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator'

export class CreateRecurringExpenseDto {
  @IsOptional()
  @IsString()
  vendorId?: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  memo?: string

  @IsNumber()
  @Min(0.01)
  amount: number

  @IsOptional()
  @IsString()
  currency?: string

  @IsOptional()
  @IsString()
  expenseAccountId?: string

  @IsEnum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'])
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

  @IsOptional()
  @IsNumber()
  @Min(1)
  interval?: number

  @IsDateString()
  startDate: string

  @IsOptional()
  @IsDateString()
  endDate?: string
}

export class UpdateRecurringExpenseDto {
  @IsOptional()
  @IsString()
  vendorId?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  memo?: string

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number

  @IsOptional()
  @IsString()
  currency?: string

  @IsOptional()
  @IsString()
  expenseAccountId?: string

  @IsOptional()
  @IsEnum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'])
  frequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

  @IsOptional()
  @IsNumber()
  @Min(1)
  interval?: number

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsEnum(['ACTIVE', 'PAUSED'])
  status?: string
}
