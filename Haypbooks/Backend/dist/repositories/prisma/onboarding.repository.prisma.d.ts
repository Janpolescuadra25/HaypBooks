import { PrismaService } from './prisma.service';
import { IOnboardingRepository } from '../interfaces/onboarding.repository.interface';
export declare class PrismaOnboardingRepository implements IOnboardingRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    save(userId: string, step: string, data: Record<string, any>): Promise<void>;
    load(userId: string): Promise<Record<string, any>>;
    markComplete(userId: string): Promise<void>;
    isComplete(userId: string): Promise<boolean>;
}
