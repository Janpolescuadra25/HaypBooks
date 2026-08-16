import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class ZypraChatRequestDto {
  @IsString()
  @IsNotEmpty()
  message: string

  @IsString()
  @IsOptional()
  context?: string
}
