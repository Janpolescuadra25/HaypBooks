import { Response } from 'express';
import { OnboardingService } from './onboarding.service';
import { SaveStepDto } from './dto/onboarding.dto';
export declare class OnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: OnboardingService);
    saveStep(req: any, saveStepDto: SaveStepDto): Promise<{
        success: boolean;
    }>;
    loadProgress(req: any): Promise<{
        steps: Record<string, any>;
    }>;
    complete(req: any, res: Response, body: {
        type?: 'quick' | 'full';
    }): Promise<{
        success: boolean;
    }>;
}
