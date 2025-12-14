import { Response } from 'express';
import { PrismaAuthService } from './prisma-auth.service';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { LoginDto, SignupDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    private readonly userRepository;
    private readonly sessionRepo;
    private readonly otpRepo;
    constructor(authService: PrismaAuthService, userRepository: IUserRepository, sessionRepo: any, otpRepo: any);
    login(loginDto: LoginDto, req: any, res: Response): Promise<{
        token: string;
        refreshToken: string;
        user: import("../repositories/interfaces/user.repository.interface").User;
    }>;
    signup(signupDto: SignupDto, res: Response): Promise<{
        token: string;
        user: import("../repositories/interfaces/user.repository.interface").User;
    }>;
    sendVerification(body: {
        email: string;
    }): Promise<{
        success: boolean;
        otp: string;
    } | {
        success: boolean;
        otp?: undefined;
    }>;
    logout(req: any, res: Response): Promise<{
        success: boolean;
    }>;
    listSessions(req: any): Promise<any>;
    revokeSession(req: any, body: {
        sessionId?: string;
        refreshToken?: string;
    }): Promise<{
        success: boolean;
    }>;
    revokeAllSessions(req: any): Promise<{
        success: boolean;
        deleted: any;
    }>;
    refresh(req: any, res: Response): Promise<{
        token: string;
        user: import("../repositories/interfaces/user.repository.interface").User;
    }>;
    forgotPassword(body: ForgotPasswordDto): Promise<{
        success: boolean;
        otp?: undefined;
    } | {
        success: boolean;
        otp: string;
    }>;
    verifyOtp(body: VerifyOtpDto): Promise<{
        success: boolean;
    }>;
    resetPassword(body: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
}
