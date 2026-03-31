import { IsNotEmpty, IsObject, IsString, IsOptional, IsIn } from 'class-validator'

export class SaveStepDto {
  @IsNotEmpty()
  @IsString()
  step: string

  @IsNotEmpty()
  @IsObject()
  data: Record<string, any>
}

export class CompleteDto {
  @IsOptional()
  @IsIn(['quick', 'full'])
  type?: 'quick' | 'full'

  @IsOptional()
  @IsString()
  practiceName?: string

  @IsOptional()
  @IsString()
  companyName?: string
}
