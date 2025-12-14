import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IOnboardingRepository } from '../interfaces/onboarding.repository.interface'

@Injectable()
export class PrismaOnboardingRepository implements IOnboardingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(userId: string, step: string, data: Record<string, any>): Promise<void> {
    // upsert step per user+step
    const existing = await this.prisma.onboardingStep.findFirst({ where: { userId, step } })
    if (existing) {
      await this.prisma.onboardingStep.update({ where: { id: existing.id }, data: { data } })
    } else {
      await this.prisma.onboardingStep.create({ data: { userId, step, data } })
    }
  }

  async load(userId: string): Promise<Record<string, any>> {
    const rows = await this.prisma.onboardingStep.findMany({ where: { userId } })
    const result: Record<string, any> = {}
    for (const r of rows) result[r.step] = r.data
    return result
  }

  async markComplete(userId: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { onboardingComplete: true } })
  }

  async isComplete(userId: string): Promise<boolean> {
    const u = await this.prisma.user.findUnique({ where: { id: userId } })
    return !!(u?.onboardingComplete)
  }
}
