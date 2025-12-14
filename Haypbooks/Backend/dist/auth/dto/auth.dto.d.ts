export declare class LoginDto {
    email: string;
    password: string;
}
export declare class SignupDto {
    email: string;
    name: string;
    password: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class VerifyOtpDto {
    email: string;
    otpCode?: string;
    code?: string;
}
export declare class ResetPasswordDto {
    token?: string;
    readonly email?: string;
    readonly otpCode?: string;
    password: string;
    newPassword?: string;
}
