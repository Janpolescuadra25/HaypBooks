import { Module, Global } from '@nestjs/common'
import { MockUserRepository } from './user.repository.mock'
import { MockOnboardingRepository } from './onboarding.repository.mock'

// Token constants for dependency injection
export const USER_REPOSITORY = 'USER_REPOSITORY'
export const ONBOARDING_REPOSITORY = 'ONBOARDING_REPOSITORY'

@Global()
@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: MockUserRepository,
    },
    {
      provide: ONBOARDING_REPOSITORY,
      useClass: MockOnboardingRepository,
    },
  ],
  exports: [USER_REPOSITORY, ONBOARDING_REPOSITORY],
})
export class MockRepositoriesModule {}
