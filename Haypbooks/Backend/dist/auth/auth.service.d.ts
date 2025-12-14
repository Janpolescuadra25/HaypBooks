import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { LoginDto, SignupDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: IUserRepository, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            onboardingComplete: boolean;
        };
    }>;
    signup(signupDto: SignupDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: "owner" | "admin" | "manager" | "accountant" | "ar-clerk" | "ap-clerk" | "viewer";
            onboardingComplete: boolean;
        };
    }>;
}
