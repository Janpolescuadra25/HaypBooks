import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { USER_REPOSITORY } from '../repositories/mock/mock-repositories.module'

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
    return result
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
