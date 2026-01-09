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

  async updatePhone(userId: string, phone: string) {
    // Normalize phone and compute HMAC if available
    const normalize = require('../utils/phone.util').normalizePhoneOrThrow
    let normalized: string
    try { normalized = normalize(phone) } catch (e) { throw e }

    let phoneHmac: string | undefined = undefined
    try { phoneHmac = require('../utils/hmac.util').hmacPhone(normalized) } catch (e) { phoneHmac = undefined }

    const updated = await this.userRepository.update(userId, { phone: normalized, phoneHmac } as any)
    const { password, ...result } = updated
    return result
  }

  async updateProfile(userId: string, data: { companyName?: string; firmName?: string }) {
    const payload: any = {}
    if (typeof data.companyName === 'string') payload.companyName = String(data.companyName).trim() || null
    if (typeof data.firmName === 'string') payload.firmName = String(data.firmName).trim() || null
    const updated = await this.userRepository.update(userId, payload)
    const { password, ...result } = updated
    return result
  }
}
