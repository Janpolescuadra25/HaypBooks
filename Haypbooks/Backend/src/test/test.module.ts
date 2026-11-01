import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { OnboardingModule } from '../onboarding/onboarding.module'
import { TestController } from './test.controller'
import { TestEndpointGuard } from './test.guard'

@Module({
  imports: [AuthModule, OnboardingModule],
  controllers: [TestController],
  providers: [TestEndpointGuard],
  exports: [TestEndpointGuard],
})
export class TestModule {}
