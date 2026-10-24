import { IsEnum, IsUUID, IsOptional, IsString, IsNotEmpty } from 'class-validator'
import { PracticeUserStatus } from '../types/practice-user.types'

export class AcceptPracticeInviteDto {
  @IsUUID()
  @IsNotEmpty()
  companyId!: string

  @IsOptional()
  @IsEnum(PracticeUserStatus)
  status?: PracticeUserStatus
}
