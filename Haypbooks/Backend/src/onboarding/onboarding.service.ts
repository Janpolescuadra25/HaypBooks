import { Injectable, Inject } from '@nestjs/common'
import { IOnboardingRepository } from '../repositories/interfaces/onboarding.repository.interface'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { ONBOARDING_REPOSITORY, USER_REPOSITORY } from '../repositories/mock/mock-repositories.module'

@Injectable()
export class OnboardingService {
  constructor(
    @Inject(ONBOARDING_REPOSITORY)
    private readonly onboardingRepository: IOnboardingRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async saveStep(userId: string, step: string, data: Record<string, any>) {
    await this.onboardingRepository.save(userId, step, data)
    return { success: true }
  }

  async loadProgress(userId: string) {
    const steps = await this.onboardingRepository.load(userId)
    return steps
  }

  async complete(userId: string, onboardingType: 'quick' | 'full' = 'full') {
    await this.onboardingRepository.markComplete(userId)
    await this.userRepository.update(userId, { onboardingComplete: true, onboardingMode: onboardingType })
    return { success: true }
  }

  async isComplete(userId: string) {
    return this.onboardingRepository.isComplete(userId)
  }
}
