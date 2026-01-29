import { Module } from '@nestjs/common'
import { OnboardingController } from './onboarding.controller'
import { OnboardingService } from './onboarding.service'
import { CompaniesModule } from '../companies/companies.module'
import { TenantsModule } from '../tenants/tenants.module'

@Module({
  imports: [CompaniesModule, TenantsModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
