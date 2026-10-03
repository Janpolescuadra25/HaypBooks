import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsNotEmpty()
  @IsIn(['monthly', 'annual'])
  interval: 'monthly' | 'annual';

  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @IsOptional()
  @IsUrl()
  cancelUrl?: string;
}
