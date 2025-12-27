import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { PrismaAuthService } from './prisma-auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { MailService } from '../common/mail.service'
import { VerificationService } from './verification.service'
import { VerificationController } from './verification.controller'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController, VerificationController],
  providers: [PrismaAuthService, JwtStrategy, MailService, VerificationService],
  exports: [PrismaAuthService, VerificationService],
})
export class AuthModule {}
