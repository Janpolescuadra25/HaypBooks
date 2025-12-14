import { PrismaService } from './prisma.service';
import { IOtpRepository, Otp } from '../interfaces/otp.repository.interface';
export declare class PrismaOtpRepository implements IOtpRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Partial<Otp>): Promise<Otp>;
    findLatestByEmail(email: string, purpose?: string): Promise<Otp | null>;
    incrementAttempts(id: string): Promise<Otp>;
    delete(id: string): Promise<boolean>;
    countRecentByEmail(email: string, minutes: number): Promise<number>;
}
