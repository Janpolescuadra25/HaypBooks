export interface OnboardingData {
  userId: string
  step: string
  data: Record<string, any>
  updatedAt: Date
}

export interface IOnboardingRepository {
  save(userId: string, step: string, data: Record<string, any>): Promise<void>
  load(userId: string): Promise<Record<string, any>>
  markComplete(userId: string): Promise<void>
  isComplete(userId: string): Promise<boolean>
}
