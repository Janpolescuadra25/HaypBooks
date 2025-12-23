import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { USER_REPOSITORY } from '../repositories/prisma/prisma-repositories.module'

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async findById(id: string) {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    const { password, ...result } = user
    // Ensure required fields for frontend are present
    return {
      ...result,
      // Back-compat: global flag
      onboardingCompleted: result.onboardingComplete ?? false,
      onboardingMode: result.onboardingMode || 'full',
      // Per-hub flags
      ownerOnboardingCompleted: (result as any).ownerOnboardingComplete ?? false,
      accountantOnboardingCompleted: (result as any).accountantOnboardingComplete ?? false,
    }
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    const { password, ...result } = user
    return result
  }

  async setPreferredHub(userId: string, preferredHub: 'OWNER' | 'ACCOUNTANT') {
    const updated = await this.userRepository.update(userId, { preferredHub } as any)
    const { password, ...result } = updated
    return result
  }
}
