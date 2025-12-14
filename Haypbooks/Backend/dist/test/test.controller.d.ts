import { PrismaService } from '../repositories/prisma/prisma.service';
export declare class TestController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private ensureEnabled;
    latestOtp(email: string, purpose?: string): Promise<import(".prisma/client").Otp | null>;
    getUser(email: string): Promise<import(".prisma/client").User | null>;
    listUsers(): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        email: string;
        onboardingComplete: boolean | null;
        isEmailVerified: boolean;
    }[]>;
    createUser(body: {
        email: string;
        password: string;
        name?: string;
        isEmailVerified?: boolean;
    }): Promise<{
        id: string;
        email: string;
    }>;
    listSessions(email: string): Promise<import(".prisma/client").Session[]>;
}
