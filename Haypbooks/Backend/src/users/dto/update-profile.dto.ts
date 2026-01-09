import { IsOptional, IsString, MaxLength, IsNotEmpty } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  companyName?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  firmName?: string
}
