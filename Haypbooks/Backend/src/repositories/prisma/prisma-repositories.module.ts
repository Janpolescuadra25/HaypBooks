import { Module, Global } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { PrismaUserRepository } from './user.repository.prisma'
import { PrismaSessionRepository } from './session.repository.prisma'
import { PrismaOtpRepository } from './otp.repository.prisma'
import { PrismaSecurityEventRepository } from './security-event.repository.prisma'

export const USER_REPOSITORY = 'USER_REPOSITORY'
export const SESSION_REPOSITORY = 'SESSION_REPOSITORY'
export const OTP_REPOSITORY = 'OTP_REPOSITORY'
export const ONBOARDING_REPOSITORY = 'ONBOARDING_REPOSITORY'
export const SECURITY_EVENT_REPOSITORY = 'SECURITY_EVENT_REPOSITORY'

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: SESSION_REPOSITORY, useClass: PrismaSessionRepository },
    { provide: OTP_REPOSITORY, useClass: PrismaOtpRepository },
    { provide: ONBOARDING_REPOSITORY, useClass: (require('./onboarding.repository.prisma').PrismaOnboardingRepository) },
    { provide: SECURITY_EVENT_REPOSITORY, useClass: PrismaSecurityEventRepository },
  ],
  exports: [USER_REPOSITORY, SESSION_REPOSITORY, OTP_REPOSITORY, ONBOARDING_REPOSITORY, SECURITY_EVENT_REPOSITORY, PrismaService],
})
export class PrismaRepositoriesModule {}
