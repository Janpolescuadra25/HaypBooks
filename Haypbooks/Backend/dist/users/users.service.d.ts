import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    findById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        isEmailVerified?: boolean;
        role: "owner" | "admin" | "manager" | "accountant" | "ar-clerk" | "ap-clerk" | "viewer";
        createdAt: Date;
        onboardingComplete?: boolean;
        onboardingMode?: "quick" | "full";
        resetToken?: string | null;
        resetTokenExpiry?: number | null;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        name: string;
        isEmailVerified?: boolean;
        role: "owner" | "admin" | "manager" | "accountant" | "ar-clerk" | "ap-clerk" | "viewer";
        createdAt: Date;
        onboardingComplete?: boolean;
        onboardingMode?: "quick" | "full";
        resetToken?: string | null;
        resetTokenExpiry?: number | null;
    }>;
}
