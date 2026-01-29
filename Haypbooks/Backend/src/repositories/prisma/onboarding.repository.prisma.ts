import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IOnboardingRepository } from '../interfaces/onboarding.repository.interface'

@Injectable()
export class PrismaOnboardingRepository implements IOnboardingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(userId: string, step: string, data: Record<string, any>): Promise<void> {
    // Since OnboardingStep no longer has a userId column, store userId inside the step.data and
    // emulate per-user upsert by filtering in application code.
    const rows = await this.prisma.onboardingStep.findMany({ where: { step } })
    const existing = rows.find(r => (r.data as any)?.userId === userId)
    if (existing) {
      await this.prisma.onboardingStep.update({ where: { id: existing.id }, data: { data: { ...(existing.data as any), ...data, userId } } as any })
    } else {
      await this.prisma.onboardingStep.create({ data: { step, data: { ...data, userId } as any } as any })
    }
  }

  async load(userId: string): Promise<Record<string, any>> {
    const rows = await this.prisma.onboardingStep.findMany({})
    const result: Record<string, any> = {}
    for (const r of rows) {
      const d: any = r.data as any
      if (d?.userId === userId) result[r.step] = d
    }
    return result
  }

  async markComplete(userId: string): Promise<void> {
    // mark completion by creating a special 'complete' step for the user
    const rows = await this.prisma.onboardingStep.findMany({ where: { step: 'complete' } })
    const existing = rows.find(r => (r.data as any)?.userId === userId)
    if (!existing) {
      await this.prisma.onboardingStep.create({ data: { step: 'complete', data: { userId } as any } as any })
    }
  }

  async isComplete(userId: string): Promise<boolean> {
    const rows = await this.prisma.onboardingStep.findMany({ where: { step: 'complete' } })
    return rows.some(r => (r.data as any)?.userId === userId)
  }
}
