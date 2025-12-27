import { Controller, Post, Body } from '@nestjs/common'
import { VerificationService } from './verification.service'
import { SendCodeDto } from './dto/send-code.dto'
import { VerifyCodeDto } from './dto/verify-code.dto'

@Controller('api/auth')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('email/send-code')
  async sendEmailCode(@Body() dto: SendCodeDto) {
    return this.verificationService.sendEmailCode(dto.email!)
  }

  @Post('email/verify-code')
  async verifyEmailCode(@Body() dto: VerifyCodeDto) {
    // For email verification we require email context; in a login flow, the email is known via session; here we expect client to send email
    // Consider also allowing verification by userId/session in post-login flow
    return this.verificationService.verifyEmailCode((dto as any).email!, dto.code)
  }

  @Post('phone/send-code')
  async sendPhoneCode(@Body() dto: SendCodeDto) {
    if (!dto.phone) throw new Error('Missing phone')
    return this.verificationService.sendPhoneCode(dto.phone)
  }

  @Post('phone/verify-code')
  async verifyPhoneCode(@Body() dto: VerifyCodeDto) {
    if (!dto.phone) throw new Error('Missing phone')
    return this.verificationService.verifyPhoneCode((dto as any).phone, dto.code)
  }
}
