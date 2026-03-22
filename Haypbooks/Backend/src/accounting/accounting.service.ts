import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { AccountingRepository } from './accounting.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { listTemplates, findTemplateForIndustry, writeTemplatesToDisk } from './coa-templates'

// ─── Default Chart of Accounts Templates ───────────────────────────────────
// Core account ranges are based on standard accounting conventions.
// We seed a base template (Philippine-style) and apply small industry-specific additions.

const DEFAULT_COA: Array<{
    code: string; name: string; typeKey: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'
    normalSide: 'DEBIT' | 'CREDIT'; isHeader: boolean; liquidityType?: string; parentCode?: string
}> = [
    // ── ASSETS ──────────────────────────────────────────────────────────────
    { code: '1000', name: 'Current Assets', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: true, liquidityType: 'CURRENT' },
    { code: '1010', name: 'Cash on Hand', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1020', name: 'Cash in Bank - Checking', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1030', name: 'Cash in Bank - Savings', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1040', name: 'Petty Cash Fund', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1100', name: 'Accounts Receivable', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1105', name: 'Allowance for Doubtful Accounts', typeKey: 'ASSET', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1110', name: 'Notes Receivable', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1120', name: 'Advances to Employees', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1130', name: 'Input VAT', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1140', name: 'Inventory', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1150', name: 'Prepaid Expenses', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1160', name: 'Prepaid Insurance', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1170', name: 'Undeposited Funds', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '1000' },
    { code: '1500', name: 'Fixed Assets', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: true, liquidityType: 'NON_CURRENT' },
    { code: '1510', name: 'Land', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1500' },
    { code: '1520', name: 'Buildings', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1500' },
    { code: '1525', name: 'Accumulated Depreciation - Buildings', typeKey: 'ASSET', normalSide: 'CREDIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1500' },
    { code: '1530', name: 'Furniture and Fixtures', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1500' },
    { code: '1535', name: 'Accumulated Depreciation - Furniture', typeKey: 'ASSET', normalSide: 'CREDIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1500' },
    { code: '1540', name: 'Office Equipment', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1500' },
    { code: '1545', name: 'Accumulated Depreciation - Equipment', typeKey: 'ASSET', normalSide: 'CREDIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1500' },
    { code: '1550', name: 'Vehicles', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1500' },
    { code: '1555', name: 'Accumulated Depreciation - Vehicles', typeKey: 'ASSET', normalSide: 'CREDIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1500' },
    { code: '1560', name: 'Computer Hardware', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1500' },
    { code: '1565', name: 'Accumulated Depreciation - Computers', typeKey: 'ASSET', normalSide: 'CREDIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1500' },
    { code: '1800', name: 'Other Assets', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: true, liquidityType: 'NON_CURRENT' },
    { code: '1810', name: 'Security Deposits', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1800' },
    { code: '1820', name: 'Goodwill', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '1800' },

    // ── LIABILITIES ──────────────────────────────────────────────────────────
    { code: '2000', name: 'Current Liabilities', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: true, liquidityType: 'CURRENT' },
    { code: '2010', name: 'Accounts Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2020', name: 'Accrued Expenses', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2030', name: 'Accrued Salaries and Wages', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2040', name: 'Income Tax Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2050', name: 'Output VAT Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2055', name: 'VAT Payable (Net)', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2060', name: 'Expanded Withholding Tax (EWT) Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2070', name: 'SSS Contributions Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2080', name: 'PhilHealth Contributions Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2090', name: 'PAG-IBIG (HDMF) Contributions Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2100', name: '13th Month Pay Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2110', name: 'Deferred Revenue', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2120', name: 'Customer Deposits', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2130', name: 'Short-term Loans Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2140', name: 'Credit Card Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'CURRENT', parentCode: '2000' },
    { code: '2500', name: 'Long-term Liabilities', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: true, liquidityType: 'NON_CURRENT' },
    { code: '2510', name: 'Long-term Loans Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '2500' },
    { code: '2520', name: 'Mortgage Payable', typeKey: 'LIABILITY', normalSide: 'CREDIT', isHeader: false, liquidityType: 'NON_CURRENT', parentCode: '2500' },

    // ── EQUITY ───────────────────────────────────────────────────────────────
    { code: '3000', name: "Owner's Equity", typeKey: 'EQUITY', normalSide: 'CREDIT', isHeader: true },
    { code: '3010', name: "Owner's Capital", typeKey: 'EQUITY', normalSide: 'CREDIT', isHeader: false, parentCode: '3000' },
    { code: '3020', name: "Owner's Drawings", typeKey: 'EQUITY', normalSide: 'DEBIT', isHeader: false, parentCode: '3000' },
    { code: '3030', name: 'Retained Earnings', typeKey: 'EQUITY', normalSide: 'CREDIT', isHeader: false, parentCode: '3000' },
    { code: '3040', name: 'Current Year Earnings', typeKey: 'EQUITY', normalSide: 'CREDIT', isHeader: false, parentCode: '3000' },
    { code: '3050', name: 'Opening Balance Equity', typeKey: 'EQUITY', normalSide: 'CREDIT', isHeader: false, parentCode: '3000' },

    // ── REVENUE / INCOME ─────────────────────────────────────────────────────
    { code: '4000', name: 'Operating Revenue', typeKey: 'INCOME', normalSide: 'CREDIT', isHeader: true },
    { code: '4010', name: 'Sales Revenue', typeKey: 'INCOME', normalSide: 'CREDIT', isHeader: false, parentCode: '4000' },
    { code: '4020', name: 'Service Revenue', typeKey: 'INCOME', normalSide: 'CREDIT', isHeader: false, parentCode: '4000' },
    { code: '4030', name: 'Consulting Revenue', typeKey: 'INCOME', normalSide: 'CREDIT', isHeader: false, parentCode: '4000' },
    { code: '4040', name: 'Sales Returns and Allowances', typeKey: 'INCOME', normalSide: 'DEBIT', isHeader: false, parentCode: '4000' },
    { code: '4050', name: 'Sales Discounts', typeKey: 'INCOME', normalSide: 'DEBIT', isHeader: false, parentCode: '4000' },
    { code: '4500', name: 'Other Income', typeKey: 'INCOME', normalSide: 'CREDIT', isHeader: true },
    { code: '4510', name: 'Interest Income', typeKey: 'INCOME', normalSide: 'CREDIT', isHeader: false, parentCode: '4500' },
    { code: '4520', name: 'Rental Income', typeKey: 'INCOME', normalSide: 'CREDIT', isHeader: false, parentCode: '4500' },
    { code: '4530', name: 'Gain on Sale of Assets', typeKey: 'INCOME', normalSide: 'CREDIT', isHeader: false, parentCode: '4500' },
    { code: '4540', name: 'Miscellaneous Income', typeKey: 'INCOME', normalSide: 'CREDIT', isHeader: false, parentCode: '4500' },

    // ── COST OF GOODS SOLD ───────────────────────────────────────────────────
    { code: '5000', name: 'Cost of Sales', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: true },
    { code: '5010', name: 'Cost of Goods Sold', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '5000' },
    { code: '5020', name: 'Direct Labor', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '5000' },
    { code: '5030', name: 'Direct Materials', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '5000' },
    { code: '5040', name: 'Freight and Delivery', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '5000' },

    // ── OPERATING EXPENSES ────────────────────────────────────────────────────
    { code: '6000', name: 'Operating Expenses', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: true },
    { code: '6010', name: 'Salaries and Wages', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6015', name: 'SSS Contributions - Employer', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6016', name: 'PhilHealth Contributions - Employer', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6017', name: 'PAG-IBIG Contributions - Employer', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6018', name: '13th Month Pay Expense', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6020', name: 'Rent Expense', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6030', name: 'Utilities Expense', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6040', name: 'Communication Expense', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6050', name: 'Office Supplies Expense', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6060', name: 'Advertising and Marketing', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6070', name: 'Professional Fees', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6080', name: 'Repairs and Maintenance', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6090', name: 'Depreciation Expense', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6100', name: 'Insurance Expense', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6110', name: 'Transportation and Travel', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6120', name: 'Representation and Entertainment', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6130', name: 'Bad Debts Expense', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6140', name: 'Bank Charges', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6150', name: 'Taxes and Licenses', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6160', name: 'Dues and Subscriptions', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6170', name: 'Training and Development', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '6180', name: 'Miscellaneous Expense', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '6000' },
    { code: '9000', name: 'Other Expenses', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: true },
    { code: '9010', name: 'Interest Expense', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '9000' },
    { code: '9020', name: 'Loss on Sale of Assets', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '9000' },
    { code: '9030', name: 'Foreign Exchange Loss', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '9000' },
    { code: '9040', name: 'Income Tax Expense', typeKey: 'EXPENSE', normalSide: 'DEBIT', isHeader: false, parentCode: '9000' },
]

@Injectable()
export class AccountingService {
    constructor(
        private readonly repo: AccountingRepository,
        private readonly prisma: PrismaService,
    ) { }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private async assertCompanyAccess(userId: string, companyId: string) {
        const member = await this.prisma.workspaceUser.findFirst({
            where: {
                status: 'ACTIVE',
                workspace: { companies: { some: { id: companyId } } },
                userId,
            },
        })
        if (!member) throw new ForbiddenException('Access denied to this company')
        return member
    }

    /** Public alias for controller use */
    async assertCompanyAccessPublic(userId: string, companyId: string) {
        return this.assertCompanyAccess(userId, companyId)
    }

    private async getWorkspaceId(companyId: string): Promise<string> {
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
        if (!company) throw new NotFoundException('Company not found')
        return company.workspaceId
    }

    // ─── Default COA Seeding ─────────────────────────────────────────────────
    /** Auto-seeds the default Philippine Chart of Accounts for a company if none exist */
    async assertCompanyOwner(userId: string, companyId: string) {
        const owner = await this.prisma.workspaceUser.findFirst({
            where: {
                userId,
                isOwner: true,
                status: 'ACTIVE',
                workspace: {
                    companies: { some: { id: companyId } },
                },
            },
        })
        if (!owner) throw new ForbiddenException('Only company owner can perform this action')
        return owner
    }

    async seedDefaultAccounts(companyId: string, prismaClient?: PrismaService | import('@prisma/client').Prisma.TransactionClient): Promise<{ message: string }> {
        const db = prismaClient ?? this.prisma

        const existingAccounts = await db.account.count({ where: { companyId } })
        if (existingAccounts > 0) {
            return { message: 'Default Chart of Accounts already seeded' }
        }

        const company = await db.company.findUnique({ where: { id: companyId } })
        const currency = company?.currency ?? 'USD'
        const industry = company?.industry ?? null

        // Get AccountType map
        const types = await db.accountType.findMany()
        const typeMap = new Map(types.map(t => [t.name, t.id]))
        // typeKey 'INCOME' maps to seed name 'INCOME'
        const resolve = (key: string): number | null => typeMap.get(key) ?? null

        // Select the appropriate COA template based on industry
        const template = await findTemplateForIndustry(industry)
        const coaTemplate = [...DEFAULT_COA, ...template.lines]

        // First pass: create header/parent accounts
        const codeToId = new Map<string, string>()

        const resolveLiquidity = (typeKey: string, liq?: string) => {
            if (liq === 'CURRENT') return 'CURRENT'
            if (liq === 'NON_CURRENT') return 'NON_CURRENT'
            if (typeKey === 'EQUITY' || typeKey === 'INCOME' || typeKey === 'EXPENSE') return 'NOT_APPLICABLE'
            return 'NOT_APPLICABLE'
        }

        for (const acct of coaTemplate) {
            if (!acct.isHeader) continue
            const typeId = resolve(acct.typeKey)
            if (!typeId) continue
            try {
                const created = await db.account.upsert({
                    where: { companyId_code: { companyId, code: acct.code } },
                    update: {},
                    create: {
                        companyId, code: acct.code, name: acct.name, typeId,
                        normalSide: acct.normalSide as any, isHeader: true,
                        liquidityType: resolveLiquidity(acct.typeKey, acct.liquidityType) as any,
                        specialType: 'NONE' as any, currency,
                    },
                })
                codeToId.set(acct.code, created.id)
            } catch { /* skip duplicates */ }
        }

        // Second pass: create detail accounts with parent references
        for (const acct of coaTemplate) {
            if (acct.isHeader) continue
            const typeId = resolve(acct.typeKey)
            if (!typeId) continue
            const parentId = acct.parentCode ? codeToId.get(acct.parentCode) : null
            try {
                const created = await db.account.upsert({
                    where: { companyId_code: { companyId, code: acct.code } },
                    update: {},
                    create: {
                        companyId, code: acct.code, name: acct.name, typeId,
                        normalSide: acct.normalSide as any, isHeader: false,
                        parentId: parentId ?? null,
                        liquidityType: resolveLiquidity(acct.typeKey, acct.liquidityType) as any,
                        specialType: 'NONE' as any, currency,
                    },
                })
                codeToId.set(acct.code, created.id)
            } catch { /* skip duplicates */ }
        }

        return { message: 'Default Chart of Accounts seeded successfully' }
    }


    // ─── Chart of Accounts ───────────────────────────────────────────────────
    async listAccounts(userId: string, companyId: string, opts?: { includeInactive?: boolean }) {
        await this.assertCompanyAccess(userId, companyId)
        let accounts = await this.repo.findAccounts(companyId, opts)
        // Auto-seed default COA on first access (empty company)
        if (accounts.length === 0) {
            await this.seedDefaultAccounts(companyId)
            accounts = await this.repo.findAccounts(companyId, opts)
        }
        // Normalize: flatten type object into top-level fields for frontend compatibility
        return accounts.map((acct: any) => {
            const rawType = acct.type?.name ?? acct.type?.category ?? 'OTHER'
            const rawSide = acct.normalSide ?? acct.type?.normalSide ?? 'DEBIT'
            // INCOME maps to 'Revenue' for frontend AccountType enum
            const displayType = rawType === 'INCOME' ? 'Revenue' : this.titleCase(rawType)
            return {
                ...acct,
                type: displayType,
                typeName: acct.type?.name ?? '',
                normalSide: this.titleCase(rawSide),
                subType: acct.AccountSubType?.name ?? null,
                balance: Number(acct.balance ?? 0),
                isActive: acct.isActive ?? (acct.deletedAt == null),
                isHeader: acct.isHeader ?? false,
            }
        })
    }

    async listCoaTemplates(userId: string, companyId: string): Promise<{ templates: Array<{ id: string; name: string; description: string; exampleAccounts: string[] }>; selectedTemplate: { id: string; name: string; description: string } }>;
    async listCoaTemplates(industry?: string | null): Promise<{ templates: Array<{ id: string; name: string; description: string; exampleAccounts: string[] }>; selectedTemplate: { id: string; name: string; description: string } }>;
    async listCoaTemplates(arg1?: string, arg2?: string) {
        let industry: string | null | undefined

        if (arg2 !== undefined) {
            // Called with (userId, companyId)
            const userId = arg1!
            const companyId = arg2
            await this.assertCompanyAccess(userId, companyId)
            const company = await this.prisma.company.findUnique({ where: { id: companyId } })
            industry = company?.industry ?? null
        } else {
            // Called with (industry?)
            industry = arg1
        }

        const selected = await findTemplateForIndustry(industry)
        return {
            templates: await listTemplates(),
            selectedTemplate: { id: selected.id, name: selected.name, description: selected.description },
        }
    }

    async saveCoaTemplates(templates: any[]) {
        if (!Array.isArray(templates)) throw new BadRequestException('Invalid templates payload')

        const allowedTypeKeys = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']
        const allowedNormal = ['DEBIT', 'CREDIT']

        for (const template of templates) {
            if (!template || typeof template !== 'object') throw new BadRequestException('Each template must be an object')
            const { id, name, description, industryKeywords, lines } = template
            if (!id || typeof id !== 'string') throw new BadRequestException('Template id is required and must be a string')
            if (!name || typeof name !== 'string') throw new BadRequestException('Template name is required and must be a string')
            if (!description || typeof description !== 'string') throw new BadRequestException('Template description is required and must be a string')
            if (!Array.isArray(industryKeywords)) throw new BadRequestException('Template industryKeywords must be an array')
            if (!Array.isArray(lines)) throw new BadRequestException('Template lines must be an array')

            const codes = new Set<string>()
            for (const line of lines) {
                if (!line || typeof line !== 'object') throw new BadRequestException('Each template line must be an object')
                const { code, name: lineName, typeKey, normalSide, isHeader, parentCode } = line
                if (!code || typeof code !== 'string') throw new BadRequestException('Each line must contain a string code')
                if (!/^[0-9]+$/.test(code)) throw new BadRequestException('Account code must be numeric')
                if (codes.has(code)) throw new BadRequestException(`Duplicate account code in template: ${code}`)
                codes.add(code)
                if (!lineName || typeof lineName !== 'string') throw new BadRequestException(`Line ${code} missing name`)
                if (!allowedTypeKeys.includes(typeKey)) throw new BadRequestException(`Invalid typeKey for line ${code}: ${typeKey}`)
                if (!allowedNormal.includes(normalSide)) throw new BadRequestException(`Invalid normalSide for line ${code}: ${normalSide}`)
                if (typeof isHeader !== 'boolean') throw new BadRequestException(`Line ${code} must specify isHeader true/false`)
                if (parentCode && !codes.has(parentCode) && !lines.some((l: any) => l.code === parentCode)) {
                    throw new BadRequestException(`Parent code ${parentCode} for line ${code} was not found in template`) 
                }
            }
        }

        await writeTemplatesToDisk(templates)
        return { success: true }
    }

    async getAccount(userId: string, companyId: string, accountId: string) {
        await this.assertCompanyAccess(userId, companyId)
        const acct: any = await this.repo.findAccountById(companyId, accountId)
        if (!acct) throw new NotFoundException('Account not found')
        const rawType = acct.type?.name ?? acct.type?.category ?? 'OTHER'
        const rawSide = acct.normalSide ?? acct.type?.normalSide ?? 'DEBIT'
        const displayType = rawType === 'INCOME' ? 'Revenue' : this.titleCase(rawType)
        return {
            ...acct,
            type: displayType,
            typeName: acct.type?.name ?? '',
            normalSide: this.titleCase(rawSide),
            subType: acct.AccountSubType?.name ?? null,
            balance: Number(acct.balance ?? 0),
            isActive: acct.isActive ?? (acct.deletedAt == null),
            isHeader: acct.isHeader ?? false,
        }
    }

    /** Convert 'ASSET' / 'EXPENSE' etc to 'Asset'/'Expense' for frontend display */
    private titleCase(s: string): string {
        if (!s) return s
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    }

    async listAccountTypes() {
        return this.repo.findAccountTypes()
    }

    async createAccount(userId: string, companyId: string, data: any) {
        await this.assertCompanyAccess(userId, companyId)
        // Validate code uniqueness
        const existing = await this.prisma.account.findFirst({ where: { companyId, code: data.code, deletedAt: null } })
        if (existing) throw new BadRequestException(`Account code ${data.code} already exists`)

        // Resolve typeId from type string if needed (frontend may send type name or category)
        let resolved = { ...data }

        // Normalize normalSide to DB enum format (DEBIT/CREDIT)
        if (resolved.normalSide) {
            resolved.normalSide = resolved.normalSide.toUpperCase()
        }

        if (!resolved.typeId && resolved.type) {
            let typeName = typeof resolved.type === 'string' ? resolved.type : null
            if (typeName) {
                // Map frontend "Revenue" to seed data "INCOME"
                const typeAliases: Record<string, string> = { revenue: 'INCOME', income: 'INCOME' }
                const lookupName = typeAliases[typeName.toLowerCase()] ?? typeName

                const accountType = await this.prisma.accountType.findFirst({
                    where: {
                        OR: [
                            { name: { equals: lookupName, mode: 'insensitive' as any } },
                            { name: { equals: typeName, mode: 'insensitive' as any } },
                            { category: typeName.toUpperCase() as any },
                        ],
                    },
                })
                if (accountType) {
                    resolved.typeId = accountType.id
                    if (!resolved.normalSide) resolved.normalSide = accountType.normalSide
                } else {
                    throw new BadRequestException(`Unknown account type: ${typeName}`)
                }
            }
            delete resolved.type
        }
        // Remove fields the repo doesn't accept
        delete resolved.subType
        delete resolved.isActive
        delete resolved.description

        // Handle opening balance: set initial balance on the account
        const openingBalance = resolved.openingBalance != null ? Number(resolved.openingBalance) : 0
        delete resolved.openingBalance

        const account = await this.repo.createAccount({ companyId, ...resolved })

        // If an opening balance was provided, update it
        if (openingBalance !== 0) {
            await this.prisma.account.update({
                where: { id: account.id },
                data: { balance: openingBalance },
            })
            return { ...account, balance: openingBalance }
        }

        return account
    }

    async updateAccount(userId: string, companyId: string, accountId: string, data: any) {
        await this.assertCompanyAccess(userId, companyId)
        const account = await this.repo.findAccountById(companyId, accountId)
        if (!account) throw new NotFoundException('Account not found')
        if ((account as any).isSystem) throw new ForbiddenException('System accounts cannot be modified')

        // Prevent changing type once there are transactions (balance non-zero)
        const balance = Number(account.balance ?? 0)
        const requestedTypeId = data.typeId ?? null
        if (requestedTypeId && balance !== 0 && requestedTypeId !== account.typeId) {
            throw new BadRequestException('Account type cannot be changed once the account has transactions')
        }

        // Prevent changing parent to an account that would create a cycle
        if (data.parentId) {
            if (data.parentId === accountId) {
                throw new BadRequestException('Account cannot be its own parent')
            }
            await this.assertNoParentCycle(accountId, data.parentId)
        }

        // Prevent duplicate account codes in the same company
        if (data.code && data.code !== account.code) {
            const existing = await this.prisma.account.findFirst({
                where: {
                    companyId,
                    code: data.code,
                    deletedAt: null,
                    NOT: { id: accountId },
                },
            })
            if (existing) throw new BadRequestException(`Account code ${data.code} already exists`)
        }

        return this.repo.updateAccount(companyId, accountId, data)
    }

    private async assertNoParentCycle(accountId: string, newParentId: string) {
        let currentId: string | null = newParentId
        while (currentId) {
            if (currentId === accountId) {
                throw new BadRequestException('Cannot set a child account as the parent (cycle detected)')
            }
            const parentAccount = await this.prisma.account.findUnique({
                where: { id: currentId },
                select: { parentId: true },
            })
            if (!parentAccount) break
            currentId = parentAccount.parentId
        }
    }

    async deactivateAccount(userId: string, companyId: string, accountId: string) {
        await this.assertCompanyAccess(userId, companyId)
        const account = await this.repo.findAccountById(companyId, accountId)
        if (!account) throw new NotFoundException('Account not found')
        if ((account as any).isSystem) throw new ForbiddenException('System accounts cannot be deactivated')

        // Block deactivating accounts with non-zero balance
        if (Number(account.balance) !== 0) throw new BadRequestException('Cannot deactivate an account with a non-zero balance')

        // Block deactivating parent accounts that still have active children
        const hasActiveChildren = Array.isArray(account.children) && account.children.some((c: any) => c.isActive)
        if (hasActiveChildren) throw new BadRequestException('Cannot deactivate an account that has active child accounts')

        return this.repo.softDeleteAccount(companyId, accountId, userId)
    }

    async getAccountLedger(userId: string, companyId: string, accountId: string, opts: any) {
        await this.assertCompanyAccess(userId, companyId)
        const account = await this.repo.findAccountById(companyId, accountId)
        if (!account) throw new NotFoundException('Account not found')
        const lines = await this.repo.findAccountLedger(companyId, accountId, {
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 100,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        // Calculate running balance
        let running = 0
        const normalSide = account.normalSide ?? (account.type as any)?.normalSide ?? 'DEBIT'
        return lines.map((line: any) => {
            const net = normalSide === 'DEBIT'
                ? Number(line.debit) - Number(line.credit)
                : Number(line.credit) - Number(line.debit)
            running += net
            return { ...line, runningBalance: running }
        })
    }

    // ─── Journal Entries ──────────────────────────────────────────────────────

    async listJournalEntries(userId: string, companyId: string, opts: any) {
        await this.assertCompanyAccess(userId, companyId)
        return this.repo.findJournalEntries(companyId, {
            status: opts.status,
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getJournalEntry(userId: string, companyId: string, jeId: string) {
        await this.assertCompanyAccess(userId, companyId)
        const je = await this.repo.findJournalEntryById(companyId, jeId)
        if (!je) throw new NotFoundException('Journal entry not found')
        return je
    }

    async createJournalEntry(userId: string, companyId: string, data: any) {
        await this.assertCompanyAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        try {
            return await this.repo.createJournalEntry({
                workspaceId,
                companyId,
                date: new Date(data.date),
                description: data.description,
                currency: data.currency,
                createdById: userId,
                lines: data.lines ?? [],
            })
        } catch (e: any) {
            throw new BadRequestException(e.message)
        }
    }

    async updateJournalEntry(userId: string, companyId: string, jeId: string, data: any) {
        await this.assertCompanyAccess(userId, companyId)
        try {
            const result = await this.repo.updateJournalEntry(companyId, jeId, { ...data, updatedById: userId })
            if (!result) throw new NotFoundException('Journal entry not found')
            return result
        } catch (e: any) {
            if (e.status === 404) throw e
            throw new BadRequestException(e.message)
        }
    }

    async postJournalEntry(userId: string, companyId: string, jeId: string) {
        await this.assertCompanyAccess(userId, companyId)
        try {
            const result = await this.repo.postJournalEntry(companyId, jeId, userId)
            if (!result) throw new NotFoundException('Journal entry not found')
            return result
        } catch (e: any) {
            if (e.status === 404) throw e
            throw new BadRequestException(e.message)
        }
    }

    async voidJournalEntry(userId: string, companyId: string, jeId: string, reason: string) {
        await this.assertCompanyAccess(userId, companyId)
        try {
            const result = await this.repo.voidJournalEntry(companyId, jeId, userId, reason)
            if (!result) throw new NotFoundException('Journal entry not found')
            return result
        } catch (e: any) {
            if (e.status === 404) throw e
            throw new BadRequestException(e.message)
        }
    }

    // ─── Trial Balance ────────────────────────────────────────────────────────

    async getTrialBalance(userId: string, companyId: string, asOf?: string) {
        await this.assertCompanyAccess(userId, companyId)
        const rows = await this.repo.getTrialBalance(companyId, asOf ? new Date(asOf) : undefined)
        const totalDebits = rows.reduce((s, r) => s + (Number(r.debit) > 0 ? Number(r.debit) : 0), 0)
        const totalCredits = rows.reduce((s, r) => s + (Number(r.credit) > 0 ? Number(r.credit) : 0), 0)
        const balanced = Math.abs(totalDebits - totalCredits) < 0.01
        return { rows, totalDebits, totalCredits, balanced, asOf: asOf ?? new Date().toISOString() }
    }

    async getCloseWorkflow(userId: string, companyId: string) {
        await this.assertCompanyAccess(userId, companyId)

        const accountCount = await this.repo.countAccounts(companyId)
        const draftJournalCount = await this.repo.countJournalEntries(companyId, 'DRAFT')
        const postedJournalCount = await this.repo.countJournalEntries(companyId, 'POSTED')
        const trialBalance = await this.getTrialBalance(userId, companyId)
        const periods = await this.listPeriods(userId, companyId)

        const coaCheck = accountCount > 0
        const journalEntryCheck = draftJournalCount === 0
        const trialBalanceCheck = trialBalance.balanced

        return {
            checks: {
                coa: coaCheck,
                journalEntries: journalEntryCheck,
                trialBalance: trialBalanceCheck,
            },
            steps: [
                {
                    id: 'coa',
                    name: 'Chart of Accounts',
                    status: coaCheck ? 'Completed' : 'Pending',
                    valid: coaCheck,
                    description: coaCheck ? `${accountCount} accounts configured` : 'No accounts detected',
                    action: { type: 'go', label: 'Go to COA', link: '/accounting/core-accounting/chart-of-accounts' },
                },
                {
                    id: 'journal',
                    name: 'Journal Entries',
                    status: journalEntryCheck ? 'Completed' : 'Pending',
                    valid: journalEntryCheck,
                    description: journalEntryCheck ? 'No unposted journal entries' : `${draftJournalCount} unposted journal entries`,
                    action: { type: 'go', label: 'Go to Journal', link: '/accounting/core-accounting/journal-entries' },
                },
                {
                    id: 'general-ledger',
                    name: 'General Ledger',
                    status: postedJournalCount > 0 ? 'Completed' : 'Pending',
                    description: postedJournalCount > 0 ? 'GL entries available' : 'No posted entries for ledger',
                    action: { type: 'go', label: 'View Ledger', link: '/accounting/core-accounting/general-ledger' },
                },
                {
                    id: 'trial-balance',
                    name: 'Trial Balance',
                    status: trialBalanceCheck ? 'Completed' : 'Error',
                    valid: trialBalanceCheck,
                    description: trialBalanceCheck ? 'Balanced: total debits equal total credits' : 'Debits and credits mismatch',
                    action: { type: 'go', label: 'View Trial Balance', link: '/accounting/core-accounting/trial-balance' },
                },
                {
                    id: 'period-close',
                    name: 'Period Close',
                    status: periods.length > 0 ? 'Completed' : 'Pending',
                    description: periods.length > 0 ? `Latest period found: ${(periods[periods.length - 1] as any).name ?? (periods[periods.length - 1] as any).id ?? 'Unknown'}` : 'No periods created',
                    action: { type: 'go', label: 'Manage Periods', link: '/accounting/period-close/close-checklist' },
                },
            ],
        }
    }

    // ─── Accounting Periods ───────────────────────────────────────────────────

    async listPeriods(userId: string, companyId: string) {
        await this.assertCompanyAccess(userId, companyId)
        return this.repo.findPeriods(companyId)
    }

    async createPeriod(userId: string, companyId: string, data: any) {
        await this.assertCompanyAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        return this.repo.createPeriod({
            companyId,
            workspaceId,
            name: data.name,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        })
    }

    async closePeriod(userId: string, companyId: string, periodId: string) {
        await this.assertCompanyAccess(userId, companyId)
        const result = await this.repo.closePeriod(companyId, periodId, userId)
        if (!result) throw new NotFoundException('Accounting period not found')
        return result
    }

    async reopenPeriod(userId: string, companyId: string, periodId: string) {
        await this.assertCompanyAccess(userId, companyId)
        return this.repo.reopenPeriod(companyId, periodId)
    }

    // ─── Multi-Currency Revaluation ───────────────────────────────────────────────

    async getMultiCurrencyRevaluation(userId: string, companyId: string, opts: any = {}) {
        await this.assertCompanyAccess(userId, companyId)
        // Fetch journal entries that involve foreign currency accounts as revaluation proxy
        const entries = await this.prisma.journalEntry.findMany({
            where: {
                companyId,
                ...(opts.from ? { date: { gte: new Date(opts.from) } } : {}),
                ...(opts.to ? { date: { lte: new Date(opts.to) } } : {}),
            },
            include: {
                lines: {
                    include: { account: { select: { id: true, code: true, name: true } } },
                },
            },
            orderBy: { date: 'desc' },
            take: 50,
        }).catch(() => [])
        return { entries, generatedAt: new Date().toISOString() }
    }
}
