import { IsOptional, IsString, IsInt, IsIn, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class GlQueryDto {
    /** ISO date string — lower bound for journal entry date */
    @IsOptional()
    @IsString()
    from?: string

    /** ISO date string — upper bound for journal entry date */
    @IsOptional()
    @IsString()
    to?: string

    /** Filter to a single account by UUID */
    @IsOptional()
    @IsString()
    accountId?: string

    /** Prefix search on account code, e.g. "1010" or "1" */
    @IsOptional()
    @IsString()
    accountCode?: string

    /** Filter by account type category */
    @IsOptional()
    @IsIn(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'CONTRA_ASSET', 'CONTRA_REVENUE', 'CONTRA_EXPENSE', 'TEMPORARY_EQUITY'])
    accountCategory?: string

    /** Full-text search against journal entry description or line description */
    @IsOptional()
    @IsString()
    search?: string

    /** Exact or partial match on JE entry number */
    @IsOptional()
    @IsString()
    entryNumber?: string

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(200)
    limit?: number = 50

    /** Filter entries by transaction source type. MANUAL_JOURNAL = only hand-keyed entries. */
    @IsOptional()
    @IsIn(['ALL', 'MANUAL_JOURNAL', 'INVOICE', 'BILL', 'PAYMENT', 'BILL_PAYMENT', 'BANK_DEPOSIT', 'REFUND'])
    sourceType?: string

    /** Column to sort by. Defaults to date. */
    @IsOptional()
    @IsIn(['date', 'entryNumber', 'sourceType', 'accountName', 'debit', 'credit'])
    sortBy?: 'date' | 'entryNumber' | 'sourceType' | 'accountName' | 'debit' | 'credit'

    /** Sort direction. Defaults to desc. */
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortDir?: 'asc' | 'desc'
}
