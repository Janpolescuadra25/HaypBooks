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
      onboardingCompleted: result.onboardingComplete ?? false,
      onboardingMode: result.onboardingMode || 'full',
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
}
