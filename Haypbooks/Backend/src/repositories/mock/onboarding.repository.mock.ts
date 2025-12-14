import { Injectable } from '@nestjs/common'
import { IOnboardingRepository } from '../interfaces/onboarding.repository.interface'

interface OnboardingStore {
  [userId: string]: {
    steps: Record<string, any>
    complete: boolean
  }
}

@Injectable()
export class MockOnboardingRepository implements IOnboardingRepository {
  private store: OnboardingStore = {}

  async save(userId: string, step: string, data: Record<string, any>): Promise<void> {
    if (!this.store[userId]) {
      this.store[userId] = { steps: {}, complete: false }
    }
    this.store[userId].steps[step] = data
  }

  async load(userId: string): Promise<Record<string, any>> {
    return this.store[userId]?.steps || {}
  }

  async markComplete(userId: string): Promise<void> {
    if (!this.store[userId]) {
      this.store[userId] = { steps: {}, complete: false }
    }
    this.store[userId].complete = true
  }

  async isComplete(userId: string): Promise<boolean> {
    return this.store[userId]?.complete || false
  }
}
