import { IOnboardingRepository } from '../repositories/interfaces/onboarding.repository.interface';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
export declare class OnboardingService {
    private readonly onboardingRepository;
    private readonly userRepository;
    constructor(onboardingRepository: IOnboardingRepository, userRepository: IUserRepository);
    saveStep(userId: string, step: string, data: Record<string, any>): Promise<{
        success: boolean;
    }>;
    loadProgress(userId: string): Promise<Record<string, any>>;
    complete(userId: string, onboardingType?: 'quick' | 'full'): Promise<{
        success: boolean;
    }>;
    isComplete(userId: string): Promise<boolean>;
}
