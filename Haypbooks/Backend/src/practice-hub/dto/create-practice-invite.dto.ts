import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, IsDateString, MaxLength } from 'class-validator'
import { PracticeUserRole } from '../types/practice-user.types'

export class CreatePracticeInviteDto {
  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  @MaxLength(140)
  companyName?: string

  @IsOptional()
  @IsEnum(PracticeUserRole)
  role?: PracticeUserRole

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
