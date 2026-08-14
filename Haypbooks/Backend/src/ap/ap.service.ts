import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { ApRepository } from './ap.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { SubLedgerService } from '../shared/sub-ledger.service'
import { AuditService } from '../audit/audit.service'

@Injectable()
export class ApService {
    private rfqStore = new Map<string, any[]>()
    private paymentRunStore = new Map<string, any[]>()

    constructor(private readonly repo: ApRepository, private readonly prisma: PrismaService, private readonly auditService: AuditService, private readonly subLedger: SubLedgerService) { }

    private getRfqState(companyId: string) {
        if (!this.rfqStore.has(companyId)) {
            this.rfqStore.set(companyId, [])
        }
        return this.rfqStore.get(companyId)!
    }

    private getPaymentRunState(companyId: string) {
        if (!this.paymentRunStore.has(companyId)) {
            this.paymentRunStore.set(companyId, [])
        }
        return this.paymentRunStore.get(companyId)!
    }

    private createId(prefix: string) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    }

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
            id: v.contactId ?? v.id,
            name: v.contact?.displayName ?? v.name ?? '',
            displayName: v.contact?.displayName ?? v.name ?? '',
            contactPerson: v.contact?.displayName ?? v.name ?? '',
            email: v.contact?.contactEmails?.[0]?.email ?? v.email ?? '',
            phone: v.contact?.contactPhones?.[0]?.phone ?? v.phone ?? '',
            address: v.contactAddress?.line1 ?? '',
            city: v.contactAddress?.city ?? '',
            balance: Number(v.balance ?? 0),
        }
    }

    private normalizeBill(b: any) {
        const items = (b.lines ?? b.items ?? []).map((l: any) => ({
            ...l,
            unitPrice: Number(l.rate ?? l.unitPrice ?? 0),
            amount: Number(l.amount ?? 0),
        }))
        const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0)
        return {
            ...b,
            total: Number(b.total ?? 0),
            subtotal,
            tax: Number(b.tax ?? 0),
            balanceDue: Number(b.balance ?? b.amountDue ?? 0),
            amountDue: Number(b.balance ?? b.amountDue ?? 0),
            date: b.issuedAt ?? b.date,
            dueDate: b.dueAt ?? b.dueDate,
            paymentTerms: b.paymentTerm?.name ?? b.paymentTerms ?? '',
            vendorName: b.vendor?.contact?.displayName ?? b.vendorName ?? '',
            items,
        }
    }

    private normalizeBillPayment(p: any) {
        return {
            ...p,
            paymentNumber: p.referenceNumber ?? p.paymentNumber ?? '',
            date: p.paymentDate ?? p.date,
            vendorName: p.bill?.vendor?.contact?.displayName ?? p.vendorName ?? '',
            method: p.method ?? '',
            status: p.status ?? (p.journalEntryId ? 'COMPLETED' : 'PENDING'),
        }
    }

    private async postBillPaymentAndReturn(payment: any, userId: string) {
        await this.subLedger.postBillPaymentToGL(payment.id, userId)
        const updatedPayment = await this.repo.updateBillPayment(payment.id, { postingStatus: 'POSTED' })
        return this.normalizeBillPayment(updatedPayment)
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
        const paymentTermId = await this.resolvePaymentTermId(wid, data.paymentTermId ?? data.paymentTerms) ?? undefined
        const result = await this.repo.createVendor(wid, { ...data, displayName, ...(paymentTermId ? { paymentTermId } : {}) })
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
        if ((data.paymentTermId || data.paymentTerms) && !data.paymentTermId) {
            data.paymentTermId = await this.resolvePaymentTermId(wid, data.paymentTermId ?? data.paymentTerms)
        }
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
        const openBills = await this.repo.countOpenBillsForVendor(companyId, contactId)
        if (openBills > 0) throw new BadRequestException('Cannot delete vendor with open bills')
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

    async getVendorStatement(userId: string, companyId: string, contactId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const vendor = await this.repo.findVendorById(wid, contactId)
        if (!vendor) throw new NotFoundException('Vendor not found')

        const asOf = opts.asOf ? new Date(opts.asOf) : new Date()
        if (Number.isNaN(asOf.getTime())) throw new BadRequestException('Invalid asOf date')

        const start = opts.start ? new Date(opts.start) : undefined
        if (opts.start && Number.isNaN(start!.getTime())) throw new BadRequestException('Invalid start date')

        const type = typeof opts.type === 'string' ? opts.type : undefined
        const asOfIso = asOf.toISOString().slice(0, 10)
        const startIso = start ? start.toISOString().slice(0, 10) : null

        const [bills, payments, credits] = await Promise.all([
            this.repo.findBills(companyId, { vendorId: contactId, to: asOf }),
            this.repo.findBillPayments(companyId, { vendorId: contactId, from: undefined, to: asOf }),
            this.repo.findVendorCredits(companyId, { vendorId: contactId, from: undefined, to: asOf }),
        ])

        const paymentApplications = payments.flatMap((payment: any) => {
            return (payment.BillPaymentApplication ?? []).map((application: any) => ({
                ...application,
                paymentId: payment.id,
                paymentDate: payment.paymentDate,
                paymentMethod: payment.method,
                paymentReference: payment.referenceNumber,
            }))
        })

        const lines: any[] = []

        for (const bill of bills) {
            const billDate = bill.issuedAt ? bill.issuedAt.toISOString().slice(0, 10) : bill.dueAt ? bill.dueAt.toISOString().slice(0, 10) : ''
            if (billDate > asOfIso) continue
            const applications = paymentApplications.filter((app: any) => app.billId === bill.id && app.paymentDate && app.paymentDate.toISOString().slice(0, 10) <= asOfIso)
            const paidAmount = applications.reduce((sum: number, app: any) => sum + Number(app.amount ?? 0), 0)
            const billBalance = Math.max(0, Number(bill.total ?? 0) - paidAmount)
            const includeBill = (() => {
                if (!type) return true
                if (type === 'open-item') return billBalance > 0
                if (type === 'transaction' || type === 'balance-forward') {
                    if (!startIso) return billDate <= asOfIso
                    return billDate >= startIso && billDate <= asOfIso
                }
                return true
            })()

            if (includeBill) {
                lines.push({
                    id: `bill_${bill.id}`,
                    date: billDate,
                    type: 'bill',
                    description: `Bill ${bill.billNumber ?? ''}`,
                    number: bill.billNumber,
                    dueDate: bill.dueAt ? bill.dueAt.toISOString().slice(0, 10) : undefined,
                    amount: Number(bill.total ?? 0),
                    impact: Number(bill.total ?? 0),
                    billBalance,
                    runningBalance: 0,
                })
            }

            for (const application of applications) {
                const paymentDate = application.paymentDate ? application.paymentDate.toISOString().slice(0, 10) : ''
                const includePayment = (() => {
                    if (type === 'open-item') return false
                    if (!startIso) return paymentDate <= asOfIso
                    return paymentDate >= startIso && paymentDate <= asOfIso
                })()
                if (!includePayment) continue
                lines.push({
                    id: `payment_${application.id}`,
                    date: paymentDate,
                    type: 'payment',
                    description: `Payment ${application.paymentReference || application.paymentId}`,
                    appliedToBillId: application.billId,
                    appliedToBillNumber: application.bill?.billNumber,
                    amount: -Number(application.amount ?? 0),
                    impact: -Number(application.amount ?? 0),
                    runningBalance: 0,
                })
            }
        }

        for (const credit of credits) {
            const creditDate = credit.issuedAt ? credit.issuedAt.toISOString().slice(0, 10) : ''
            if (creditDate > asOfIso) continue
            const includeCredit = (() => {
                if (type === 'open-item') return false
                if (!startIso) return creditDate <= asOfIso
                return creditDate >= startIso && creditDate <= asOfIso
            })()
            if (!includeCredit) continue
            lines.push({
                id: `credit_${credit.id}`,
                date: creditDate,
                type: 'vendor_credit',
                description: `Vendor Credit ${credit.creditNumber ?? ''}`,
                number: credit.creditNumber,
                remaining: Number(credit.balance ?? 0),
                amount: -Number(credit.total ?? 0),
                impact: -Number(credit.total ?? 0),
                runningBalance: 0,
            })
        }

        if (type === 'balance-forward' && startIso) {
            let priorImpact = 0
            for (const bill of bills) {
                const billDate = bill.issuedAt ? bill.issuedAt.toISOString().slice(0, 10) : bill.dueAt ? bill.dueAt.toISOString().slice(0, 10) : ''
                if (billDate && billDate < startIso) {
                    priorImpact += Number(bill.total ?? 0)
                }
            }
            for (const application of paymentApplications) {
                const paymentDate = application.paymentDate ? application.paymentDate.toISOString().slice(0, 10) : ''
                if (paymentDate && paymentDate < startIso) {
                    priorImpact -= Number(application.amount ?? 0)
                }
            }
            for (const credit of credits) {
                const creditDate = credit.issuedAt ? credit.issuedAt.toISOString().slice(0, 10) : ''
                if (creditDate && creditDate < startIso) {
                    priorImpact -= Number(credit.total ?? 0)
                }
            }
            lines.unshift({
                id: `bf_${contactId}_${startIso}`,
                date: startIso,
                type: 'balance_forward',
                description: 'Balance Forward',
                amount: priorImpact,
                impact: priorImpact,
                runningBalance: 0,
            })
        }

        const typeOrder: Record<string, number> = { bill: 0, vendor_credit: 1, payment: 2, balance_forward: -1 }
        lines.sort((a, b) => {
            const dateDiff = a.date.localeCompare(b.date)
            if (dateDiff !== 0) return dateDiff
            const order = (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9)
            if (order !== 0) return order
            return String(a.number ?? a.id ?? '').localeCompare(String(b.number ?? b.id ?? ''))
        })

        let running = 0
        for (const line of lines) {
            running += Number(line.impact ?? 0)
            line.runningBalance = Number(running.toFixed(2))
        }

        const totals = lines.reduce((acc: any, line: any) => {
            if (line.type === 'bill') acc.bills += Number(line.amount ?? 0)
            if (line.type === 'payment') acc.payments += Number(line.amount ?? 0)
            if (line.type === 'vendor_credit') acc.credits += Number(line.amount ?? 0)
            acc.net = Number((acc.bills + acc.payments + acc.credits).toFixed(2))
            return acc
        }, { bills: 0, payments: 0, credits: 0, net: 0 })

        return {
            vendorId: contactId,
            vendorName: vendor.contact?.displayName ?? (vendor as any).name ?? '',
            asOf: asOfIso,
            start: startIso,
            type,
            lines,
            totals,
        }
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

    private async resolvePaymentTermId(workspaceId: string, value?: string | null) {
        if (!value) return null
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (uuidRegex.test(value)) return value
        const term = await this.prisma.paymentTerm.findFirst({
            where: { workspaceId, name: value, isActive: true },
            select: { id: true },
        })
        return term?.id ?? null
    }

    async createBill(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.vendorId) throw new BadRequestException('vendorId is required')
        const lines = data.lines ?? data.items
        if (!lines?.length) throw new BadRequestException('At least one line item is required')
        if (lines.some((l: any) => !l.accountId)) throw new BadRequestException('Each bill line item must have an expense account assigned')
        const dueAt = data.dueAt ?? data.dueDate
        const paymentTermId = await this.resolvePaymentTermId(workspaceId, data.paymentTermId) ?? undefined
        let result
        try {
            result = await this.repo.createBill({
                workspaceId, companyId, createdById: userId,
                vendorId: data.vendorId,
                billNumber: data.billNumber?.trim() || undefined,
                billType: data.billType ?? null,
                purchaseOrderId: data.purchaseOrderId ?? null,
                description: data.description ?? null,
                memo: data.memo ?? null,
                terms: data.terms ?? null,
                internalNotes: data.internalNotes ?? null,
                discountType: data.discountType ?? null,
                currency: data.currency,
                ...(paymentTermId ? { paymentTermId } : {}),
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
        } catch (error) {
            console.error('Error creating bill', {
                companyId,
                workspaceId,
                vendorId: data.vendorId,
                billType: data.billType,
                purchaseOrderId: data.purchaseOrderId,
                dueAt,
                currency: data.currency,
                paymentTermId,
                internalNotes: data.internalNotes,
                memo: data.memo,
                terms: data.terms,
                lines: lines.map((l: any) => ({
                    description: l.description ?? '',
                    quantity: l.quantity ?? 1,
                    rate: l.rate ?? l.unitPrice ?? 0,
                    amount: l.amount ?? (Number(l.quantity ?? 1) * Number(l.rate ?? l.unitPrice ?? 0)),
                    accountId: l.accountId ?? null,
                    itemId: l.itemId ?? null,
                })),
                error: error && error.stack ? error.stack : error,
            })
            throw error
        }
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'CREATE', tableName: 'Bill', recordId: result.id, changes: { vendorId: data.vendorId, total: Number(result.total ?? 0) } },
        }).catch(() => { /* non-critical */ })
        return this.normalizeBill(result)
    }

    async updateBill(userId: string, companyId: string, billId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (data.lines && data.lines.some((l: any) => !l.accountId)) {
            throw new BadRequestException('Each bill line item must have an expense account assigned')
        }
        if (data.paymentTermId || data.paymentTerms) {
            data.paymentTermId = await this.resolvePaymentTermId(await this.getWorkspaceId(companyId), data.paymentTermId ?? data.paymentTerms)
        }
        const result = await this.repo.updateBill(companyId, billId, {
            ...data,
            billType: data.billType ?? null,
            purchaseOrderId: data.purchaseOrderId ?? null,
            memo: data.memo ?? null,
            terms: data.terms ?? null,
            internalNotes: data.internalNotes ?? null,
            discountType: data.discountType ?? undefined,
        }, userId)
        if (!result) throw new BadRequestException('Bill not found or not editable (only DRAFT bills can be updated)')
        await this.prisma.auditLog.create({
            data: {
                workspaceId: await this.getWorkspaceId(companyId),
                companyId,
                userId,
                action: 'UPDATE',
                tableName: 'Bill',
                recordId: billId,
                changes: data,
            },
        }).catch(() => {})
        return result
    }

    async deleteBill(userId: string, companyId: string, billId: string) {
        await this.assertAccess(userId, companyId)
        const bill = await this.repo.findBillById(companyId, billId)
        if (!bill) throw new NotFoundException('Bill not found')
        if (bill.status !== 'DRAFT') throw new BadRequestException('Only draft bills can be deleted')
        await this.prisma.auditLog.create({
            data: { workspaceId: await this.getWorkspaceId(companyId), companyId, userId, action: 'DELETE', tableName: 'Bill', recordId: billId, changes: { status: bill.status } },
        }).catch(() => { /* non-critical */ })
        return this.repo.deleteBill(companyId, billId)
    }

    async approveBill(userId: string, companyId: string, billId: string) {
        await this.assertAccess(userId, companyId)
        const bill = await this.repo.findBillById(companyId, billId)
        if (!bill) throw new NotFoundException('Bill not found')
        if (bill.status === 'DRAFT') throw new BadRequestException('Bill must be submitted (PENDING) before approval')
        if (bill.status !== 'PENDING') throw new BadRequestException('Only pending bills can be approved')

        const result = await this.prisma.$transaction(async (tx) => {
            await this.subLedger.postBillToGL(billId, userId, tx)
            const updatedBill = await tx.bill.update({
                where: { id: billId },
                data: {
                    status: 'APPROVED',
                    postingStatus: 'POSTED',
                    billNumber: bill.billNumber ?? await this.repo.buildBillNumber(companyId),
                    approvedAt: new Date(),
                },
            })
            await tx.approvalRequest.updateMany({
                where: { entityId: billId, status: 'PENDING' },
                data: { status: 'APPROVED' },
            })
            await tx.auditLog.create({
                data: { workspaceId: bill.workspaceId, companyId, userId, action: 'APPROVE', tableName: 'Bill', recordId: billId, changes: { status: 'APPROVED' } },
            })
            return updatedBill
        })
        return result
    }

    async submitBill(userId: string, companyId: string, billId: string) {
        await this.assertAccess(userId, companyId)
        const bill = await this.repo.findBillById(companyId, billId)
        if (!bill) throw new NotFoundException('Bill not found')
        if (!['DRAFT', 'REJECTED'].includes(bill.status)) {
            throw new BadRequestException('Only draft or rejected bills can be submitted')
        }

        const workflow = await this.prisma.approvalWorkflow.findFirst({
            where: { workspaceId: bill.workspaceId, entityType: 'BILL', isActive: true },
            orderBy: { createdAt: 'desc' },
        })

        const result = await this.prisma.$transaction(async (tx) => {
            if (workflow) {
                await tx.approvalRequest.create({
                    data: {
                        workflowId: workflow.id,
                        entityId: billId,
                        requestedById: userId,
                        status: 'PENDING',
                    },
                })
            }
            await tx.auditLog.create({
                data: { workspaceId: bill.workspaceId, companyId, userId, action: 'SUBMIT', tableName: 'Bill', recordId: billId, changes: { status: 'PENDING' } },
            })
            return tx.bill.update({
                where: { id: billId },
                data: {
                    status: 'PENDING',
                    rejectionReason: null,
                },
            })
        })
        return result
    }

    async rejectBill(userId: string, companyId: string, billId: string, reason?: string) {
        await this.assertAccess(userId, companyId)
        const bill = await this.repo.findBillById(companyId, billId)
        if (!bill) throw new NotFoundException('Bill not found')
        if (bill.status !== 'PENDING') throw new BadRequestException('Only pending bills can be rejected')

        const result = await this.prisma.$transaction(async (tx) => {
            const updatedBill = await tx.bill.update({
                where: { id: billId },
                data: {
                    status: 'REJECTED',
                    rejectionReason: reason ?? null,
                },
            })
            await tx.approvalRequest.updateMany({
                where: { entityId: billId, status: 'PENDING' },
                data: { status: 'REJECTED' },
            })
            await tx.auditLog.create({
                data: { workspaceId: bill.workspaceId, companyId, userId, action: 'REJECT', tableName: 'Bill', recordId: billId, changes: { status: 'REJECTED', reason: reason ?? '' } },
            })
            return updatedBill
        })
        return result
    }

    async unapproveBill(userId: string, companyId: string, billId: string) {
        await this.assertAccess(userId, companyId)
        const bill = await this.repo.findBillById(companyId, billId)
        if (!bill) throw new NotFoundException('Bill not found')
        if (bill.status !== 'APPROVED') throw new BadRequestException('Only approved bills can be unapproved')

        const result = await this.prisma.$transaction(async (tx) => {
            await this.subLedger.postBillReversalToGL(billId, userId, tx)
            await tx.auditLog.create({
                data: { workspaceId: bill.workspaceId, companyId, userId, action: 'UNAPPROVE', tableName: 'Bill', recordId: billId, changes: { status: 'DRAFT' } },
            })
            return tx.bill.update({
                where: { id: billId },
                data: {
                    status: 'DRAFT',
                    postingStatus: 'DRAFT',
                    approvedAt: null,
                },
            })
        })
        return result
    }

    async voidBill(userId: string, companyId: string, billId: string) {
        await this.assertAccess(userId, companyId)
        const b = await this.repo.findBillById(companyId, billId)
        if (!b) throw new NotFoundException('Bill not found')
        if (b.status === 'CANCELLED' || b.status === 'VOIDED') throw new BadRequestException('Bill is already void')
        if (Number(b.total) - Number(b.balance) > 0) throw new BadRequestException('Cannot void a bill that has payments applied')
        const workspaceId = await this.getWorkspaceId(companyId)
        return this.repo.voidBill(companyId, billId, { workspaceId, userId })
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
            vendorId: opts.vendorId,
            status: opts.status,
            postingStatus: opts.postingStatus,
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
        if (data.bankAccountId) {
            const bankAccount = await this.prisma.bankAccount.findFirst({ where: { id: data.bankAccountId, workspaceId, deletedAt: null } })
            if (!bankAccount) throw new BadRequestException('Invalid payment account')
        }
        const applicationLines = Array.isArray(data.bills)
            ? data.bills.map((b: any) => ({ billId: b.billId, amount: Number(b.paymentAmount ?? b.amount ?? 0) }))
            : undefined
        const applications = data.applications ?? applicationLines ?? []
        if (!data.billId && applications.length > 0) {
            data.billId = applications[0].billId
        }
        if (!data.billId) throw new BadRequestException('billId is required')
        if (!data.amount || Number(data.amount) <= 0) throw new BadRequestException('amount must be greater than 0')
        const method = data.method ?? 'CASH'
        const paymentDate = data.paymentDate ?? data.date
        const totalApplied = applications.reduce((s: number, a: any) => s + Number(a.amount ?? 0), 0)
        if (totalApplied > Number(data.amount) + 0.01) throw new BadRequestException(`Applied (${totalApplied}) exceeds payment amount (${data.amount})`)
        const applicationBillIds = applications.map((a: any) => a.billId).filter(Boolean)
        const billIds = Array.from(new Set([data.billId, ...applicationBillIds]))
        if (billIds.length === 0) {
            throw new BadRequestException('Bill ID is required for payment recording')
        }

        const bills = await this.prisma.bill.findMany({
            where: { id: { in: billIds }, companyId, deletedAt: null },
            select: { id: true, status: true, balance: true, total: true },
        }) as Array<{ id: string; status: string; balance: any; total: any }>

        if (bills.length !== billIds.length) {
            throw new NotFoundException('One or more bills referenced by this payment were not found')
        }

        const billMap = new Map(bills.map((bill) => [bill.id, bill]))
        const primaryBill = billMap.get(data.billId)
        if (!primaryBill) {
            throw new NotFoundException('Primary bill not found')
        }
        if (!['APPROVED', 'PARTIALLY_PAID', 'OVERDUE'].includes(primaryBill.status)) {
            throw new BadRequestException(`Cannot record payment for bills with status ${primaryBill.status}`)
        }

        for (const application of applications) {
            const bill = billMap.get(application.billId)
            if (!bill) continue
            if (!['APPROVED', 'PARTIALLY_PAID', 'OVERDUE'].includes(bill.status)) {
                throw new BadRequestException(`Cannot apply payment to a bill with status ${bill.status}`)
            }
            const applicationAmount = Number(application.amount ?? 0)
            if (applicationAmount <= 0) {
                throw new BadRequestException('Each payment application must be greater than 0')
            }
            if (applicationAmount > Number(bill.balance) + 0.01) {
                throw new BadRequestException(`Payment application for bill ${bill.id} exceeds its outstanding balance`)
            }
        }

        const result = await this.repo.recordBillPayment({
            workspaceId, companyId, billId: data.billId,
            amount: data.amount, paymentDate: new Date(paymentDate ?? Date.now()),
            method, referenceNumber: data.referenceNumber ?? data.reference,
            bankAccountId: data.bankAccountId, currency: data.currency,
            createdById: userId, applications,
        })
        return this.postBillPaymentAndReturn(result, userId)
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
        if (data.bankAccountId) {
            const bankAccount = await this.prisma.bankAccount.findFirst({ where: { id: data.bankAccountId, workspaceId, deletedAt: null } })
            if (!bankAccount) throw new BadRequestException('Invalid payment account')
        }
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

        const postedResult = await this.postBillPaymentAndReturn(result, userId)

        await this.prisma.auditLog.create({
            data: {
                workspaceId, companyId, userId,
                action: 'PAY', tableName: 'Bill', recordId: billId,
                changes: { amount, method: method ?? 'CASH' },
            },
        }).catch(() => { /* non-critical */ })

        return postedResult
    }

    async voidBillPayment(userId: string, companyId: string, paymentId: string) {
        await this.assertAccess(userId, companyId)
        const payment = await this.prisma.billPayment.findFirst({ where: { id: paymentId, companyId } })
        if (!payment) throw new NotFoundException('Bill payment not found')
        if (payment.postingStatus !== 'POSTED') {
            throw new BadRequestException('Only posted bill payments can be voided')
        }

        const workspaceId = await this.getWorkspaceId(companyId)
        this.auditService.log({
            workspaceId,
            companyId,
            userId,
            entityType: 'BillPayment',
            entityId: paymentId,
            action: 'VOIDED',
            oldValue: { status: (payment as any).status, postingStatus: payment.postingStatus },
            newValue: { status: 'VOIDED', postingStatus: 'VOIDED' },
            metadata: { reason: 'void' },
        }).catch(() => {})

        return this.prisma.$transaction(async (tx) => {
            await this.subLedger.postBillPaymentReversalToGL(paymentId, tx)
            const result = await this.repo.voidBillPayment(companyId, paymentId, tx)
            if (!result) throw new NotFoundException('Bill payment not found')
            return result
        })
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
        return this.repo.updatePoStatus(companyId, poId, status as any)
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

    async deletePurchaseOrder(userId: string, companyId: string, poId: string) {
        await this.assertAccess(userId, companyId)
        const po = await this.prisma.purchaseOrder.findUnique({ where: { id: poId } })
        if (!po || po.companyId !== companyId) throw new NotFoundException('Purchase order not found')
        return this.prisma.purchaseOrder.delete({ where: { id: poId } })
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
        const totalAmount = Number((data.lines ?? []).reduce((sum: number, line: any) => sum + Number(line.unitPrice ?? line.estimatedUnitPrice ?? 0) * Number(line.quantity ?? 1), 0))
        const payload: any = {
            workspaceId,
            companyId,
            requestNumber: data.requestNumber ?? null,
            requesterId: data.requesterId,
            vendorId: data.vendorId ?? null,
            status: data.status ?? 'DRAFT',
            requestDate: data.requestDate ? new Date(data.requestDate) : new Date(),
            requiredDate: data.requiredDate ? new Date(data.requiredDate) : undefined,
            priority: data.priority ?? null,
            departmentId: data.departmentId ?? null,
            locationId: data.locationId ?? null,
            reason: data.reason ?? null,
            notes: data.notes ?? null,
            internalNotes: data.internalNotes ?? null,
            totalAmount,
            purchaseOrderId: data.purchaseOrderId ?? null,
            lines: {
                create: data.lines.map((line: any) => ({
                    itemId: line.itemId ?? null,
                    accountId: line.accountId ?? null,
                    description: line.description ?? '',
                    quantity: Number(line.quantity ?? 1),
                    estimatedUnitPrice: line.unitPrice ?? line.estimatedUnitPrice ?? null,
                    taxRate: line.taxRate ?? null,
                    amount: line.amount ?? null,
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
            const totalAmount = Number(data.lines.reduce((sum: number, line: any) => sum + Number(line.unitPrice ?? line.estimatedUnitPrice ?? 0) * Number(line.quantity ?? 1), 0))
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
            postingStatus: opts.postingStatus,
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
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
            creditType: data.creditType ?? null,
            referenceBillNumber: data.referenceBillNumber ?? null,
            memo: data.memo ?? null,
            notes: data.notes ?? null,
            attachments: data.attachments ?? null,
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
        const payload: any = {
            ...data,
            vendorId: data.vendorId ?? null,
            creditType: data.creditType ?? null,
            referenceBillNumber: data.referenceBillNumber ?? null,
            memo: data.memo ?? null,
            notes: data.notes ?? null,
            attachments: data.attachments ?? null,
        }
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
        if (existing.postingStatus === 'POSTED') {
            throw new BadRequestException('Posted vendor credit cannot be deleted')
        }
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'DELETE', tableName: 'VendorCredit', recordId: creditId, changes: {} },
        }).catch(() => { /* non-critical */ })
        return this.repo.deleteVendorCredit(companyId, creditId)
    }

    async applyVendorCredit(userId: string, companyId: string, creditId: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findVendorCreditById(companyId, creditId)
        if (!existing) throw new NotFoundException('Vendor credit not found')
        if (existing.status === 'APPLIED') {
            throw new BadRequestException('Vendor credit has already been applied')
        }
        const workspaceId = await this.getWorkspaceId(companyId)
        const result = await this.prisma.$transaction(async (tx) => {
            await this.subLedger.postVendorCreditToGL(creditId, userId, tx)
            await tx.auditLog.create({
                data: { workspaceId, companyId, userId, action: 'UPDATE', tableName: 'VendorCredit', recordId: creditId, changes: { status: 'APPLIED' } },
            })
            return tx.vendorCredit.update({ where: { id: creditId }, data: { status: 'APPLIED', postingStatus: 'POSTED' } })
        })
        return result
    }

    async voidVendorCredit(userId: string, companyId: string, creditId: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findVendorCreditById(companyId, creditId)
        if (!existing) throw new NotFoundException('Vendor credit not found')
        if (existing.postingStatus !== 'POSTED') {
            throw new BadRequestException('Only posted vendor credits can be voided')
        }

        const workspaceId = await this.getWorkspaceId(companyId)
        this.auditService.log({
            workspaceId,
            companyId,
            userId,
            entityType: 'VendorCredit',
            entityId: creditId,
            action: 'VOIDED',
            oldValue: { status: existing.status, postingStatus: existing.postingStatus },
            newValue: { status: 'VOIDED', postingStatus: 'VOIDED' },
            metadata: { reason: 'void' },
        }).catch(() => {})

        return this.prisma.$transaction(async (tx) => {
            await this.subLedger.postVendorCreditReversalToGL(creditId, tx)
            return tx.vendorCredit.update({ where: { id: creditId }, data: { status: 'VOIDED', postingStatus: 'VOIDED' } })
        })
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
        const fileUrl = data.fileUrl ?? data.attachmentUrl ?? data.attachmentId
        if (!fileUrl) throw new BadRequestException('fileUrl or attachmentUrl is required')
        const workspaceId = await this.getWorkspaceId(companyId)
        const payload: any = {
            workspaceId,
            companyId,
            uploadedById: userId,
            merchantName: data.merchantName ?? data.merchant ?? null,
            receiptDate: data.receiptDate ? new Date(data.receiptDate) : undefined,
            amount: data.amount ? Number(data.amount) : undefined,
            currency: data.currency ?? 'PHP',
            categoryId: data.categoryId ?? null,
            fileUrl: fileUrl,
            fileType: data.fileType ?? null,
            ocrData: data.ocrData ?? null,
            isMatched: data.isMatched ?? false,
            expenseId: data.expenseId ?? null,
            notes: data.notes ?? null,
            employeeId: data.employeeId ?? null,
            departmentId: data.departmentId ?? null,
            isBillable: data.isBillable ?? false,
            customerId: data.customerId ?? null,
            projectId: data.projectId ?? null,
            accountId: data.accountId ?? null,
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
            merchantName: data.merchantName ?? data.merchant ?? existing.merchantName,
            receiptDate: data.receiptDate ? new Date(data.receiptDate) : existing.receiptDate,
            amount: data.amount !== undefined ? Number(data.amount) : existing.amount,
            currency: data.currency ?? existing.currency,
            categoryId: data.categoryId ?? existing.categoryId,
            fileUrl: data.fileUrl ?? data.attachmentUrl ?? data.attachmentId ?? existing.fileUrl,
            fileType: data.fileType ?? existing.fileType,
            ocrData: data.ocrData ?? existing.ocrData,
            isMatched: data.isMatched ?? existing.isMatched,
            expenseId: data.expenseId ?? existing.expenseId,
            notes: data.notes ?? existing.notes,
            employeeId: data.employeeId ?? existing.employeeId,
            departmentId: data.departmentId ?? existing.departmentId,
            isBillable: data.isBillable ?? existing.isBillable,
            customerId: data.customerId ?? existing.customerId,
            projectId: data.projectId ?? existing.projectId,
            accountId: data.accountId ?? existing.accountId,
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
        const logs = await this.repo.findMileageLogs(companyId, {
            status: opts.status,
            postingStatus: opts.postingStatus,
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        return logs.map((log) => ({
            ...log,
            date: log.logDate?.toISOString(),
            route: [log.fromLocation, log.toLocation].filter(Boolean).join(' → '),
            distanceKm: Number(log.miles ?? 0),
            rate: Number(log.ratePerMile ?? 0),
            tripDate: log.tripDate?.toISOString(),
        }))
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
        const milesValue = data.miles !== undefined ? data.miles : data.distance
        if (milesValue === undefined) throw new BadRequestException('miles or distance is required')
        const rateValue = data.ratePerMile !== undefined ? data.ratePerMile : data.rate
        if (rateValue === undefined) throw new BadRequestException('ratePerMile or rate is required')
        const amount = data.amount !== undefined ? Number(data.amount) : Number(milesValue) * Number(rateValue)
        const payload: any = {
            workspaceId,
            companyId,
            userId: data.userId ?? userId,
            employeeId: data.employeeId ?? null,
            logNumber: data.logNumber ?? null,
            logDate: new Date(data.logDate),
            tripDate: data.tripDate ? new Date(data.tripDate) : null,
            fromLocation: data.fromLocation ?? data.startLocation ?? null,
            toLocation: data.toLocation ?? data.endLocation ?? null,
            miles: Number(milesValue),
            ratePerMile: rateValue ?? 0,
            amount,
            purpose: data.purpose ?? null,
            isBillable: data.isBillable ?? data.billable ?? false,
            distanceUnit: data.distanceUnit ?? null,
            vehicle: data.vehicle ?? null,
            personalVehicle: data.personalVehicle ?? false,
            accountId: data.accountId ?? null,
            projectId: data.projectId ?? null,
            notes: data.notes ?? null,
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
            logNumber: data.logNumber ?? existing.logNumber,
            logDate: data.logDate ? new Date(data.logDate) : existing.logDate,
            tripDate: data.tripDate ? new Date(data.tripDate) : existing.tripDate,
            fromLocation: data.fromLocation ?? data.startLocation ?? existing.fromLocation,
            toLocation: data.toLocation ?? data.endLocation ?? existing.toLocation,
            miles: data.miles !== undefined ? Number(data.miles) : (data.distance !== undefined ? Number(data.distance) : Number(existing.miles)),
            ratePerMile: data.ratePerMile !== undefined ? Number(data.ratePerMile) : (data.rate !== undefined ? Number(data.rate) : Number(existing.ratePerMile)),
            amount: data.amount !== undefined ? Number(data.amount) : Number(existing.amount),
            purpose: data.purpose ?? existing.purpose,
            isBillable: data.isBillable ?? data.billable ?? existing.isBillable,
            distanceUnit: data.distanceUnit ?? existing.distanceUnit,
            vehicle: data.vehicle ?? existing.vehicle,
            personalVehicle: data.personalVehicle ?? existing.personalVehicle,
            accountId: data.accountId ?? existing.accountId,
            projectId: data.projectId ?? existing.projectId,
            notes: data.notes ?? existing.notes,
            status: data.status ?? existing.status,
        }
        const workspaceId = await this.getWorkspaceId(companyId)
        const shouldPost = data.status && String(data.status).toUpperCase() === 'APPROVED' && String(existing.status ?? '').toUpperCase() !== 'APPROVED'
        const result = shouldPost
            ? await this.prisma.$transaction(async (tx) => {
                const updatedLog = await tx.mileageLog.update({ where: { id: logId }, data: { ...payload, postingStatus: 'POSTED' } })
                await this.subLedger.postMileageToGL({
                    companyId,
                    workspaceId,
                    mileageLogId: logId,
                    amount: Number(payload.amount ?? 0),
                    accountId: payload.accountId ?? null,
                    employeeId: payload.employeeId ?? null,
                }, tx)
                return updatedLog
            })
            : await this.repo.updateMileageLog(companyId, logId, payload)

        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'UPDATE', tableName: 'MileageLog', recordId: logId, changes: payload },
        }).catch(() => { /* non-critical */ })
        return result
    }

    async listPerDiem(userId: string, companyId: string, query: any) {
        await this.assertAccess(userId, companyId)
        const claims = await this.repo.findPerDiemClaims(companyId, {
            status: query?.status,
            postingStatus: query?.postingStatus,
            limit: query?.limit ? parseInt(query.limit) : 100,
            offset: query?.offset ? parseInt(query.offset) : 0,
        })
        return claims.map((claim) => ({
            ...claim,
            employee: claim.employee ? `${claim.employee.firstName} ${claim.employee.lastName}`.trim() : '',
            total: Number(claim.totalAmount ?? 0),
            dailyRate: Number(claim.dailyRate ?? 0),
            startDate: claim.startDate?.toISOString(),
            endDate: claim.endDate?.toISOString(),
        }))
    }

    async getPerDiem(userId: string, companyId: string, perDiemId: string) {
        await this.assertAccess(userId, companyId)
        const claim = await this.repo.findPerDiemClaimById(companyId, perDiemId)
        if (!claim) throw new NotFoundException('Per diem claim not found')
        return {
            ...claim,
            employee: claim.employee ? `${claim.employee.firstName} ${claim.employee.lastName}`.trim() : '',
            total: Number(claim.totalAmount ?? 0),
            dailyRate: Number(claim.dailyRate ?? 0),
            startDate: claim.startDate?.toISOString(),
            endDate: claim.endDate?.toISOString(),
        }
    }

    async createPerDiem(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.employeeId) throw new BadRequestException('Employee is required')
        if (!data.destination) throw new BadRequestException('Destination is required')
        if (!data.startDate || !data.endDate) throw new BadRequestException('Start and end dates are required')
        if (data.dailyRate === undefined) throw new BadRequestException('Daily rate is required')
        const totalAmount = data.totalAmount !== undefined ? Number(data.totalAmount) : Number(data.days ?? 0) * Number(data.dailyRate)
        const payload: any = {
            workspaceId,
            companyId,
            employeeId: data.employeeId,
            perDiemNumber: data.perDiemNumber ?? null,
            destination: data.destination,
            purpose: data.purpose ?? null,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            days: Number(data.days ?? 0),
            dailyRate: Number(data.dailyRate),
            totalAmount,
            currency: data.currency ?? 'PHP',
            status: data.status ?? 'DRAFT',
            notes: data.notes ?? null,
            departmentId: data.departmentId ?? null,
            accountId: data.accountId ?? null,
            submittedAt: data.status === 'SUBMITTED' ? new Date() : null,
            approvedAt: data.status === 'APPROVED' ? new Date() : null,
            reimbursedAt: data.status === 'PAID' ? new Date() : null,
        }
        return this.repo.createPerDiemClaim(payload)
    }

    async updatePerDiem(userId: string, companyId: string, perDiemId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findPerDiemClaimById(companyId, perDiemId)
        if (!existing) throw new NotFoundException('Per diem claim not found')
        const payload: any = {
            employeeId: data.employeeId ?? existing.employeeId,
            perDiemNumber: data.perDiemNumber ?? existing.perDiemNumber,
            destination: data.destination ?? existing.destination,
            purpose: data.purpose ?? existing.purpose,
            startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
            endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
            days: data.days !== undefined ? Number(data.days) : existing.days,
            dailyRate: data.dailyRate !== undefined ? Number(data.dailyRate) : existing.dailyRate,
            totalAmount: data.totalAmount !== undefined ? Number(data.totalAmount) : existing.totalAmount,
            currency: data.currency ?? existing.currency,
            status: data.status ?? existing.status,
            notes: data.notes ?? existing.notes,
            departmentId: data.departmentId ?? existing.departmentId,
            accountId: data.accountId ?? existing.accountId,
            submittedAt: data.status === 'SUBMITTED' ? new Date() : existing.submittedAt,
            approvedAt: data.status === 'APPROVED' ? new Date() : existing.approvedAt,
            reimbursedAt: data.status === 'PAID' ? new Date() : existing.reimbursedAt,
        }
        const workspaceId = await this.getWorkspaceId(companyId)
        const shouldPost = data.status === 'APPROVED' && existing.status !== 'APPROVED'
        const result = shouldPost
            ? await this.prisma.$transaction(async (tx) => {
                const updatedPerDiem = await tx.perDiemClaim.update({ where: { id: perDiemId }, data: { ...payload, postingStatus: 'POSTED' } })
                await this.subLedger.postPerDiemToGL({
                    companyId,
                    workspaceId,
                    perDiemId,
                    amount: Number(payload.totalAmount ?? 0),
                    accountId: payload.accountId ?? null,
                    employeeId: payload.employeeId ?? null,
                }, tx)
                return updatedPerDiem
            })
            : await this.repo.updatePerDiemClaim(companyId, perDiemId, payload)

        await this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'UPDATE', tableName: 'PerDiemClaim', recordId: perDiemId, changes: payload },
        }).catch(() => { /* non-critical */ })
        return result
    }

    async voidMileage(userId: string, companyId: string, mileageId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.mileageLog.findFirst({ where: { id: mileageId, companyId } })
            if (!existing) throw new NotFoundException('Mileage log not found')
            if (existing.status === 'VOIDED' || existing.postingStatus === 'VOIDED') {
                throw new BadRequestException('Mileage log is already voided')
            }
            if (existing.postingStatus !== 'POSTED') {
                throw new BadRequestException('Only posted mileage logs can be voided')
            }

            const workspaceId = await this.getWorkspaceId(companyId)
            this.auditService.log({
                workspaceId,
                companyId,
                userId,
                entityType: 'MileageLog',
                entityId: mileageId,
                action: 'VOIDED',
                oldValue: { status: existing.status, postingStatus: existing.postingStatus },
                newValue: { status: 'VOIDED', postingStatus: 'VOIDED' },
                metadata: { reason: 'void' },
            }).catch(() => {})

            await this.subLedger.postMileageReversalToGL(mileageId, tx)
            const voided = await tx.mileageLog.update({ where: { id: mileageId }, data: { status: 'VOIDED', postingStatus: 'VOIDED' } })
            return voided
        })
    }

  async voidPerDiem(userId: string, companyId: string, perDiemId: string) {
    await this.assertAccess(userId, companyId)
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.perDiemClaim.findFirst({ where: { id: perDiemId, companyId } })
      if (!existing) throw new NotFoundException('Per diem claim not found')
      if (existing.status === 'VOIDED' || existing.postingStatus === 'VOIDED') {
        throw new BadRequestException('Per diem claim is already voided')
      }
      if (existing.postingStatus !== 'POSTED') {
        throw new BadRequestException('Only posted per diem claims can be voided')
      }

      const workspaceId = await this.getWorkspaceId(companyId)
      this.auditService.log({
        workspaceId,
        companyId,
        userId,
        entityType: 'PerDiem',
        entityId: perDiemId,
        action: 'VOIDED',
        oldValue: { status: existing.status, postingStatus: existing.postingStatus },
        newValue: { status: 'VOIDED', postingStatus: 'VOIDED' },
        metadata: { reason: 'void' },
      }).catch(() => {})

      await this.subLedger.postPerDiemReversalToGL(perDiemId, tx)
      const voided = await tx.perDiemClaim.update({ where: { id: perDiemId }, data: { status: 'VOIDED', postingStatus: 'VOIDED' } })
      return voided
    })
  }

  async deletePerDiem(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.perDiemClaim.findUnique({ where: { id } })
        if (!existing || existing.companyId !== companyId) throw new NotFoundException('Per diem not found')
        if (!['DRAFT'].includes(existing.status)) {
            throw new BadRequestException('Only draft per diems can be deleted')
        }
        return this.prisma.perDiemClaim.delete({ where: { id } })
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

    // ─── RFQs (Request for Quotation) ─────────────────────────────────────────
    // In-memory RFQ support for API compatibility until a Prisma model is added.

    async listRfqs(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const rfqs = this.getRfqState(companyId)
        const search = String(opts?.search ?? '').trim().toLowerCase()
        const status = opts?.status ? String(opts.status).toUpperCase() : ''
        return rfqs.filter((rfq: any) => {
            if (status && String(rfq.status).toUpperCase() !== status) return false
            if (search) {
                const haystack = [rfq.subject, rfq.description, rfq.notes, rfq.status].join(' ').toLowerCase()
                return haystack.includes(search)
            }
            return true
        })
    }

    async getRfq(userId: string, companyId: string, rfqId: string) {
        await this.assertAccess(userId, companyId)
        const rfq = this.getRfqState(companyId).find((item: any) => item.id === rfqId)
        if (!rfq) throw new NotFoundException(`RFQ ${rfqId} not found`)
        return rfq
    }

    async createRfq(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const payload = {
            id: this.createId('rfq'),
            companyId,
            subject: data.subject ?? data.title ?? '',
            description: data.description ?? '',
            vendorId: data.vendorId ?? null,
            status: data.status ? String(data.status).toUpperCase() : 'DRAFT',
            closingDate: data.closingDate ? new Date(data.closingDate).toISOString() : new Date().toISOString(),
            notes: data.notes ?? '',
            lines: Array.isArray(data.lines) ? data.lines : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        this.getRfqState(companyId).push(payload)
        return payload
    }

    async updateRfq(userId: string, companyId: string, rfqId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const rfqs = this.getRfqState(companyId)
        const existing = rfqs.find((item: any) => item.id === rfqId)
        if (!existing) throw new NotFoundException(`RFQ ${rfqId} not found`)
        Object.assign(existing, {
            subject: data.subject ?? existing.subject,
            description: data.description ?? existing.description,
            vendorId: data.vendorId ?? existing.vendorId,
            status: data.status ? String(data.status).toUpperCase() : existing.status,
            closingDate: data.closingDate ? new Date(data.closingDate).toISOString() : existing.closingDate,
            notes: data.notes ?? existing.notes,
            lines: Array.isArray(data.lines) ? data.lines : existing.lines,
            updatedAt: new Date().toISOString(),
        })
        return existing
    }

    // ─── Recurring Bills ──────────────────────────────────────────────────────
    // TODO: Add RecurringBill Prisma model when schema is extended.

    async listRecurringBills(userId: string, companyId: string, _opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.recurringBill.findMany({
            where: { companyId },
            include: { vendor: { include: { contact: true } } },
            orderBy: { createdAt: 'desc' },
        })
    }

    async getRecurringBill(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const rb = await this.prisma.recurringBill.findUnique({
            where: { id },
            include: { vendor: { include: { contact: true } } },
        })
        if (!rb || rb.companyId !== companyId) throw new NotFoundException('Recurring bill not found')
        return rb
    }

    async createRecurringBill(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const { templateName, frequency, startDate, endDate, maxOccurrences, daysInAdvance, templateData, vendorId } = data

        return this.prisma.recurringBill.create({
            data: {
                companyId,
                workspaceId: wid,
                vendorId: vendorId || templateData?.vendorId || null,
                templateName: templateName || 'Recurring Bill',
                frequency: frequency || 'MONTHLY',
                startDate: new Date(startDate || Date.now()),
                endDate: endDate ? new Date(endDate) : null,
                maxOccurrences: maxOccurrences ? parseInt(maxOccurrences) : null,
                daysInAdvance: daysInAdvance ? parseInt(daysInAdvance) : 7,
                nextDueDate: new Date(startDate || Date.now()),
                templateData: templateData || {},
                status: 'ACTIVE',
            },
        })
    }

    async updateRecurringBill(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const rb = await this.prisma.recurringBill.findUnique({ where: { id } })
        if (!rb || rb.companyId !== companyId) throw new NotFoundException('Recurring bill not found')

        const updateData: any = { ...data }
        if (data.startDate) updateData.startDate = new Date(data.startDate)
        if (data.endDate) updateData.endDate = new Date(data.endDate)
        if (data.maxOccurrences) updateData.maxOccurrences = parseInt(data.maxOccurrences)
        if (data.daysInAdvance) updateData.daysInAdvance = parseInt(data.daysInAdvance)
        if (data.templateData) updateData.templateData = data.templateData

        return this.prisma.recurringBill.update({
            where: { id },
            data: updateData,
        })
    }

    async deleteRecurringBill(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const rb = await this.prisma.recurringBill.findUnique({ where: { id } })
        if (!rb || rb.companyId !== companyId) throw new NotFoundException('Recurring bill not found')
        return this.prisma.recurringBill.delete({ where: { id } })
    }

    // ─── Payment Runs ─────────────────────────────────────────────────────────
    // In-memory Payment Run support for API compatibility until a Prisma model is added.

    async listPaymentRuns(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const paymentRuns = this.getPaymentRunState(companyId)
        const status = opts?.status ? String(opts.status).toUpperCase() : ''
        const search = String(opts?.search ?? '').trim().toLowerCase()
        return paymentRuns.filter((run: any) => {
            if (status && String(run.status).toUpperCase() !== status) return false
            if (search) {
                const haystack = [run.runNumber, run.method, run.status].join(' ').toLowerCase()
                return haystack.includes(search)
            }
            return true
        })
    }

    async getPaymentRun(userId: string, companyId: string, runId: string) {
        await this.assertAccess(userId, companyId)
        const run = this.getPaymentRunState(companyId).find((item: any) => item.id === runId)
        if (!run) throw new NotFoundException(`Payment run ${runId} not found`)
        return run
    }

    async createPaymentRun(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const payload = {
            id: this.createId('run'),
            companyId,
            runNumber: data.runNumber ?? `RUN-${Date.now()}`,
            paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            method: data.method ?? 'ACH',
            status: data.status ? String(data.status).toUpperCase() : 'CREATED',
            vendorCount: data.vendorCount ?? 0,
            totalAmount: Number(data.totalAmount ?? 0),
            bills: Array.isArray(data.bills) ? data.bills : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        this.getPaymentRunState(companyId).push(payload)
        return payload
    }

    async updatePaymentRun(userId: string, companyId: string, runId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const run = this.getPaymentRunState(companyId).find((item: any) => item.id === runId)
        if (!run) throw new NotFoundException(`Payment run ${runId} not found`)
        Object.assign(run, {
            runNumber: data.runNumber ?? run.runNumber,
            paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString().slice(0, 10) : run.paymentDate,
            method: data.method ?? run.method,
            status: data.status ? String(data.status).toUpperCase() : run.status,
            vendorCount: data.vendorCount ?? run.vendorCount,
            totalAmount: data.totalAmount !== undefined ? Number(data.totalAmount) : run.totalAmount,
            bills: Array.isArray(data.bills) ? data.bills : run.bills,
            updatedAt: new Date().toISOString(),
        })
        return run
    }

    async processPaymentRun(userId: string, companyId: string, runId: string) {
        await this.assertAccess(userId, companyId)
        const run = this.getPaymentRunState(companyId).find((item: any) => item.id === runId)
        if (!run) throw new NotFoundException(`Payment run ${runId} not found`)
        run.status = 'COMPLETED'
        run.updatedAt = new Date().toISOString()
        return run
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
        return {
            ...raw,
            summary,
        }
    }
}
