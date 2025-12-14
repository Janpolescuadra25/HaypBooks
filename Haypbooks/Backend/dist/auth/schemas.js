"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordSchema = exports.ResetPasswordSchema = exports.VerifyOtpSchema = void 0;
const zod_1 = require("zod");
exports.VerifyOtpSchema = zod_1.z.preprocess((val) => {
    if (val && typeof val === 'object') {
        const obj = Object.assign({}, val);
        if (obj.code && !obj.otpCode)
            obj.otpCode = String(obj.code);
        return obj;
    }
    return val;
}, zod_1.z.object({
    email: zod_1.z.string().email(),
    otpCode: zod_1.z.string().regex(/^[0-9]{6}$/, 'OTP must be a 6-digit numeric string'),
}));
exports.ResetPasswordSchema = zod_1.z.preprocess((val) => {
    if (val && typeof val === 'object') {
        const obj = Object.assign({}, val);
        if (obj.newPassword && !obj.password)
            obj.password = obj.newPassword;
        if (obj.code && !obj.otpCode)
            obj.otpCode = String(obj.code);
        return obj;
    }
    return val;
}, zod_1.z.object({
    token: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    otpCode: zod_1.z.string().regex(/^[0-9]{6}$/, 'OTP must be a 6-digit numeric string').optional(),
    password: zod_1.z.string().min(6),
}));
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
//# sourceMappingURL=schemas.js.map