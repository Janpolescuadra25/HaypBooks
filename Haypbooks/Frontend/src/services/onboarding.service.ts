import apiClient from '@/lib/api-client';

export interface OnboardingStepData {
  step: string;
  data: Record<string, any>;
}

export interface OnboardingProgress {
  userId: string;
  currentStep: string;
  stepData: Record<string, any>;
  completed: boolean;
}

class OnboardingService {
  /**
   * Save onboarding step data
   */
  async saveStep(step: string, data: Record<string, any>): Promise<void> {
    await apiClient.post('/api/onboarding/save', { step, data });
  }

  /**
   * Get onboarding progress
   */
  async getProgress(): Promise<OnboardingProgress> {
    const response = await apiClient.get<OnboardingProgress>('/api/onboarding/save');
    return response.data;
  }

  /**
   * Mark onboarding as complete
   */
  async complete(): Promise<void> {
    await apiClient.post('/api/onboarding/complete');
  }
}

export const onboardingService = new OnboardingService();
