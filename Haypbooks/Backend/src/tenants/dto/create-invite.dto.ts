import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateInviteDto {
  // tenantId is provided via the route parameter; allow it to be optional in the body
  @IsOptional()
  @IsUUID()
  tenantId?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsUUID()
  roleId?: string

  // Optional role name to use when creating an invite (e.g. "Client").
  // If provided, the service will resolve or create a role with this name.
  @IsOptional()
  @IsString()
  roleName?: string

  // Optional fields used by the UI to pre-fill the invite form.
  @IsOptional()
  @IsString()
  contactName?: string

  @IsOptional()
  @IsString()
  message?: string

  @IsOptional()
  isLinkInvite?: boolean
}
