import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
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
