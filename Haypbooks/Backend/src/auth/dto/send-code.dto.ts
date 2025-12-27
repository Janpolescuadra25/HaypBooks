import { IsEmail, IsOptional, Matches } from 'class-validator'

export class SendCodeDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @Matches(/^\+?[0-9 ()\-]{7,20}$/, { message: 'Please provide a valid phone number' })
  phone?: string
}
