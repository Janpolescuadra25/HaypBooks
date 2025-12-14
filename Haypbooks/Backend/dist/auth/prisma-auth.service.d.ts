import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { ISessionRepository } from '../repositories/interfaces/session.repository.interface';
import { IOtpRepository } from '../repositories/interfaces/otp.repository.interface';
export declare class PrismaAuthService {
    private readonly userRepo;
    private readonly sessionRepo;
    private readonly otpRepo;
    private readonly jwtService;
    constructor(userRepo: IUserRepository, sessionRepo: ISessionRepository, otpRepo: IOtpRepository, jwtService: JwtService);
    signup(email: string, password: string, name?: string): Promise<{
        token: string;
        user: import("../repositories/interfaces/user.repository.interface").User;
    }>;
    login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{
        token: string;
        refreshToken: string;
        user: import("../repositories/interfaces/user.repository.interface").User;
    }>;
    refresh(refreshToken: string): Promise<{
        token: string;
        refreshToken: string;
        user: import("../repositories/interfaces/user.repository.interface").User;
    } | null>;
    startOtp(email: string, otpCode?: string, ttlMinutes?: number, purpose?: string): Promise<import("../repositories/interfaces/otp.repository.interface").Otp>;
    verifyOtp(email: string, otpCode: string, consume?: boolean): Promise<boolean>;
}
