import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class FinancialServicesService {
    constructor(private readonly prisma: PrismaService) { }

    private async assertAccess(userId: string, companyId: string): Promise<void> {
        const member = await this.prisma.workspaceUser.findFirst({
            where: { status: 'ACTIVE', userId, workspace: { companies: { some: { id: companyId } } } },
        })
        if (!member) throw new ForbiddenException('Access denied')
    }

    private async getWorkspaceId(companyId: string): Promise<string> {
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
        if (!company) throw new NotFoundException('Company not found')
        return company.workspaceId
    }

    // ─── Revenue Forecast ─────────────────────────────────────────────────────

    async getRevenueForecast(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.cashFlowForecast.findMany({
            where: {
                companyId,
                ...(opts.scenario ? { scenario: opts.scenario } : {}),
            },
            include: {
                items: {
                    select: {
                        id: true,
                        category: true,
                        description: true,
                        amount: true,
                        date: true,
                        isActual: true,
                    },
                },
            },
            orderBy: { periodStart: 'desc' },
            take: 20,
        }).catch(() => [])
    }

    // ─── Cash Flow ────────────────────────────────────────────────────────────

    async getCashFlow(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const [forecasts, actuals] = await Promise.all([
            this.prisma.cashFlowForecast.findMany({
                where: { companyId },
                include: { items: true },
                orderBy: { periodStart: 'desc' },
                take: 12,
            }).catch(() => []),
            this.prisma.bankTransaction.findMany({
                where: {
                    workspaceId: wid,
                    ...(opts.from ? { date: { gte: new Date(opts.from) } } : {}),
                    ...(opts.to ? { date: { lte: new Date(opts.to) } } : {}),
                },
                include: { bankAccount: { select: { id: true, name: true } } },
                orderBy: { date: 'desc' },
                take: 100,
            }).catch(() => []),
        ])
        return { forecasts, actuals }
    }

    // ─── Loans ────────────────────────────────────────────────────────────────

    async getLoans(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.businessLoan.findMany({
            where: {
                companyId,
                ...(opts.status ? { status: opts.status } : {}),
            },
            orderBy: [{ status: 'asc' }, { maturityDate: 'asc' }],
            take: 100,
        }).catch(() => [])
    }

    // ─── Credit Lines ─────────────────────────────────────────────────────────

    async getCreditLines(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.prisma.creditLine.findMany({
            where: {
                companyId,
                ...(opts.status ? { status: opts.status } : {}),
            },
            orderBy: [{ status: 'asc' }, { maturityDate: 'asc' }],
            take: 100,
        }).catch(() => [])
    }

    // ─── Investments ──────────────────────────────────────────────────────────

    async getInvestments(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        // Revenue recognition schedules as a proxy for investment/income streams
        return this.prisma.revenueSchedule.findMany({
            where: {
                companyId,
                ...(opts.status ? { status: opts.status } : {}),
            },
            orderBy: { startDate: 'desc' },
            take: 50,
        }).catch(() => [])
    }

    // ─── Bank Accounts ────────────────────────────────────────────────────────

    async getBankAccounts(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        return this.prisma.bankAccount.findMany({
            where: {
                workspaceId: wid,
                deletedAt: null,
            },
            orderBy: { name: 'asc' },
            take: 50,
        }).catch(() => [])
    }

    // ─── Transactions ─────────────────────────────────────────────────────────

    async getTransactions(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        return this.prisma.bankTransaction.findMany({
            where: {
                workspaceId: wid,
                ...(opts.accountId ? { bankAccountId: opts.accountId } : {}),
                ...(opts.from ? { date: { gte: new Date(opts.from) } } : {}),
                ...(opts.to ? { date: { lte: new Date(opts.to) } } : {}),
            },
            include: {
                bankAccount: { select: { id: true, name: true } },
            },
            orderBy: { date: 'desc' },
            take: 100,
        }).catch(() => [])
    }

    // ─── Checking Account ─────────────────────────────────────────────────────

    async getCheckingAccount(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        return this.prisma.bankAccount.findMany({
            where: { workspaceId: wid, deletedAt: null },
            orderBy: { name: 'asc' },
            take: 50,
        }).catch(() => [])
    }

    // ─── Savings Accounts ─────────────────────────────────────────────────────

    async getSavingsAccounts(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        return this.prisma.bankAccount.findMany({
            where: { workspaceId: wid, deletedAt: null },
            orderBy: { name: 'asc' },
            take: 50,
        }).catch(() => [])
    }

    // ─── Merchant Services ────────────────────────────────────────────────────

    async getMerchantServices(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.creditLine.findMany({
            where: { companyId },
            orderBy: [{ status: 'asc' }, { maturityDate: 'asc' }],
            take: 50,
        }).catch(() => [])
    }

    // ─── Cash Runway ──────────────────────────────────────────────────────────

    async getCashRunway(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        const forecasts = await this.prisma.cashFlowForecast.findMany({
            where: { companyId },
            include: { items: true },
            orderBy: { periodStart: 'asc' },
            take: 24,
        }).catch(() => [])
        return { forecasts, runway: forecasts.length }
    }

    // ─── Credit Score ─────────────────────────────────────────────────────────

    async getCreditScore(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const [loans, creditLines] = await Promise.all([
            this.prisma.businessLoan.findMany({ where: { companyId } }).catch(() => []),
            this.prisma.creditLine.findMany({ where: { companyId } }).catch(() => []),
        ])
        return { loans, creditLines, totalLoans: loans.length, totalLines: creditLines.length }
    }
}

