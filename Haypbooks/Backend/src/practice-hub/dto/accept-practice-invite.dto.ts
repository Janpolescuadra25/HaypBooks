import { IsUUID, IsString, IsNotEmpty } from 'class-validator'

export class AcceptPracticeInviteDto {
  @IsUUID()
  @IsNotEmpty()
  companyId!: string
}
