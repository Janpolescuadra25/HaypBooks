import { IsString, IsInt, IsIn, IsOptional, IsBoolean } from 'class-validator'

export class UpsertStatementScheduleDto {
    @IsString()
    @IsIn(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'])
    frequency: string

    @IsInt()
    @IsOptional()
    dayOfMonth?: number
}

export class UpdateStatementEmailSettingsDto {
    @IsBoolean()
    @IsOptional()
    statementEmailEnabled?: boolean

    @IsString()
    @IsIn(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'])
    @IsOptional()
    statementFrequency?: string

    @IsInt()
    @IsOptional()
    statementDayOfMonth?: number
}
