import { IsEmail, IsNotEmpty, MinLength, Length, Matches, IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email: string

  @IsNotEmpty()
  password: string
}

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email: string

  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  // Accept 'business'|'accountant'|'both' in the frontend; map to userType in backend
  role?: string
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email: string
}

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email: string

  @IsNotEmpty()
  // Accept either `otpCode` (preferred) or `code` (legacy/tests). Normalize both into `otpCode`.
  @Transform(({ obj }) => {
    // allow both 'otpCode' and 'code' in input
    if (obj?.otpCode) return obj.otpCode
    if (obj?.code) return String(obj.code).trim()
    return obj?.otpCode
  })
  // 6 digit numeric OTP
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit numeric code' })
  @IsOptional()
  otpCode?: string

  // legacy/simple alias: some clients send 'code' instead of 'otpCode'
  @IsOptional()
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit numeric code' })
  code?: string
}

export class ResetPasswordDto {
  // allow either a reset token string OR email+otp combination
  token?: string

  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsOptional()
  readonly email?: string

  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit numeric code' })
  @IsOptional()
  @Matches(/^[0-9]{6}$/, { message: 'OTP must be a 6-digit numeric code' })
  readonly otpCode?: string

  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  // Accept `password` (preferred) or `newPassword` for convenience
  @Transform(({ obj, value }) => {
    if (value) return value
    if (obj?.newPassword) return obj.newPassword
    return value
  })
  password: string

  // alias allowed by some clients/tests
  @IsOptional()
  newPassword?: string
}
