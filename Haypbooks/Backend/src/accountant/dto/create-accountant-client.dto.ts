import { IsNotEmpty, IsString, IsIn } from 'class-validator'

export class CreateAccountantClientDto {
  @IsNotEmpty()
  @IsString()
  accountantId: string

  @IsNotEmpty()
  @IsString()
  tenantId: string

  @IsString()
  @IsIn(['FULL','VIEW_ONLY','BILLING_ONLY'])
  accessLevel?: string
}
