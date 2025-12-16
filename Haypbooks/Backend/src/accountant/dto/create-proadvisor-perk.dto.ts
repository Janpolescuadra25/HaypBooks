import { IsNotEmpty, IsString } from 'class-validator'

export class CreateProAdvisorPerkDto {
  @IsNotEmpty()
  @IsString()
  userId: string

  @IsNotEmpty()
  @IsString()
  type: string

  @IsNotEmpty()
  @IsString()
  name: string

  @IsString()
  issuer?: string
}
