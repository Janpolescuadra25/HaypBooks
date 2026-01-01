import { IsString, IsNotEmpty } from 'class-validator'

export class UpdatePhoneDto {
  @IsString()
  @IsNotEmpty()
  phone: string
}
