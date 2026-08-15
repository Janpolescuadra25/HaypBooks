import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsDateString, MaxLength } from 'class-validator'

export class CreatePracticeInviteDto {
  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  @MaxLength(140)
  companyName?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  engagementName!: string

  @IsString()
  @IsIn(['AUDIT', 'TAX', 'ADVISORY', 'BOOKKEEPING'])
  engagementType!: string

  @IsDateString()
  startDate!: string
}
