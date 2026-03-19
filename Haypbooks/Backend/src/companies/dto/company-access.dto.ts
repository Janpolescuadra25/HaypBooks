import { IsEmail, IsUUID, IsOptional } from 'class-validator'

export class CompanyGrantAccessDto {
  @IsUUID()
  userId: string

  @IsUUID()
  @IsOptional()
  roleId?: string
}

export class CompanySendInviteDto {
  @IsEmail()
  email: string

  @IsUUID()
  @IsOptional()
  roleId?: string
}
