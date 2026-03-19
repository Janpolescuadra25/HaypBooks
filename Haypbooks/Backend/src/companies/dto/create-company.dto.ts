import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator'

export class CreateCompanyDto {
  @IsString()
  name: string

  /** Workspace (tenant) the company belongs to */
  @IsUUID()
  @IsOptional()
  workspaceId?: string

  /** ISO-4217 currency code, e.g. "PHP" */
  @IsString()
  @IsOptional()
  currency?: string

  /** e.g. "Sole Proprietorship", "Corporation" */
  @IsString()
  @IsOptional()
  business?: string
}
