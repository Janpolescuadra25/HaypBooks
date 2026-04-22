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
        await this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'CREATE', tableName: 'Vendor', recordId: result.contactId, changes: { displayName } },
        }).catch(() => { /* non-critical */ })
        return this.normalizeVendor(result)
    }

    async updateVendor(userId: string, companyId: string, contactId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const v = await this.repo.findVendorById(wid, contactId)
        if (!v) throw new NotFoundException('Vendor not found')
        if (data.name && !data.displayName) data.displayName = data.name
        const result = await this.repo.updateVendor(wid, contactId, data)
        await this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'UPDATE', tableName: 'Vendor', recordId: contactId, changes: data },
        }).catch(() => { /* non-critical */ })
        return this.normalizeVendor(result)
    }

    async deleteVendor(userId: string, companyId: string, contactId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const v = await this.repo.findVendorById(wid, contactId)
        if (!v) throw new NotFoundException('Vendor not found')
        await this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'DELETE', tableName: 'Vendor', recordId: contactId, changes: { displayName: this.normalizeVendor(v).name } },
        }).catch(() => { /* non-critical */ })
        return this.repo.softDeleteVendor(contactId)
    }

    async getVendorActivity(userId: string, companyId: string, contactId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const limit = opts.limit ? parseInt(opts.limit) : 20
        const offset = opts.offset ? parseInt(opts.offset) : 0
        const where = { tableName: 'Vendor', recordId: contactId, companyId }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            this.prisma.auditLog.count({ where }),
        ])
        return { data: logs, total }
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
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'CREATE', tableName: 'Bill', recordId: result.id, changes: { vendorId: data.vendorId, total: Number(result.total ?? 0) } },
        }).catch(() => { /* non-critical */ })
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
        const bill = await this.repo.findBillById(companyId, billId)
        if (!bill) throw new NotFoundException('Bill not found')
        if (bill.status !== 'DRAFT') throw new BadRequestException('Only draft bills can be approved')

        const result = await this.prisma.$transaction(async (tx) => {
            await this.subLedger.postBillToGL(billId, userId, tx)
            return tx.bill.update({
                where: { id: billId },
                data: {
                    status: 'APPROVED',
                    postingStatus: 'POSTED',
                    approvedAt: new Date(),
                    billNumber: bill.billNumber ?? `BILL-${Date.now()}`,
                },
            })
        })

        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'APPROVE', tableName: 'Bill', recordId: billId, changes: { status: 'APPROVED' } },
        }).catch(() => { /* non-critical */ })
        return result
    }

    async voidBill(userId: string, companyId: string, billId: string) {
        await this.assertAccess(userId, companyId)
        const b = await this.repo.findBillById(companyId, billId)
        if (!b) throw new NotFoundException('Bill not found')
        if (b.status === 'CANCELLED') throw new BadRequestException('Bill is already void')
        if (Number(b.total) - Number(b.balance) > 0) throw new BadRequestException('Cannot void a bill that has payments applied')
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'VOID', tableName: 'Bill', recordId: billId, changes: { status: 'CANCELLED' } },
        }).catch(() => { /* non-critical */ })
        return this.repo.voidBill(companyId, billId)
    }

    async getBillActivity(userId: string, companyId: string, billId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const limit = opts.limit ? parseInt(opts.limit) : 20
        const offset = opts.offset ? parseInt(opts.offset) : 0
        const where = { tableName: 'Bill', recordId: billId, companyId }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            this.prisma.auditLog.count({ where }),
        ])
        return { data: logs, total }
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

    async recordPayment(userId: string, companyId: string, billId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const bill = await this.repo.findBillById(companyId, billId)
        if (!bill) throw new NotFoundException('Bill not found')
        if (bill.status !== 'APPROVED') throw new BadRequestException('Only approved bills can be paid')

        const amount = Number(data.amount ?? 0)
        if (!amount || amount <= 0) throw new BadRequestException('amount must be greater than 0')

        const balance = Number(bill.balance ?? bill.total ?? 0)
        if (amount > balance + 0.01) throw new BadRequestException('Payment amount cannot exceed outstanding balance')

        const workspaceId = await this.getWorkspaceId(companyId)
        const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date()
        const method = data.method ?? 'CASH'
        const result = await this.repo.recordBillPayment({
            workspaceId, companyId, billId,
            amount, paymentDate,
            method,
            referenceNumber: data.referenceNumber ?? data.reference,
            bankAccountId: data.bankAccountId,
            currency: data.currency,
            createdById: userId,
            applications: [{ billId, amount }],
        })
        await this.subLedger.postBillPaymentToGL(result.id, userId)

        await this.prisma.auditLog.create({
            data: {
                workspaceId, companyId, userId,
                action: 'PAY', tableName: 'Bill', recordId: billId,
                changes: { amount, method: method ?? 'CASH' },
            },
        }).catch(() => { /* non-critical */ })

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

    // ─── Purchase Requests ────────────────────────────────────────────────────

    async listPurchaseRequests(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findPurchaseRequests(companyId, {
            requesterId: opts.requesterId,
            status: opts.status,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getPurchaseRequest(userId: string, companyId: string, requestId: string) {
        await this.assertAccess(userId, companyId)
        const request = await this.repo.findPurchaseRequestById(companyId, requestId)
        if (!request) throw new NotFoundException('Purchase request not found')
        return request
    }

    async createPurchaseRequest(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.requesterId) throw new BadRequestException('requesterId is required')
        if (!data.lines?.length) throw new BadRequestException('At least one line item is required')
        const totalAmount = Number((data.lines ?? []).reduce((sum: number, line: any) => sum + Number(line.estimatedUnitPrice ?? 0) * Number(line.quantity ?? 1), 0))
        const payload: any = {
            workspaceId,
            companyId,
            requesterId: data.requesterId,
            status: data.status ?? 'DRAFT',
            requestDate: data.requestDate ? new Date(data.requestDate) : new Date(),
            requiredDate: data.requiredDate ? new Date(data.requiredDate) : undefined,
            totalAmount,
            purchaseOrderId: data.purchaseOrderId ?? null,
            lines: {
                create: data.lines.map((line: any) => ({
                    itemId: line.itemId ?? null,
                    description: line.description ?? '',
                    quantity: Number(line.quantity ?? 1),
                    estimatedUnitPrice: line.estimatedUnitPrice ?? null,
                    workspaceId,
                    companyId,
                })),
            },
        }
        const result = await this.repo.createPurchaseRequest(payload)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'CREATE', tableName: 'PurchaseRequest', recordId: result.id, changes: { requesterId: data.requesterId, totalAmount } },
        }).catch(() => { /* non-critical */ })
        return result
    }

    async updatePurchaseRequest(userId: string, companyId: string, requestId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findPurchaseRequestById(companyId, requestId)
        if (!existing) throw new NotFoundException('Purchase request not found')
        const payload: any = { ...data }
        if (data.lines?.length) {
            const totalAmount = Number(data.lines.reduce((sum: number, line: any) => sum + Number(line.estimatedUnitPrice ?? 0) * Number(line.quantity ?? 1), 0))
            payload.totalAmount = totalAmount
            payload.lines = data.lines
        }
        const result = await this.repo.updatePurchaseRequest(companyId, requestId, payload)
        if (!result) throw new BadRequestException('Purchase request not found or could not be updated')
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'UPDATE', tableName: 'PurchaseRequest', recordId: requestId, changes: payload },
        }).catch(() => { /* non-critical */ })
        return result
    }

    async deletePurchaseRequest(userId: string, companyId: string, requestId: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findPurchaseRequestById(companyId, requestId)
        if (!existing) throw new NotFoundException('Purchase request not found')
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'DELETE', tableName: 'PurchaseRequest', recordId: requestId, changes: {} },
        }).catch(() => { /* non-critical */ })
        return this.repo.deletePurchaseRequest(companyId, requestId)
    }

    // ─── Vendor Credits ──────────────────────────────────────────────────────

    async listVendorCredits(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findVendorCredits(companyId, {
            vendorId: opts.vendorId,
            status: opts.status,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getVendorCredit(userId: string, companyId: string, creditId: string) {
        await this.assertAccess(userId, companyId)
        const credit = await this.repo.findVendorCreditById(companyId, creditId)
        if (!credit) throw new NotFoundException('Vendor credit not found')
        return credit
    }

    async createVendorCredit(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.vendorId) throw new BadRequestException('vendorId is required')
        if (!data.lines?.length) throw new BadRequestException('At least one line item is required')
        const total = Number(data.lines.reduce((sum: number, line: any) => sum + Number(line.amount ?? 0), 0))
        const payload: any = {
            workspaceId,
            companyId,
            vendorId: data.vendorId,
            creditNumber: data.creditNumber ?? null,
            total,
            balance: total,
            issuedAt: data.issuedAt ? new Date(data.issuedAt) : new Date(),
            status: data.status ?? 'DRAFT',
            templateId: data.templateId ?? null,
            lines: {
                create: data.lines.map((line: any) => ({
                    workspaceId,
                    companyId,
                    accountId: line.accountId ?? null,
                    amount: Number(line.amount ?? 0),
                    description: line.description ?? '',
                })),
            },
        }
        const result = await this.repo.createVendorCredit(payload)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'CREATE', tableName: 'VendorCredit', recordId: result.id, changes: { vendorId: data.vendorId, total } },
        }).catch(() => { /* non-critical */ })
        return result
    }

    async updateVendorCredit(userId: string, companyId: string, creditId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findVendorCreditById(companyId, creditId)
        if (!existing) throw new NotFoundException('Vendor credit not found')
        const payload: any = { ...data }
        if (data.lines?.length) {
            const total = Number(data.lines.reduce((sum: number, line: any) => sum + Number(line.amount ?? 0), 0))
            payload.total = total
            payload.balance = total
            payload.lines = data.lines
        }
        const result = await this.repo.updateVendorCredit(companyId, creditId, payload)
        if (!result) throw new BadRequestException('Vendor credit not found or could not be updated')
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'UPDATE', tableName: 'VendorCredit', recordId: creditId, changes: payload },
        }).catch(() => { /* non-critical */ })
        return result
    }

    async deleteVendorCredit(userId: string, companyId: string, creditId: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findVendorCreditById(companyId, creditId)
        if (!existing) throw new NotFoundException('Vendor credit not found')
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'DELETE', tableName: 'VendorCredit', recordId: creditId, changes: {} },
        }).catch(() => { /* non-critical */ })
        return this.repo.deleteVendorCredit(companyId, creditId)
    }

    // ─── Receipts ────────────────────────────────────────────────────────────

    async listReceipts(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findReceipts(companyId, {
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getReceipt(userId: string, companyId: string, receiptId: string) {
        await this.assertAccess(userId, companyId)
        const receipt = await this.repo.findReceiptById(companyId, receiptId)
        if (!receipt) throw new NotFoundException('Receipt not found')
        return receipt
    }

    async createReceipt(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.fileUrl) throw new BadRequestException('fileUrl is required')
        const workspaceId = await this.getWorkspaceId(companyId)
        const payload: any = {
            workspaceId,
            companyId,
            uploadedById: userId,
            merchantName: data.merchantName ?? null,
            receiptDate: data.receiptDate ? new Date(data.receiptDate) : undefined,
            amount: data.amount ? Number(data.amount) : undefined,
            currency: data.currency ?? 'PHP',
            categoryId: data.categoryId ?? null,
            fileUrl: data.fileUrl,
            fileType: data.fileType ?? null,
            ocrData: data.ocrData ?? null,
            isMatched: data.isMatched ?? false,
            expenseId: data.expenseId ?? null,
            notes: data.notes ?? null,
        }
        const result = await this.repo.createReceipt(payload)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'CREATE', tableName: 'Receipt', recordId: result.id, changes: { fileUrl: payload.fileUrl, amount: payload.amount } },
        }).catch(() => { /* non-critical */ })
        return result
    }

    async updateReceipt(userId: string, companyId: string, receiptId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findReceiptById(companyId, receiptId)
        if (!existing) throw new NotFoundException('Receipt not found')
        const payload: any = {
            merchantName: data.merchantName ?? existing.merchantName,
            receiptDate: data.receiptDate ? new Date(data.receiptDate) : existing.receiptDate,
            amount: data.amount !== undefined ? Number(data.amount) : existing.amount,
            currency: data.currency ?? existing.currency,
            categoryId: data.categoryId ?? existing.categoryId,
            fileUrl: data.fileUrl ?? existing.fileUrl,
            fileType: data.fileType ?? existing.fileType,
            ocrData: data.ocrData ?? existing.ocrData,
            isMatched: data.isMatched ?? existing.isMatched,
            expenseId: data.expenseId ?? existing.expenseId,
            notes: data.notes ?? existing.notes,
        }
        const result = await this.repo.updateReceipt(companyId, receiptId, payload)
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'UPDATE', tableName: 'Receipt', recordId: receiptId, changes: payload },
        }).catch(() => { /* non-critical */ })
        return result
    }

    async deleteReceipt(userId: string, companyId: string, receiptId: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findReceiptById(companyId, receiptId)
        if (!existing) throw new NotFoundException('Receipt not found')
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'DELETE', tableName: 'Receipt', recordId: receiptId, changes: {} },
        }).catch(() => { /* non-critical */ })
        return this.repo.deleteReceipt(companyId, receiptId)
    }

    // ─── Mileage Logs ────────────────────────────────────────────────────────

    async listMileageLogs(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findMileageLogs(companyId, {
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getMileageLog(userId: string, companyId: string, logId: string) {
        await this.assertAccess(userId, companyId)
        const log = await this.repo.findMileageLogById(companyId, logId)
        if (!log) throw new NotFoundException('Mileage log not found')
        return log
    }

    async createMileageLog(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.logDate) throw new BadRequestException('logDate is required')
        if (data.miles === undefined) throw new BadRequestException('miles is required')
        if (data.ratePerMile === undefined) throw new BadRequestException('ratePerMile is required')
        const amount = data.amount !== undefined ? Number(data.amount) : Number(data.miles) * Number(data.ratePerMile)
        const payload: any = {
            workspaceId,
            companyId,
            userId: data.userId ?? userId,
            employeeId: data.employeeId ?? null,
            logDate: new Date(data.logDate),
            fromLocation: data.fromLocation ?? null,
            toLocation: data.toLocation ?? null,
            miles: Number(data.miles),
            ratePerMile: Number(data.ratePerMile),
            amount,
            purpose: data.purpose ?? null,
            isBillable: data.isBillable ?? false,
            customerId: data.customerId ?? null,
            projectId: data.projectId ?? null,
            status: data.status ?? 'draft',
        }
        const result = await this.repo.createMileageLog(payload)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'CREATE', tableName: 'MileageLog', recordId: result.id, changes: { amount, miles: payload.miles } },
        }).catch(() => { /* non-critical */ })
        return result
    }

    async updateMileageLog(userId: string, companyId: string, logId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findMileageLogById(companyId, logId)
        if (!existing) throw new NotFoundException('Mileage log not found')
        const payload: any = {
            employeeId: data.employeeId ?? existing.employeeId,
            userId: data.userId ?? existing.userId,
            logDate: data.logDate ? new Date(data.logDate) : existing.logDate,
            fromLocation: data.fromLocation ?? existing.fromLocation,
            toLocation: data.toLocation ?? existing.toLocation,
            miles: data.miles !== undefined ? Number(data.miles) : Number(existing.miles),
            ratePerMile: data.ratePerMile !== undefined ? Number(data.ratePerMile) : Number(existing.ratePerMile),
            amount: data.amount !== undefined ? Number(data.amount) : Number(existing.amount),
            purpose: data.purpose ?? existing.purpose,
            isBillable: data.isBillable ?? existing.isBillable,
            customerId: data.customerId ?? existing.customerId,
            projectId: data.projectId ?? existing.projectId,
            status: data.status ?? existing.status,
        }
        const result = await this.repo.updateMileageLog(companyId, logId, payload)
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'UPDATE', tableName: 'MileageLog', recordId: logId, changes: payload },
        }).catch(() => { /* non-critical */ })
        return result
    }

    async deleteMileageLog(userId: string, companyId: string, logId: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findMileageLogById(companyId, logId)
        if (!existing) throw new NotFoundException('Mileage log not found')
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'DELETE', tableName: 'MileageLog', recordId: logId, changes: {} },
        }).catch(() => { /* non-critical */ })
        return this.repo.deleteMileageLog(companyId, logId)
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
