import { z } from 'zod'

export const VerifyOtpSchema = z.preprocess((val) => {
  // Accept either { code } or { otpCode } and map to otpCode
  if (val && typeof val === 'object') {
    const obj = Object.assign({}, val as any)
    if (obj.code && !obj.otpCode) obj.otpCode = String(obj.code)
    return obj
  }
  return val
}, z.object({
  email: z.string().email(),
  otpCode: z.string().regex(/^[0-9]{6}$/, 'OTP must be a 6-digit numeric string'),
}))

export const ResetPasswordSchema = z.preprocess((val) => {
  // Accept either { newPassword } or { password } and map newPassword -> password
  if (val && typeof val === 'object') {
    const obj = Object.assign({}, val as any)
    if (obj.newPassword && !obj.password) obj.password = obj.newPassword
    if (obj.code && !obj.otpCode) obj.otpCode = String(obj.code)
    return obj
  }
  return val
}, z.object({
  token: z.string().optional(),
  email: z.string().email().optional(),
  otpCode: z.string().regex(/^[0-9]{6}$/, 'OTP must be a 6-digit numeric string').optional(),
  password: z.string().min(6),
}))

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
})

export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
