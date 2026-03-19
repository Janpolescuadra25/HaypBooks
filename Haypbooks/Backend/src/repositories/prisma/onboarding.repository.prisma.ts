import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IOnboardingRepository } from '../interfaces/onboarding.repository.interface'

/**
 * Persistent Prisma-backed OnboardingRepository.
 * Replaces the in-memory MockOnboardingRepository so that steps survive
 * NestJS hot-reloads and are accessible across different requests.
 */
@Injectable()
export class PrismaOnboardingRepository implements IOnboardingRepository {
  constructor(private readonly prisma: PrismaService) { }

  async save(userId: string, step: string, data: Record<string, any>): Promise<void> {
    // Load existing steps then merge
    const existing = await this.prisma.onboardingData.findUnique({ where: { userId } })
    const existingSteps: Record<string, any> = (existing?.steps as Record<string, any>) || {}
    const updatedSteps = { ...existingSteps, [step]: data }
    await this.prisma.onboardingData.upsert({
      where: { userId },
      create: { userId, steps: updatedSteps, complete: false },
      update: { steps: updatedSteps },
    })
  }

  async load(userId: string): Promise<Record<string, any>> {
    const record = await this.prisma.onboardingData.findUnique({ where: { userId } })
    return (record?.steps as Record<string, any>) || {}
  }

  async markComplete(userId: string): Promise<void> {
    await this.prisma.onboardingData.upsert({
      where: { userId },
      create: { userId, steps: {}, complete: true },
      update: { complete: true },
    })
  }

  async isComplete(userId: string): Promise<boolean> {
    const record = await this.prisma.onboardingData.findUnique({ where: { userId } })
    return record?.complete || false
  }
}
