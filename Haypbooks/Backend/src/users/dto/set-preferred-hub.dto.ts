import { IsIn, IsNotEmpty } from 'class-validator'

export class SetPreferredHubDto {
  @IsNotEmpty()
  @IsIn(['OWNER', 'ACCOUNTANT'])
  preferredHub: 'OWNER' | 'ACCOUNTANT'
}