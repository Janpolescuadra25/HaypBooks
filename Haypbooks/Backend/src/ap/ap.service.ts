import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { ApRepository } from './ap.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { SubLedgerService } from '../shared/sub-ledger.service'

@Injectable()
export class ApService {
    constructor(private readonly repo: ApRepository, private readonly prisma: PrismaService, private readonly subLedger: SubLedgerService) { }

    private async getWorkspaceId(companyId: string) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
        if (!company) throw new NotFoundException('Company not found')
        return company.workspaceId
    }

    private async assertAccess(userId: string, companyId: string) {
        const member = await this.prisma.workspaceUser.findFirst({
            where: { status: 'ACTIVE', userId, workspace: { companies: { some: { id: companyId } } } },
        })
        if (!member) throw new ForbiddenException('Access denied')
    }

    // ─── Helpers: Normalization ──────────────────────────────────────────────

    private normalizeVendor(v: any) {
        return {
            ...v,
            name: v.contact?.displayName ?? v.name ?? '',
            displayName: v.contact?.displayName ?? v.name ?? '',
            email: v.contact?.contactEmails?.[0]?.email ?? v.email ?? '',
            phone: v.contact?.contactPhones?.[0]?.phone ?? v.phone ?? '',
            balance: Number(v.balance ?? 0),
        }
    }

    private normalizeBill(b: any) {
        return {
            ...b,
            total: Number(b.total ?? 0),
            amountDue: Number(b.balance ?? b.amountDue ?? 0),
            date: b.issuedAt ?? b.date,
            dueDate: b.dueAt ?? b.dueDate,
            vendorName: b.vendor?.contact?.displayName ?? b.vendorName ?? '',
            items: (b.lines ?? b.items ?? []).map((l: any) => ({
                ...l,
                unitPrice: Number(l.rate ?? l.unitPrice ?? 0),
                amount: Number(l.amount ?? 0),
            })),
        }
    }

    private normalizeBillPayment(p: any) {
        return {
            ...p,
            paymentNumber: p.referenceNumber ?? p.paymentNumber ?? '',
            date: p.paymentDate ?? p.date,
            vendorName: p.bill?.vendor?.contact?.displayName ?? p.vendorName ?? '',
            method: p.method ?? '',
        }
    }

    // ─── Vendors ──────────────────────────────────────────────────────────────

    async listVendors(userId: string, companyId: string, opts: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const vendors = await this.repo.findVendors(wid, opts)
        return vendors.map((v: any) => this.normalizeVendor(v))
    }

    async getVendor(userId: string, companyId: string, contactId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const v = await this.repo.findVendorById(wid, contactId)
        if (!v) throw new NotFoundException('Vendor not found')
        return this.normalizeVendor(v)
    }

    async createVendor(userId: string, companyId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const displayName = data.displayName || data.name
        if (!displayName) throw new BadRequestException('displayName is required')
        const result = await this.repo.createVendor(wid, { ...data, displayName })
        return this.normalizeVendor(result)
    }

    async updateVendor(userId: string, companyId: string, contactId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const v = await this.repo.findVendorById(wid, contactId)
        if (!v) throw new NotFoundException('Vendor not found')
        if (data.name && !data.displayName) data.displayName = data.name
        const result = await this.repo.updateVendor(wid, contactId, data)
        return this.normalizeVendor(result)
    }

    async deleteVendor(userId: string, companyId: string, contactId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const v = await this.repo.findVendorById(wid, contactId)
        if (!v) throw new NotFoundException('Vendor not found')
        return this.repo.softDeleteVendor(contactId)
    }

    // ─── Bills ────────────────────────────────────────────────────────────────

    async listBills(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const bills = await this.repo.findBills(companyId, {
            vendorId: opts.vendorId, status: opts.status,
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        return bills.map((b: any) => this.normalizeBill(b))
    }

    async getBill(userId: string, companyId: string, billId: string) {
        await this.assertAccess(userId, companyId)
        const b = await this.repo.findBillById(companyId, billId)
        if (!b) throw new NotFoundException('Bill not found')
        return this.normalizeBill(b)
    }

    async createBill(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.vendorId) throw new BadRequestException('vendorId is required')
        const lines = data.lines ?? data.items
        if (!lines?.length) throw new BadRequestException('At least one line item is required')
        const dueAt = data.dueAt ?? data.dueDate
        const result = await this.repo.createBill({
            workspaceId, companyId, createdById: userId,
            vendorId: data.vendorId,
            description: data.description,
            currency: data.currency,
            paymentTermId: data.paymentTermId,
            dueAt: dueAt ? new Date(dueAt) : undefined,
            lines: lines.map((l: any) => ({
                description: l.description ?? '',
                quantity: l.quantity ?? 1,
                rate: l.rate ?? l.unitPrice ?? 0,
                amount: l.amount ?? (Number(l.quantity ?? 1) * Number(l.rate ?? l.unitPrice ?? 0)),
                accountId: l.accountId ?? null,
                itemId: l.itemId ?? null,
            })),
        })
        return this.normalizeBill(result)
    }

    async updateBill(userId: string, companyId: string, billId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const result = await this.repo.updateBill(companyId, billId, data, userId)
        if (!result) throw new BadRequestException('Bill not found or not editable (only DRAFT bills can be updated)')
        return result
    }

    async approveBill(userId: string, companyId: string, billId: string) {
        await this.assertAccess(userId, companyId)
        const b = await this.repo.findBillById(companyId, billId)
        if (!b) throw new NotFoundException('Bill not found')
        if (b.status === 'APPROVED' || b.status === 'PAID') throw new BadRequestException(`Bill is already ${b.status}`)
        const result = await this.repo.approveBill(companyId, billId)
        // Post bill to the General Ledger (DR: Expense + Input VAT, CR: Accounts Payable)
        await this.subLedger.postBillToGL(billId, userId)
        return result
    }

    async voidBill(userId: string, companyId: string, billId: string) {
        await this.assertAccess(userId, companyId)
        const b = await this.repo.findBillById(companyId, billId)
        if (!b) throw new NotFoundException('Bill not found')
        if (b.status === 'CANCELLED') throw new BadRequestException('Bill is already void')
        if (Number(b.total) - Number(b.balance) > 0) throw new BadRequestException('Cannot void a bill that has payments applied')
        return this.repo.voidBill(companyId, billId)
    }

    // ─── Bill Payments ────────────────────────────────────────────────────────

    async listBillPayments(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const payments = await this.repo.findBillPayments(companyId, {
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        return payments.map((p: any) => this.normalizeBillPayment(p))
    }

    async getBillPayment(userId: string, companyId: string, paymentId: string) {
        await this.assertAccess(userId, companyId)
        const p = await this.repo.findBillPaymentById(companyId, paymentId)
        if (!p) throw new NotFoundException('Bill payment not found')
        return this.normalizeBillPayment(p)
    }

    async recordBillPayment(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.billId) throw new BadRequestException('billId is required')
        if (!data.amount || Number(data.amount) <= 0) throw new BadRequestException('amount must be greater than 0')
        const method = data.method ?? 'CASH'
        const paymentDate = data.paymentDate ?? data.date
        const totalApplied = (data.applications ?? []).reduce((s: number, a: any) => s + Number(a.amount ?? 0), 0)
        if (totalApplied > Number(data.amount) + 0.01) throw new BadRequestException(`Applied (${totalApplied}) exceeds payment amount (${data.amount})`)
        const result = await this.repo.recordBillPayment({
            workspaceId, companyId, billId: data.billId,
            amount: data.amount, paymentDate: new Date(paymentDate ?? Date.now()),
            method, referenceNumber: data.referenceNumber ?? data.reference,
            bankAccountId: data.bankAccountId, currency: data.currency,
            createdById: userId, applications: data.applications ?? [{ billId: data.billId, amount: data.amount }],
        })
        // Post bill payment to the General Ledger (DR: Accounts Payable, CR: Cash/Bank)
        await this.subLedger.postBillPaymentToGL(result.id, userId)
        return this.normalizeBillPayment(result)
    }

    async voidBillPayment(userId: string, companyId: string, paymentId: string) {
        await this.assertAccess(userId, companyId)
        const result = await this.repo.voidBillPayment(companyId, paymentId)
        if (!result) throw new NotFoundException('Bill payment not found')
        return result
    }

    // ─── Purchase Orders ──────────────────────────────────────────────────────

    async listPurchaseOrders(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findPurchaseOrders(companyId, {
            vendorId: opts.vendorId, status: opts.status,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getPurchaseOrder(userId: string, companyId: string, poId: string) {
        await this.assertAccess(userId, companyId)
        const po = await this.repo.findPurchaseOrderById(companyId, poId)
        if (!po) throw new NotFoundException('Purchase order not found')
        return po
    }

    async createPurchaseOrder(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.vendorId) throw new BadRequestException('vendorId is required')
        if (!data.lines?.length) throw new BadRequestException('At least one line item is required')
        return this.repo.createPurchaseOrder({ workspaceId, companyId, ...data, expectedAt: data.expectedAt ? new Date(data.expectedAt) : undefined })
    }

    async updatePoStatus(userId: string, companyId: string, poId: string, status: string) {
        await this.assertAccess(userId, companyId)
        const po = await this.repo.findPurchaseOrderById(companyId, poId)
        if (!po) throw new NotFoundException('Purchase order not found')
        const allowed = ['OPEN', 'PARTIAL_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED']
        if (!allowed.includes(status)) throw new BadRequestException(`Invalid status: ${status}`)
        return this.repo.updatePoStatus(companyId, poId, status)
    }

    async convertPoToBill(userId: string, companyId: string, poId: string) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        const po = await this.repo.findPurchaseOrderById(companyId, poId)
        if (!po) throw new NotFoundException('Purchase order not found')
        if (po.status === 'CLOSED' || po.status === 'CANCELLED') throw new BadRequestException('Cannot convert a closed or cancelled purchase order')
        const bill = await this.repo.convertPoToBill(companyId, workspaceId, poId, userId)
        if (!bill) throw new BadRequestException('Conversion failed')
        return bill
    }

    // ─── AP Aging ─────────────────────────────────────────────────────────────

    async getApAging(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const raw = await this.repo.getApAging(companyId)

        const summary = {
            current: raw.buckets.current,
            days1to30: raw.buckets.days1_30,
            days31to60: raw.buckets.days31_60,
            days61to90: raw.buckets.days61_90,
            over90: raw.buckets.over90,
            total: raw.buckets.current + raw.buckets.days1_30 + raw.buckets.days31_60 + raw.buckets.days61_90 + raw.buckets.over90,
        }

        // Group rows by vendor for the frontend aging table
        const vendorMap = new Map<string, any>()
        for (const row of raw.rows) {
            const vId = row.vendor?.contactId ?? row.id
            const vName = row.vendor?.contact?.displayName ?? ''
            if (!vendorMap.has(vId)) {
                vendorMap.set(vId, { vendorId: vId, vendorName: vName, current: 0, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0, total: 0 })
            }
            const entry = vendorMap.get(vId)!
            const bal = Number(row.balance ?? 0)
            const daysOverdue = row.daysOverdue ?? 0
            if (daysOverdue <= 0) entry.current += bal
            else if (daysOverdue <= 30) entry.days1to30 += bal
            else if (daysOverdue <= 60) entry.days31to60 += bal
            else if (daysOverdue <= 90) entry.days61to90 += bal
            else entry.over90 += bal
            entry.total += bal
        }

        return {
            ...raw,
            summary,
            vendors: Array.from(vendorMap.values()),
        }
    }
}
