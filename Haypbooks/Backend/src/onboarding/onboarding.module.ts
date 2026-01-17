import { Module } from '@nestjs/common'
import { OnboardingController } from './onboarding.controller'
import { OnboardingService } from './onboarding.service'
import { CompaniesModule } from '../companies/companies.module'

@Module({
  imports: [CompaniesModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
