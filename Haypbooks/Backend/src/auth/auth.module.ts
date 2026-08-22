import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { PrismaAuthService } from './prisma-auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { MailService } from '../common/mail.service'
import { VerificationService } from './verification.service'
import { VerificationController } from './verification.controller'
import { PendingSignupService } from './pending-signup.service'
import { RolesGuard } from './guards/roles.guard'
import { SystemRoleGuard } from './guards/system-role.guard'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController, VerificationController],
  providers: [
    PrismaAuthService,
    JwtStrategy,
    MailService,
    VerificationService,
    PendingSignupService,
    RolesGuard,
    SystemRoleGuard,
  ],
  exports: [
    PrismaAuthService,
    VerificationService,
    PendingSignupService,
    RolesGuard,
    SystemRoleGuard,
  ],
})
export class AuthModule {}
