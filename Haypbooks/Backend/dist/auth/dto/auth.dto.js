"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordDto = exports.VerifyOtpDto = exports.ForgotPasswordDto = exports.SignupDto = exports.LoginDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class SignupDto {
}
exports.SignupDto = SignupDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value),
    __metadata("design:type", String)
], SignupDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SignupDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' }),
    __metadata("design:type", String)
], SignupDto.prototype, "password", void 0);
class ForgotPasswordDto {
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class VerifyOtpDto {
}
exports.VerifyOtpDto = VerifyOtpDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ obj }) => {
        if (obj?.otpCode)
            return obj.otpCode;
        if (obj?.code)
            return String(obj.code).trim();
        return obj?.otpCode;
    }),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'OTP must be a 6-digit numeric code' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "otpCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'OTP must be a 6-digit numeric code' }),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "code", void 0);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'OTP must be a 6-digit numeric code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^[0-9]{6}$/, { message: 'OTP must be a 6-digit numeric code' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "otpCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(6, { message: 'Password must be at least 6 characters' }),
    (0, class_transformer_1.Transform)(({ obj, value }) => {
        if (value)
            return value;
        if (obj?.newPassword)
            return obj.newPassword;
        return value;
    }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=auth.dto.js.map