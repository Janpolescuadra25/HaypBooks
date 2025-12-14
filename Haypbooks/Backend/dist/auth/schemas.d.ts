import { z } from 'zod';
export declare const VerifyOtpSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    otpCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    otpCode: string;
}, {
    email: string;
    otpCode: string;
}>, {
    email: string;
    otpCode: string;
}, unknown>;
export declare const ResetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    otpCode: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email?: string | undefined;
    token?: string | undefined;
    otpCode?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    token?: string | undefined;
    otpCode?: string | undefined;
}>, {
    password: string;
    email?: string | undefined;
    token?: string | undefined;
    otpCode?: string | undefined;
}, unknown>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
