export interface User {
    id: string;
    email: string;
    name: string;
    password: string;
    isEmailVerified?: boolean;
    role: 'owner' | 'admin' | 'manager' | 'accountant' | 'ar-clerk' | 'ap-clerk' | 'viewer';
    createdAt: Date;
    onboardingComplete?: boolean;
    onboardingMode?: 'quick' | 'full';
    resetToken?: string | null;
    resetTokenExpiry?: number | null;
}
export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: Partial<User>): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<boolean>;
    findByResetToken?(token: string): Promise<User | null>;
}
