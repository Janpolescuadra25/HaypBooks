import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { ArRepository } from './ar.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { SubLedgerService } from '../shared/sub-ledger.service'

@Injectable()
export class ArService {
    private readonly uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    constructor(
        private readonly repo: ArRepository,
        private readonly prisma: PrismaService,
        private readonly subLedger: SubLedgerService,
    ) { }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private async getWorkspaceId(companyId: string): Promise<string> {
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
        if (!company) throw new NotFoundException('Company not found')
        return company.workspaceId
    }

    private async assertAccess(userId: string, companyId: string) {
        const member = await this.prisma.workspaceUser.findFirst({
            where: { status: 'ACTIVE', userId, workspace: { companies: { some: { id: companyId } } } },
        })
        if (!member) throw new ForbiddenException('Access denied')
        return member
    }

    // ─── Helpers: Normalization ──────────────────────────────────────────────

    private normalizeCustomer(c: any) {
        return {
            ...c,
            id: c.contactId,
            name: c.contact?.displayName ?? c.name ?? '',
            displayName: c.contact?.displayName ?? c.name ?? '',
            email: c.contact?.contactEmails?.[0]?.email ?? c.email ?? '',
            phone: c.contact?.contactPhones?.[0]?.phone ?? c.phone ?? '',
            balance: Number(c.openBalance ?? c.balance ?? 0),
            openBalance: Number(c.openBalance ?? c.balance ?? 0),
            totalRevenue: Number(c.totalRevenue ?? 0),
            invoiceCount: c.invoiceCount ?? 0,
            address: c.contactAddress?.line1 ?? c.address ?? '',
            city: c.contactAddress?.city ?? c.city ?? '',
            state: c.contactAddress?.state ?? c.state ?? '',
            zip: c.contactAddress?.postalCode ?? c.zip ?? '',
            country: c.contactAddress?.country ?? c.country ?? 'US',
            status: c.deletedAt ? 'INACTIVE' : 'ACTIVE',
            groupId: c.groupId ?? null,
            groupName: c.group?.name ?? null,
            paymentTermName: c.paymentTerm?.name ?? null,
            recentInvoices: Array.isArray(c.recentInvoices)
                ? c.recentInvoices.map((inv: any) => ({
                    ...inv,
                    status: this.toApiInvoiceStatus(inv.status),
                    total: Number(inv.total ?? inv.totalAmount ?? 0),
                    balance: Number(inv.balance ?? 0),
                }))
                : c.recentInvoices,
        }
    }

    private toApiInvoiceStatus(status: string | null | undefined) {
        const normalized = String(status ?? '').toUpperCase()
        if (normalized === 'PARTIAL') return 'PARTIALLY_PAID'
        return normalized || 'DRAFT'
    }

    private normalizeInvoice(inv: any) {
        return {
            ...inv,
            status: this.toApiInvoiceStatus(inv.status),
            total: Number(inv.totalAmount ?? inv.total ?? 0),
            amountDue: Number(inv.balance ?? inv.amountDue ?? 0),
            customerName: inv.customer?.contact?.displayName ?? inv.customerName ?? '',
            items: (inv.lines ?? inv.items ?? []).map((l: any) => ({
                ...l,
                unitPrice: Number(l.unitPrice ?? l.rate ?? 0),
                amount: Number(l.totalPrice ?? l.amount ?? 0),
            })),
        }
    }

    private roundPaymentAmount(value: number) {
        return Number((Number.isFinite(value) ? value : 0).toFixed(2))
    }

    private toUiPaymentMethod(type: string | null | undefined) {
        const normalizedType = String(type ?? '').toUpperCase()
        if (normalizedType === 'CASH') return 'CASH'
        if (normalizedType === 'CHECK') return 'CHECK'
        if (normalizedType === 'CARD') return 'CREDIT_CARD'
        if (normalizedType === 'BANK') return 'BANK_TRANSFER'
        if (normalizedType === 'OTHER') return 'OTHER'
        return ''
    }

    private mapIncomingPaymentMethod(rawMethod: string): { type: 'CASH' | 'CHECK' | 'CARD' | 'BANK' | 'OTHER'; name: string } {
        const trimmed = String(rawMethod ?? '').trim()
        const normalized = trimmed.toUpperCase().replace(/[\s-]+/g, '_')

        if (normalized === 'CASH') return { type: 'CASH', name: 'Cash' }
        if (normalized === 'CHECK' || normalized === 'CHEQUE') return { type: 'CHECK', name: 'Check' }
        if (normalized === 'CARD' || normalized === 'CREDIT_CARD' || normalized === 'DEBIT_CARD') return { type: 'CARD', name: 'Card' }
        if (normalized === 'BANK' || normalized === 'BANK_TRANSFER' || normalized === 'WIRE' || normalized === 'ACH' || normalized === 'TRANSFER') {
            return { type: 'BANK', name: 'Bank Transfer' }
        }

        return { type: 'OTHER', name: trimmed.slice(0, 64) || 'Other' }
    }

    private async assertPaymentMethodInWorkspace(workspaceId: string, paymentMethodId: string, sourceField: string) {
        const method = await this.prisma.paymentMethod.findFirst({
            where: { id: paymentMethodId, workspaceId },
            select: { id: true },
        })
        if (!method) throw new BadRequestException(`${sourceField} is invalid for this workspace`)
        return method.id
    }

    private async resolvePaymentMethodId(workspaceId: string, data: any): Promise<string | null> {
        const explicitPaymentMethodId = String(data?.paymentMethodId ?? '').trim()
        if (explicitPaymentMethodId) {
            return this.assertPaymentMethodInWorkspace(workspaceId, explicitPaymentMethodId, 'paymentMethodId')
        }

        const methodInput = String(data?.method ?? '').trim()
        if (!methodInput) return null

        if (this.uuidPattern.test(methodInput)) {
            return this.assertPaymentMethodInWorkspace(workspaceId, methodInput, 'method')
        }

        const mapped = this.mapIncomingPaymentMethod(methodInput)
        const existing = await this.prisma.paymentMethod.findFirst({
            where: {
                workspaceId,
                isActive: true,
                type: mapped.type as Prisma.PaymentMethodType,
                ...(mapped.type === 'OTHER' ? { name: mapped.name } : {}),
            },
            select: { id: true },
        })
        if (existing?.id) return existing.id

        const created = await this.prisma.paymentMethod.create({
            data: {
                workspaceId,
                name: mapped.name,
                type: mapped.type as Prisma.PaymentMethodType,
                isActive: true,
            },
            select: { id: true },
        })
        return created.id
    }

    private normalizeRequestedAllocations(data: any): Array<{ invoiceId: string; amount: number }> {
        const rawAllocations = Array.isArray(data?.allocations)
            ? data.allocations
            : (Array.isArray(data?.applications) ? data.applications : [])

        if (rawAllocations.length > 0) {
            return rawAllocations.map((allocation: any) => ({
                invoiceId: String(allocation?.invoiceId ?? '').trim(),
                amount: Number(allocation?.amount ?? 0),
            }))
        }

        if (data?.invoiceId) {
            return [{ invoiceId: String(data.invoiceId).trim(), amount: Number(data.amount ?? 0) }]
        }

        return []
    }

    private normalizePaymentAllocation(allocation: any) {
        return {
            invoiceId: allocation.invoiceId ?? allocation.invoice?.id ?? '',
            amount: this.roundPaymentAmount(Number(allocation.amount ?? 0)),
            remainingBalance: this.roundPaymentAmount(Math.max(0, Number(allocation.invoice?.balance ?? allocation.remainingBalance ?? 0))),
        }
    }

    private normalizePayment(p: any) {
        const allocations = Array.isArray(p.InvoicePaymentApplication)
            ? p.InvoicePaymentApplication.map((allocation: any) => this.normalizePaymentAllocation(allocation))
            : (Array.isArray(p.allocations) ? p.allocations.map((allocation: any) => this.normalizePaymentAllocation(allocation)) : [])
        const activeDeposit = (Array.isArray(p.bankDepositLines) ? p.bankDepositLines : [])
            .map((line: any) => line?.deposit)
            .filter((deposit: any) => !!deposit && String(deposit.status ?? '').toUpperCase() !== 'VOID')
            .sort((a: any, b: any) => new Date(b.depositDate ?? 0).getTime() - new Date(a.depositDate ?? 0).getTime())[0] ?? null
        const totalAmount = this.roundPaymentAmount(Number(p.amount ?? p.totalAmount ?? 0))
        const totalAllocated = this.roundPaymentAmount(allocations.reduce((sum: number, allocation: any) => sum + Number(allocation.amount ?? 0), 0))
        const explicitUnapplied = Number(p.unappliedAmount)
        const unappliedAmount = this.roundPaymentAmount(Number.isFinite(explicitUnapplied) ? explicitUnapplied : Math.max(0, totalAmount - totalAllocated))
        const method = this.toUiPaymentMethod(p.paymentMethod?.type) || p.paymentMethodId || p.method || ''
        const isDeposited = Boolean(p.isDeposited)
        const depositStatus = isDeposited ? 'DEPOSITED' : 'UNDEPOSITED'
        const depositDate = activeDeposit?.depositDate ?? (isDeposited ? (p.paymentDate ?? p.date ?? null) : null)
        const bankAccountId = activeDeposit?.bankAccountId ?? p.bankAccountId ?? null
        const bankAccountName = activeDeposit?.bankAccount?.name ?? p.bankAccount?.name ?? ''
        const bankAccountNumber = activeDeposit?.bankAccount?.accountNumber ?? p.bankAccount?.accountNumber ?? null

        return {
            ...p,
            amount: totalAmount,
            totalAmount,
            totalAllocated,
            unappliedAmount,
            allocations,
            paymentNumber: p.referenceNumber ?? p.paymentNumber ?? '',
            date: p.paymentDate ?? p.date,
            customerName: p.customer?.contact?.displayName ?? p.customerName ?? '',
            method,
            isDeposited,
            depositStatus,
            depositId: activeDeposit?.id ?? null,
            depositNumber: activeDeposit?.referenceNumber ?? null,
            depositDate,
            depositSource: activeDeposit ? 'BANK_DEPOSIT' : (isDeposited ? 'DIRECT_TO_BANK' : 'UNDEPOSITED_FUNDS'),
            bankAccountId,
            bankAccountName,
            bankAccountNumber,
        }
    }

    private async validatePaymentAllocations(
        companyId: string,
        allocations: Array<{ invoiceId: string; amount: number }>,
        opts: {
            paymentAmount: number
            customerId?: string | null
            existingAllocatedAmount?: number
            alreadyAllocatedInvoiceIds?: Set<string>
            allocationBalanceCredits?: Map<string, number>
        },
    ) {
        if (!allocations.length) {
            return { allocations, customerId: opts.customerId ?? null }
        }

        const seenInvoiceIds = new Set<string>()
        for (const allocation of allocations) {
            if (!allocation.invoiceId) {
                throw new BadRequestException('Each allocation requires an invoiceId')
            }
            if (!Number.isFinite(allocation.amount) || allocation.amount <= 0) {
                throw new BadRequestException(`Allocation amount for invoice ${allocation.invoiceId} must be greater than 0`)
            }
            if (seenInvoiceIds.has(allocation.invoiceId)) {
                throw new BadRequestException(`Duplicate allocation for invoice ${allocation.invoiceId}`)
            }
            if (opts.alreadyAllocatedInvoiceIds?.has(allocation.invoiceId)) {
                throw new BadRequestException(`Payment is already allocated to invoice ${allocation.invoiceId}`)
            }
            seenInvoiceIds.add(allocation.invoiceId)
        }

        const invoices = await this.prisma.invoice.findMany({
            where: {
                companyId,
                deletedAt: null,
                id: { in: [...seenInvoiceIds] },
            },
            select: {
                id: true,
                customerId: true,
                balance: true,
                invoiceNumber: true,
            },
        })

        if (invoices.length !== seenInvoiceIds.size) {
            const missingInvoiceId = [...seenInvoiceIds].find((invoiceId) => !invoices.some((invoice) => invoice.id === invoiceId))
            throw new BadRequestException(`Invoice not found: ${missingInvoiceId}`)
        }

        const customerIds = new Set(invoices.map((invoice) => invoice.customerId))
        if (customerIds.size > 1) {
            throw new BadRequestException('All allocations must belong to the same customer')
        }

        const allocationCustomerId = invoices[0]?.customerId ?? null
        if (opts.customerId && allocationCustomerId && allocationCustomerId !== opts.customerId) {
            throw new BadRequestException('All allocations must belong to the payment customer')
        }

        const totalAllocated = allocations.reduce((sum, allocation) => sum + Number(allocation.amount ?? 0), 0)
        const totalAllocatedAfterRequest = totalAllocated + Number(opts.existingAllocatedAmount ?? 0)
        if (totalAllocatedAfterRequest > Number(opts.paymentAmount) + 0.01) {
            throw new BadRequestException(`Total allocated (${this.roundPaymentAmount(totalAllocatedAfterRequest)}) exceeds payment amount (${this.roundPaymentAmount(Number(opts.paymentAmount))})`)
        }

        const invoicesById = new Map(invoices.map((invoice) => [invoice.id, invoice]))
        for (const allocation of allocations) {
            const invoice = invoicesById.get(allocation.invoiceId)
            if (!invoice) continue
            const availableBalance = Number(invoice.balance) + Number(opts.allocationBalanceCredits?.get(invoice.id) ?? 0)
            if (Number(allocation.amount) > availableBalance + 0.01) {
                throw new BadRequestException(`Allocation for invoice ${invoice.invoiceNumber ?? invoice.id} exceeds remaining balance`)
            }
        }

        return { allocations, customerId: allocationCustomerId }
    }

    private async getNormalizedPaymentById(companyId: string, paymentId: string) {
        const payment = await this.repo.findPaymentById(companyId, paymentId)
        if (!payment) throw new NotFoundException('Payment not found')
        return this.normalizePayment(payment)
    }

    private toPaymentAllocationAuditSnapshot(payment: any) {
        const normalized = this.normalizePayment(payment)
        return {
            totalAllocated: normalized.totalAllocated,
            unappliedAmount: normalized.unappliedAmount,
            allocations: (normalized.allocations ?? []).map((allocation: any) => ({
                invoiceId: allocation.invoiceId,
                amount: this.roundPaymentAmount(Number(allocation.amount ?? 0)),
            })),
        }
    }

    private normalizeQuote(q: any) {
        return {
            ...q,
            quoteNumber: q.quoteNumber ?? `QT-${q.id?.slice(0, 8)}`,
            customer: q.customer?.contact?.displayName ?? q.customerName ?? '',
            customerId: q.customer?.id ?? q.customerId ?? '',
            date: q.issuedAt ?? q.date ?? null,
            expiryDate: q.expiryDate ?? null,
            amount: Number(q.totalAmount ?? 0),
            totalAmount: Number(q.totalAmount ?? 0),
            status: q.status ?? 'DRAFT',
            lineCount: q.lines?.length ?? 0,
            convertedToInvoiceId: q.convertedToInvoiceId ?? null,
            createdAt: q.createdAt ?? null,
        }
    }

    private titleCase(value: string | null | undefined) {
        if (!value) return ''
        return value
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (m) => m.toUpperCase())
    }

    private formatRecognitionMethod(method: string | null | undefined) {
        const m = String(method ?? '').toUpperCase()
        if (m === 'STRAIGHT_LINE' || m === 'STRAIGHT-LINE') return 'Straight-Line'
        if (m === 'MILESTONE') return 'Milestone'
        if (m === 'PERCENTAGE_OF_COMPLETION' || m === 'PERCENTAGE OF COMPLETION') return 'Percentage of Completion'
        if (m === 'EVENT_BASED' || m === 'EVENT-BASED') return 'Event-Based'
        return this.titleCase(m) || 'Straight-Line'
    }

    private formatRecognitionStatus(status: string | null | undefined): 'Active' | 'Completed' | 'On Hold' {
        const s = String(status ?? '').toUpperCase()
        if (s === 'COMPLETED') return 'Completed'
        if (s === 'ON_HOLD' || s === 'HOLD') return 'On Hold'
        return 'Active'
    }

    private formatDeferredFrequency(frequency: string | null | undefined): 'Monthly' | 'Quarterly' | 'Annual' | 'One-Time' {
        const f = String(frequency ?? '').toUpperCase()
        if (f === 'QUARTERLY') return 'Quarterly'
        if (f === 'ANNUAL' || f === 'YEARLY') return 'Annual'
        if (f === 'ONE_TIME' || f === 'ONE-TIME') return 'One-Time'
        return 'Monthly'
    }

    private formatDeferredStatus(status: string | null | undefined): 'Active' | 'Completed' | 'Cancelled' {
        const s = String(status ?? '').toUpperCase()
        if (s === 'COMPLETED') return 'Completed'
        if (s === 'CANCELLED' || s === 'CANCELED') return 'Cancelled'
        return 'Active'
    }

    private formatPaymentLinkStatus(status: string | null | undefined): 'Active' | 'Paid' | 'Expired' {
        const s = String(status ?? '').toUpperCase()
        if (s === 'PAID') return 'Paid'
        if (s === 'EXPIRED' || s === 'CANCELLED' || s === 'CANCELED') return 'Expired'
        return 'Active'
    }

    private normalizeRevenueRecognitionRow(row: any, customerName: string) {
        const totalContractValue = Number(row.totalContractValue ?? 0)
        const recognizedToDate = Number(row.recognizedToDate ?? 0)
        const remaining = Math.max(0, Number((totalContractValue - recognizedToDate).toFixed(2)))
        return {
            id: row.id,
            contractId: row.contractId,
            customer: customerName,
            description: row.description ?? '',
            totalContractValue,
            recognizedToDate,
            remaining,
            startDate: row.startDate instanceof Date ? row.startDate.toISOString().split('T')[0] : row.startDate,
            endDate: row.endDate instanceof Date ? row.endDate.toISOString().split('T')[0] : row.endDate,
            method: this.formatRecognitionMethod(row.method),
            status: this.formatRecognitionStatus(row.status),
            journalEntryId: row.journalEntryId ?? null,
        }
    }

    private normalizeDeferredRevenueRow(row: any, customerName: string) {
        return {
            id: row.id,
            contractId: row.contractId,
            customer: customerName,
            description: row.description ?? '',
            totalDeferredAmount: Number(row.totalDeferredAmount ?? 0),
            recognizedAmount: Number(row.recognizedAmount ?? 0),
            remainingDeferred: Number(row.remainingDeferred ?? 0),
            startDate: row.startDate instanceof Date ? row.startDate.toISOString().split('T')[0] : row.startDate,
            endDate: row.endDate instanceof Date ? row.endDate.toISOString().split('T')[0] : row.endDate,
            nextRecognitionDate: row.nextRecognitionDate instanceof Date
                ? row.nextRecognitionDate.toISOString().split('T')[0]
                : (row.nextRecognitionDate ?? '-'),
            frequency: this.formatDeferredFrequency(row.frequency),
            status: this.formatDeferredStatus(row.status),
            journalEntryId: row.journalEntryId ?? null,
        }
    }

    private async getCompanyCurrency(companyId: string) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { currency: true } })
        return company?.currency ?? 'PHP'
    }

    private async normalizePaymentLinkRow(row: any) {
        const expiresAt = row.expiresAt instanceof Date
            ? row.expiresAt.toISOString().split('T')[0]
            : (row.expiresAt ?? '-')
        const isExpired = row.expiresAt ? new Date(row.expiresAt).getTime() < Date.now() : false
        const effectiveStatus = isExpired && String(row.status ?? '').toUpperCase() === 'ACTIVE'
            ? 'EXPIRED'
            : row.status
        const currency = row.currency ?? (row.companyId ? await this.getCompanyCurrency(row.companyId) : 'PHP')

        return {
            id: row.id,
            linkId: row.linkId,
            description: row.description ?? '',
            amount: Number(row.amount ?? 0),
            currency,
            createdDate: row.createdAt instanceof Date ? row.createdAt.toISOString().split('T')[0] : row.createdAt,
            expiryDate: expiresAt,
            views: Number(row.viewCount ?? 0),
            status: this.formatPaymentLinkStatus(effectiveStatus),
            token: row.token,
            url: `/pay/${row.token}`,
            invoiceId: row.invoiceId ?? null,
            customerId: row.customerId ?? null,
        }
    }

    // ─── Customers ────────────────────────────────────────────────────────────

    async listCustomers(userId: string, companyId: string, opts: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const result = await this.repo.findCustomers(wid, companyId, {
            search: opts.search,
            status: opts.status,
            groupId: opts.groupId,
            sort: opts.sort,
            direction: opts.direction as 'asc' | 'desc' | undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        return { data: result.data.map((c: any) => this.normalizeCustomer(c)), total: result.total }
    }

    async listPaymentTerms(userId: string, companyId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.findPaymentTerms(wid)
    }

    async getCustomer(userId: string, companyId: string, contactId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const customer = await this.repo.getCustomerDetail(wid, companyId, contactId)
        if (!customer) throw new NotFoundException('Customer not found')
        return this.normalizeCustomer(customer)
    }

    async createCustomer(userId: string, companyId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const displayName = data.displayName || data.name
        if (!displayName) throw new BadRequestException('displayName is required')
        const result = await this.repo.createCustomer(wid, { ...data, displayName })
        this.prisma.auditLog.create({
            data: {
                workspaceId: wid,
                companyId,
                userId,
                action: 'CREATE',
                tableName: 'Customer',
                recordId: result.contactId,
                changes: { name: displayName },
            },
        }).catch(() => {})
        return this.normalizeCustomer(result)
    }

    async updateCustomer(userId: string, companyId: string, contactId: string, data: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const customer = await this.repo.findCustomerById(wid, contactId)
        if (!customer) throw new NotFoundException('Customer not found')
        if (data.name && !data.displayName) data.displayName = data.name
        const result = await this.repo.updateCustomer(wid, contactId, data)
        const changes: Record<string, any> = {}
        const tracked = ['displayName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country', 'paymentTermId', 'creditLimit']
        for (const f of tracked) { if (data[f] !== undefined) changes[f] = data[f] }
        this.prisma.auditLog.create({
            data: {
                workspaceId: wid,
                companyId,
                userId,
                action: 'UPDATE',
                tableName: 'Customer',
                recordId: contactId,
                changes,
            },
        }).catch(() => {})
        return this.normalizeCustomer(result)
    }

    async deleteCustomer(userId: string, companyId: string, contactId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const customer = await this.repo.findCustomerById(wid, contactId)
        if (!customer) throw new NotFoundException('Customer not found')
        const result = await this.repo.softDeleteCustomer(wid, contactId)
        this.prisma.auditLog.create({
            data: {
                workspaceId: wid,
                companyId,
                userId,
                action: 'DELETE',
                tableName: 'Customer',
                recordId: contactId,
                changes: { name: customer.contact?.displayName ?? '' },
            },
        }).catch(() => {})
        return result
    }

    async batchDeleteCustomers(userId: string, companyId: string, ids: string[]) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!ids?.length) throw new BadRequestException('No IDs provided')
        return this.repo.batchDeleteCustomers(wid, ids)
    }

    async batchUpdateCustomerStatus(userId: string, companyId: string, ids: string[], status: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!ids?.length) throw new BadRequestException('No IDs provided')
        if (!['ACTIVE', 'INACTIVE'].includes(status)) throw new BadRequestException('Invalid status')
        return this.repo.batchUpdateCustomerStatus(wid, ids, status as 'ACTIVE' | 'INACTIVE')
    }

    async batchUpdateCustomerGroup(userId: string, companyId: string, ids: string[], groupId: string | null) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!ids?.length) throw new BadRequestException('No IDs provided')
        return this.repo.batchUpdateCustomerGroup(wid, ids, groupId)
    }

    async exportCustomersCsv(userId: string, companyId: string, opts: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const raw = await this.repo.getCustomersForExport(wid, companyId, opts)
        const rows = raw.map((c: any) => this.normalizeCustomer(c))
        const cols = [
            'id', 'name', 'email', 'phone', 'status', 'groupName', 'paymentTermName',
            'openBalance', 'totalRevenue', 'invoiceCount', 'creditLimit',
            'address', 'city', 'state', 'zip', 'country',
        ]
        const esc = (v: any) => {
            const s = String(v ?? '')
            return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
        }
        const header = cols.join(',')
        const lines = rows.map((r: any) => cols.map(k => esc(r[k])).join(','))
        return { csv: [header, ...lines].join('\n'), filename: 'customers.csv' }
    }

    async listCustomerGroups(userId: string, companyId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.listCustomerGroups(wid)
    }

    async createCustomerGroup(userId: string, companyId: string, data: { name: string; description?: string }) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.name?.trim()) throw new BadRequestException('Group name is required')
        const result = await this.repo.createCustomerGroup(wid, companyId, data)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'CREATE', tableName: 'CustomerGroup', recordId: result.id, changes: { name: result.name } },
        }).catch(() => {})
        return result
    }

    async getCustomerGroup(userId: string, companyId: string, id: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const group = await this.repo.getCustomerGroup(wid, id)
        if (!group) throw new NotFoundException('Customer group not found')
        return group
    }

    async updateCustomerGroup(userId: string, companyId: string, id: string, data: { name?: string; description?: string }) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.getCustomerGroup(wid, id)
        if (!existing) throw new NotFoundException('Customer group not found')
        const result = await this.repo.updateCustomerGroup(wid, id, data)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'UPDATE', tableName: 'CustomerGroup', recordId: id, changes: data },
        }).catch(() => {})
        return result
    }

    async deleteCustomerGroup(userId: string, companyId: string, id: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.getCustomerGroup(wid, id)
        if (!existing) throw new NotFoundException('Customer group not found')
        const result = await this.repo.deleteCustomerGroup(wid, id)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'DELETE', tableName: 'CustomerGroup', recordId: id, changes: { name: existing.name } },
        }).catch(() => {})
        return result
    }

    async listGroupMembers(userId: string, companyId: string, groupId: string, opts: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const limit = opts.limit ? parseInt(opts.limit) : 50
        const offset = opts.offset ? parseInt(opts.offset) : 0
        return this.repo.listGroupMembers(wid, groupId, { search: opts.search, limit, offset })
    }

    async addGroupMembers(userId: string, companyId: string, groupId: string, customerIds: string[]) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!customerIds?.length) throw new BadRequestException('No customer IDs provided')
        const existing = await this.repo.getCustomerGroup(wid, groupId)
        if (!existing) throw new NotFoundException('Customer group not found')
        return this.repo.addGroupMembers(wid, groupId, customerIds)
    }

    async removeGroupMembers(userId: string, companyId: string, groupId: string, customerIds: string[]) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!customerIds?.length) throw new BadRequestException('No customer IDs provided')
        return this.repo.removeGroupMembers(wid, groupId, customerIds)
    }

    async batchDeleteCustomerGroups(userId: string, companyId: string, ids: string[]) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!ids?.length) throw new BadRequestException('No IDs provided')
        const existing = await this.prisma.customerGroup.findMany({
            where: { workspaceId: wid, id: { in: ids } },
            select: { id: true, name: true },
        })
        const result = await this.repo.batchDeleteCustomerGroups(wid, ids)
        await Promise.all(existing.map((group) => this.prisma.auditLog.create({
            data: {
                workspaceId: wid,
                companyId,
                userId,
                action: 'DELETE',
                tableName: 'CustomerGroup',
                recordId: group.id,
                changes: { name: group.name },
            },
        }).catch(() => {})))
        return result
    }

    async exportCustomerGroupsCsv(userId: string, companyId: string) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const rows = await this.repo.exportCustomerGroupsCsv(wid)
        const cols = ['id', 'name', 'description', 'customerCount']
        const esc = (v: any) => {
            const s = String(v ?? '')
            return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
        }
        const header = cols.join(',')
        const lines = rows.map((r: any) => cols.map(k => esc(r[k])).join(','))
        return { csv: [header, ...lines].join('\n'), filename: 'customer-groups.csv' }
    }

    async getCustomerActivity(userId: string, companyId: string, contactId: string, opts: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const limit = opts.limit ? parseInt(opts.limit) : 20
        const offset = opts.offset ? parseInt(opts.offset) : 0
        const where = { tableName: 'Customer', recordId: contactId, companyId }
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

    async getAllCustomerActivity(userId: string, companyId: string, opts: any) {
        const wid = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const take = opts.take ? parseInt(opts.take) : 20
        const skip = opts.skip ? parseInt(opts.skip) : 0
        const where: any = { tableName: 'Customer', companyId }
        if (opts.action && ['CREATE', 'UPDATE', 'DELETE'].includes(opts.action)) {
            where.action = opts.action
        }
        if (opts.userId) {
            where.userId = opts.userId
        }
        if (opts.search) {
            where.OR = [
                { changes: { path: ['name'], string_contains: opts.search } },
                { changes: { path: ['displayName'], string_contains: opts.search } },
            ]
        }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
                take,
                skip,
            }),
            this.prisma.auditLog.count({ where }),
        ])
        return { data: logs, total }
    }

    async getInvoiceActivity(userId: string, companyId: string, invoiceId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const limit = opts.limit ? parseInt(opts.limit) : 20
        const offset = opts.offset ? parseInt(opts.offset) : 0
        const where: any = { tableName: 'Invoice', recordId: invoiceId, companyId }
        if (opts.action && ['CREATE', 'UPDATE', 'SEND', 'VOID'].includes(opts.action)) {
            where.action = opts.action
        }
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

    async getQuoteActivity(userId: string, companyId: string, quoteId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const limit = opts.limit ? parseInt(opts.limit) : 20
        const offset = opts.offset ? parseInt(opts.offset) : 0
        const where: any = { tableName: 'Quote', recordId: quoteId, companyId }
        if (opts.action && ['CREATE', 'UPDATE', 'DELETE', 'CONVERT'].includes(opts.action)) {
            where.action = opts.action
        }
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

    // ─── Quotes ───────────────────────────────────────────────────────────────

    async listQuotes(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const quotes = await this.repo.findQuotes(companyId, {
            customerId: opts.customerId,
            status: opts.status,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        return quotes.map((q: any) => this.normalizeQuote(q))
    }

    async getQuote(userId: string, companyId: string, quoteId: string) {
        await this.assertAccess(userId, companyId)
        const q = await this.repo.findQuoteById(companyId, quoteId)
        if (!q) throw new NotFoundException('Quote not found')
        return this.normalizeQuote(q)
    }

    async createQuote(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.customerId) throw new BadRequestException('customerId is required')
        if (!data.lines?.length) throw new BadRequestException('At least one line item is required')
        const quote = await this.repo.createQuote({ workspaceId, companyId, ...data })
        this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'CREATE', tableName: 'Quote', recordId: quote.id, changes: { customerId: data.customerId, total: quote.totalAmount } },
        }).catch(() => {})
        return this.normalizeQuote(quote)
    }

    async updateQuoteStatus(userId: string, companyId: string, quoteId: string, status: string) {
        await this.assertAccess(userId, companyId)
        const q = await this.repo.findQuoteById(companyId, quoteId)
        if (!q) throw new NotFoundException('Quote not found')
        if (q.convertedToInvoiceId) throw new ConflictException('Cannot change status of a converted quote')
        const allowed = ['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']
        if (!allowed.includes(status)) throw new BadRequestException(`Invalid status: ${status}`)
        return this.repo.updateQuoteStatus(companyId, quoteId, status)
    }

    async convertToInvoice(userId: string, companyId: string, quoteId: string) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        const q = await this.repo.findQuoteById(companyId, quoteId)
        if (!q) throw new NotFoundException('Quote not found')
        if (q.status === 'CONVERTED') throw new BadRequestException('Quote is already converted to an invoice')
        if (q.status === 'EXPIRED' || q.status === 'REJECTED') throw new BadRequestException('Cannot convert a rejected or expired quote')
        const invoice = await this.repo.convertQuoteToInvoice(companyId, workspaceId, quoteId, userId)
        if (!invoice) throw new BadRequestException('Conversion failed')
        this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'CONVERT', tableName: 'Quote', recordId: quoteId, changes: { invoiceId: invoice.id } },
        }).catch(() => {})
        return invoice
    }

    async updateQuote(userId: string, companyId: string, quoteId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        const q = await this.repo.findQuoteById(companyId, quoteId)
        if (!q) throw new NotFoundException('Quote not found')
        if (q.status === 'CONVERTED') throw new BadRequestException('Cannot edit a converted quote')
        const updateData: any = {}
        if (data.customerId) updateData.customerId = data.customerId
        if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null
        if (data.lines) updateData.lines = data.lines
        const result = await this.repo.updateQuote(companyId, quoteId, updateData)
        this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'UPDATE', tableName: 'Quote', recordId: quoteId, changes: updateData },
        }).catch(() => {})
        return this.normalizeQuote(result)
    }

    async deleteQuote(userId: string, companyId: string, quoteId: string) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        const q = await this.repo.findQuoteById(companyId, quoteId)
        if (!q) throw new NotFoundException('Quote not found')
        await this.repo.deleteQuote(companyId, quoteId)
        this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'DELETE', tableName: 'Quote', recordId: quoteId, changes: {} },
        }).catch(() => {})
        return { success: true }
    }

    async batchDeleteQuotes(userId: string, companyId: string, ids: string[]) {
        await this.assertAccess(userId, companyId)
        if (!ids?.length) throw new BadRequestException('ids array is required')
        return this.repo.batchDeleteQuotes(companyId, ids)
    }

    async batchUpdateQuoteStatus(userId: string, companyId: string, ids: string[], status: string) {
        await this.assertAccess(userId, companyId)
        if (!ids?.length) throw new BadRequestException('ids array is required')
        const allowed = ['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'DRAFT']
        if (!allowed.includes(status)) throw new BadRequestException(`Invalid status: ${status}`)
        return this.repo.batchUpdateQuoteStatus(companyId, ids, status)
    }

    async exportQuotes(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.exportQuotes(companyId, { status: opts.status, search: opts.search })
    }

    // ─── Invoices ─────────────────────────────────────────────────────────────

    async listInvoices(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const requestedStatus = String(opts.status ?? '').toUpperCase()
        const openOnly = ['true', '1', 'yes'].includes(String(opts.openOnly ?? '').toLowerCase())
            || requestedStatus === 'UNPAID'
            || requestedStatus === 'OPEN'
        const statusFilter = openOnly
            ? undefined
            : requestedStatus === 'PARTIALLY_PAID'
            ? 'PARTIAL'
            : (requestedStatus || undefined)
        const invoices = await this.repo.findInvoices(companyId, {
            customerId: opts.customerId,
            status: statusFilter,
            openOnly,
            search: opts.search,
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        return invoices.map((inv: any) => this.normalizeInvoice(inv))
    }

    async getInvoice(userId: string, companyId: string, invoiceId: string) {
        await this.assertAccess(userId, companyId)
        const inv = await this.repo.findInvoiceById(companyId, invoiceId)
        if (!inv) throw new NotFoundException('Invoice not found')
        return this.normalizeInvoice(inv)
    }

    async createInvoice(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        if (!data.customerId) throw new BadRequestException('customerId is required')
        const lines = data.lines ?? data.items
        if (!lines?.length) throw new BadRequestException('At least one line item is required')
        const normalizedLines = (Array.isArray(lines) ? lines : []).map((l: any) => {
            const quantity = Number(l.quantity ?? 1)
            const unitPrice = Number(l.unitPrice ?? l.rate ?? 0)
            const amount = Number(l.amount ?? l.totalPrice ?? (quantity * unitPrice))
            return {
                description: String(l.description ?? '').trim(),
                quantity: Number.isFinite(quantity) ? quantity : 1,
                unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
                amount: Number.isFinite(amount) ? amount : 0,
                itemId: l.itemId ?? undefined,
                accountId: l.accountId ?? null,
                taxCodeId: l.taxCodeId ?? null,
                taxRate: l.taxRate != null ? Number(l.taxRate) : null,
                taxRateId: l.taxRateId ?? null,
            }
        }).filter((line) => line.description.length > 0)
        if (!normalizedLines.length) throw new BadRequestException('At least one invoice line with a description is required')

        const customer = await this.repo.findCustomerById(workspaceId, data.customerId)
        if (!customer) throw new NotFoundException('Customer not found')

        const newInvoiceTotal = normalizedLines.reduce((sum, line) => sum + Number(line.amount ?? 0), 0)
        const openInvoices = await this.repo.findInvoices(companyId, { customerId: data.customerId, openOnly: true })
        const openBalance = openInvoices.reduce((sum, inv) => sum + Number(inv.balance ?? 0), 0)
        const creditLimit = Number(customer.creditLimit ?? 0)
        if (creditLimit > 0 && openBalance + newInvoiceTotal > creditLimit) {
            throw new BadRequestException(`Customer credit limit exceeded: open balance ${openBalance}, credit limit ${creditLimit}, new invoice total ${newInvoiceTotal}`)
        }

        const result = await this.repo.createInvoice({
            workspaceId,
            companyId,
            customerId: data.customerId,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            paymentTermId: data.paymentTermId,
            currency: data.currency,
            createdById: userId,
            lines: normalizedLines,
        })
        this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'CREATE', tableName: 'Invoice', recordId: result.id, changes: { invoiceNumber: result.invoiceNumber, customerId: data.customerId, total: result.totalAmount } },
        }).catch(() => {})
        return this.normalizeInvoice(result)
    }

    async updateInvoice(userId: string, companyId: string, invoiceId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        const result = await this.repo.updateInvoice(companyId, invoiceId, data, userId)
        if (!result) throw new BadRequestException('Invoice not found or cannot be edited (only DRAFT invoices can be updated)')
        this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'UPDATE', tableName: 'Invoice', recordId: invoiceId, changes: data },
        }).catch(() => {})
        return result
    }

    async duplicateInvoice(userId: string, companyId: string, invoiceId: string) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        const result = await this.repo.duplicateInvoice(companyId, invoiceId, userId)
        if (!result) throw new NotFoundException('Invoice not found')
        this.prisma.auditLog.create({
            data: {
                workspaceId,
                companyId,
                userId,
                action: 'DUPLICATE',
                tableName: 'Invoice',
                recordId: result.id,
                changes: {
                    sourceInvoiceId: invoiceId,
                    invoiceNumber: result.invoiceNumber,
                    status: 'DRAFT',
                },
            },
        }).catch(() => {})
        return this.normalizeInvoice(result)
    }

    async issueInvoice(userId: string, companyId: string, invoiceId: string, opts?: { subject?: string; body?: string; scheduledAt?: string }) {
        return this.sendInvoice(userId, companyId, invoiceId, opts)
    }

    async sendInvoice(userId: string, companyId: string, invoiceId: string, opts?: { subject?: string; body?: string; scheduledAt?: string }) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        const result = await this.repo.sendInvoice(companyId, invoiceId)
        if (!result) throw new NotFoundException('Invoice not found')
        // Post invoice to the General Ledger (DR: AR, CR: Revenue + Output VAT)
        await this.subLedger.postInvoiceToGL(result.id, userId)
        this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'SEND', tableName: 'Invoice', recordId: invoiceId, changes: { status: 'SENT' } },
        }).catch(() => {})
        return result
    }

    async voidInvoice(userId: string, companyId: string, invoiceId: string) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        const inv = await this.repo.findInvoiceById(companyId, invoiceId)
        if (!inv) throw new NotFoundException('Invoice not found')
        if (inv.status === 'VOID') throw new BadRequestException('Invoice is already void')

        // Reverse the invoice posting JE before marking the invoice as void.
        await this.subLedger.reverseInvoiceGL(invoiceId, userId)
        const result = await this.repo.voidInvoice(companyId, invoiceId)
        this.prisma.auditLog.create({
            data: { workspaceId, companyId, userId, action: 'VOID', tableName: 'Invoice', recordId: invoiceId, changes: { status: 'VOID' } },
        }).catch(() => {})
        return result
    }

    // ─── Payments ─────────────────────────────────────────────────────────────

    async listPayments(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const payments = await this.repo.findPayments(companyId, {
            customerId: opts.customerId,
            invoiceId: opts.invoiceId,
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        return payments.map((p: any) => this.normalizePayment(p))
    }

    async getPayment(userId: string, companyId: string, paymentId: string) {
        await this.assertAccess(userId, companyId)
        return this.getNormalizedPaymentById(companyId, paymentId)
    }

    async recordPayment(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)

        const paymentAmount = Number(data.amount)
        const allocations = this.normalizeRequestedAllocations(data)
        const validated = await this.validatePaymentAllocations(companyId, allocations, {
            paymentAmount,
            customerId: data.customerId ?? null,
        })

        let customerId = data.customerId ?? validated.customerId
        if (!customerId) throw new BadRequestException('customerId is required')
        if (!paymentAmount || paymentAmount <= 0) throw new BadRequestException('amount must be greater than 0')
        const paymentDate = data.paymentDate ?? data.date
        if (!paymentDate) throw new BadRequestException('paymentDate is required')
        const paymentMethodId = await this.resolvePaymentMethodId(workspaceId, data)
        const depositDestination = String(data.depositDestination ?? data.depositTo ?? '').trim().toUpperCase()
        if (depositDestination && !['UNDEPOSITED_FUNDS', 'BANK_ACCOUNT'].includes(depositDestination)) {
            throw new BadRequestException('depositDestination must be UNDEPOSITED_FUNDS or BANK_ACCOUNT')
        }

        const requestedBankAccountId = String(data.bankAccountId ?? '').trim()
        const shouldDepositDirectlyToBank = depositDestination === 'BANK_ACCOUNT'
            || (!!requestedBankAccountId && depositDestination !== 'UNDEPOSITED_FUNDS')

        if (shouldDepositDirectlyToBank && !requestedBankAccountId) {
            throw new BadRequestException('bankAccountId is required when deposit destination is BANK_ACCOUNT')
        }

        let resolvedBankAccountId: string | undefined
        if (shouldDepositDirectlyToBank) {
            const bankAccount = await this.prisma.bankAccount.findFirst({
                where: { id: requestedBankAccountId, workspaceId, deletedAt: null },
                select: { id: true },
            })
            if (!bankAccount) throw new BadRequestException('bankAccountId is invalid for this workspace')
            resolvedBankAccountId = bankAccount.id
        }

        const result = await this.repo.recordPayment({
            workspaceId,
            companyId,
            customerId,
            amount: paymentAmount,
            paymentDate: new Date(paymentDate),
            referenceNumber: data.referenceNumber ?? data.reference,
            paymentMethodId: paymentMethodId ?? undefined,
            bankAccountId: resolvedBankAccountId,
            isDeposited: shouldDepositDirectlyToBank,
            createdById: userId,
            allocations: validated.allocations,
        })
        // Post payment receipt to the General Ledger (DR: Cash/Bank, CR: Accounts Receivable)
        await this.subLedger.postPaymentReceivedToGL(result.id, userId)
        return this.getNormalizedPaymentById(companyId, result.id)
    }

    async updatePayment(userId: string, companyId: string, paymentId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)

        const payment = await this.repo.findPaymentById(companyId, paymentId)
        if (!payment) throw new NotFoundException('Payment not found')

        const hasAllocationPayload = Array.isArray(data?.allocations) || Array.isArray(data?.applications) || !!data?.invoiceId
        if (!hasAllocationPayload) {
            throw new BadRequestException('allocations payload is required')
        }

        const allocations = this.normalizeRequestedAllocations(data)
        const existingAllocationCredits = new Map(
            (payment.InvoicePaymentApplication ?? []).map((allocation: any) => [allocation.invoiceId, Number(allocation.amount ?? 0)]),
        )

        const validated = await this.validatePaymentAllocations(companyId, allocations, {
            paymentAmount: Number(payment.amount),
            customerId: payment.customerId,
            allocationBalanceCredits: existingAllocationCredits,
        })

        const beforeSnapshot = this.toPaymentAllocationAuditSnapshot(payment)
        await this.repo.replacePaymentAllocations(companyId, paymentId, validated.allocations)
        const updatedPayment = await this.getNormalizedPaymentById(companyId, paymentId)

        this.prisma.auditLog.create({
            data: {
                workspaceId,
                companyId,
                userId,
                action: 'REALLOCATE',
                tableName: 'CustomerPayment',
                recordId: paymentId,
                changes: {
                    before: beforeSnapshot,
                    after: this.toPaymentAllocationAuditSnapshot(updatedPayment),
                },
            },
        }).catch(() => {})

        return updatedPayment
    }

    async voidPayment(userId: string, companyId: string, paymentId: string) {
        await this.assertAccess(userId, companyId)
        const result = await this.repo.voidPayment(companyId, paymentId)
        if (!result) throw new NotFoundException('Payment not found')
        // Reverse the DR Cash / CR AR journal entry posted when the payment was recorded
        await this.subLedger.reversePaymentReceivedGL(paymentId, userId)
        return result
    }

    async applyPaymentToInvoices(userId: string, companyId: string, paymentId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const payment = await this.repo.findPaymentById(companyId, paymentId)
        if (!payment) throw new NotFoundException('Payment not found')

        const allocations = this.normalizeRequestedAllocations(data)
        if (!allocations.length) throw new BadRequestException('allocations must contain at least one invoice')

        const existingAllocatedAmount = Array.isArray(payment.InvoicePaymentApplication)
            ? payment.InvoicePaymentApplication.reduce((sum: number, allocation: any) => sum + Number(allocation.amount ?? 0), 0)
            : 0

        await this.validatePaymentAllocations(companyId, allocations, {
            paymentAmount: Number(payment.amount),
            customerId: payment.customerId,
            existingAllocatedAmount,
            alreadyAllocatedInvoiceIds: new Set((payment.InvoicePaymentApplication ?? []).map((allocation: any) => allocation.invoiceId)),
        })

        await this.repo.applyPaymentToInvoices(companyId, paymentId, allocations)
        return this.getNormalizedPaymentById(companyId, paymentId)
    }

    async getAging(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return []
    }

    // ─── Revenue Recognition ───────────────────────────────────────────────

    async listRevenueRecognition(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        const rows = await this.repo.findRevenueRecognitions(companyId, {
            search: opts.search,
            status: opts.status,
        })

        const customerIds = Array.from(new Set(rows.map((r: any) => r.customerId).filter(Boolean))) as string[]
        const customers = customerIds.length
            ? await this.prisma.customer.findMany({
                where: { contactId: { in: customerIds } },
                include: { contact: { select: { displayName: true } } },
            })
            : []
        const customerMap = new Map(customers.map((c: any) => [c.contactId, c.contact?.displayName ?? '']))

        return rows.map((row: any) => this.normalizeRevenueRecognitionRow(row, customerMap.get(row.customerId ?? '') ?? ''))
    }

    async createRevenueRecognition(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)

        const total = Number(data.totalContractValue ?? data.amount ?? 0)
        if (total <= 0) throw new BadRequestException('totalContractValue must be greater than 0')
        if (!data.description) throw new BadRequestException('description is required')

        const created = await this.repo.createRevenueRecognition(workspaceId, companyId, {
            ...data,
            createdById: userId,
        })

        const customerName = created.customerId
            ? (await this.prisma.customer.findFirst({
                where: { contactId: created.customerId },
                include: { contact: { select: { displayName: true } } },
            }))?.contact?.displayName ?? ''
            : ''

        return this.normalizeRevenueRecognitionRow(created, customerName)
    }

    async recognizeRevenue(userId: string, companyId: string, id: string, data: any = {}) {
        await this.assertAccess(userId, companyId)

        const amount = data.amount != null ? Number(data.amount) : undefined
        if (amount != null && (!Number.isFinite(amount) || amount < 0)) {
            throw new BadRequestException('amount must be a non-negative number')
        }

        const result = await this.repo.recognizeRevenue(companyId, id, {
            amount,
            recognitionDate: data.recognitionDate ? new Date(data.recognitionDate) : new Date(),
        })
        if (!result) throw new NotFoundException('Revenue recognition contract not found')

        const recognizedAmount = Number(result.recognizedAmount ?? 0)
        let journalEntryId: string | null = result.record.journalEntryId ?? null
        if (recognizedAmount > 0.005) {
            const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { currency: true } })
            const jeId = await this.subLedger.postRevenueRecognitionToGL({
                workspaceId: result.record.workspaceId,
                companyId,
                amount: recognizedAmount,
                recognitionId: result.record.id,
                description: `Revenue recognition ${result.record.contractId}`,
                currency: company?.currency ?? 'PHP',
                postedById: userId,
            })
            if (jeId) {
                journalEntryId = jeId
                await this.prisma.revenueRecognition.update({ where: { id }, data: { journalEntryId: jeId } })
            }
        }

        const customerName = result.record.customerId
            ? (await this.prisma.customer.findFirst({
                where: { contactId: result.record.customerId },
                include: { contact: { select: { displayName: true } } },
            }))?.contact?.displayName ?? ''
            : ''

        return {
            ...this.normalizeRevenueRecognitionRow({ ...result.record, journalEntryId }, customerName),
            recognizedAmount,
            journalEntryId,
        }
    }

    // ─── Deferred Revenue ──────────────────────────────────────────────────

    async listDeferredRevenue(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        const rows = await this.repo.findDeferredRevenue(companyId, {
            search: opts.search,
            status: opts.status,
        })

        const customerIds = Array.from(new Set(rows.map((r: any) => r.customerId).filter(Boolean))) as string[]
        const customers = customerIds.length
            ? await this.prisma.customer.findMany({
                where: { contactId: { in: customerIds } },
                include: { contact: { select: { displayName: true } } },
            })
            : []
        const customerMap = new Map(customers.map((c: any) => [c.contactId, c.contact?.displayName ?? '']))

        return rows.map((row: any) => this.normalizeDeferredRevenueRow(row, customerMap.get(row.customerId ?? '') ?? ''))
    }

    async createDeferredRevenue(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)

        const total = Number(data.totalDeferredAmount ?? data.amount ?? 0)
        if (total <= 0) throw new BadRequestException('totalDeferredAmount must be greater than 0')
        if (!data.description) throw new BadRequestException('description is required')

        const created = await this.repo.createDeferredRevenue(workspaceId, companyId, {
            ...data,
            createdById: userId,
        })

        const customerName = created.customerId
            ? (await this.prisma.customer.findFirst({
                where: { contactId: created.customerId },
                include: { contact: { select: { displayName: true } } },
            }))?.contact?.displayName ?? ''
            : ''

        return this.normalizeDeferredRevenueRow(created, customerName)
    }

    async recognizeDeferredRevenue(userId: string, companyId: string, id: string, data: any = {}) {
        await this.assertAccess(userId, companyId)

        const amount = data.amount != null ? Number(data.amount) : undefined
        if (amount != null && (!Number.isFinite(amount) || amount < 0)) {
            throw new BadRequestException('amount must be a non-negative number')
        }

        const result = await this.repo.recognizeDeferredRevenue(companyId, id, {
            amount,
            recognitionDate: data.recognitionDate ? new Date(data.recognitionDate) : new Date(),
        })
        if (!result) throw new NotFoundException('Deferred revenue schedule not found')

        const recognizedAmount = Number(result.recognizedAmount ?? 0)
        let journalEntryId: string | null = result.record.journalEntryId ?? null
        if (recognizedAmount > 0.005) {
            const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { currency: true } })
            const jeId = await this.subLedger.postRevenueRecognitionToGL({
                workspaceId: result.record.workspaceId,
                companyId,
                amount: recognizedAmount,
                recognitionId: result.record.id,
                description: `Deferred revenue recognition ${result.record.contractId}`,
                currency: company?.currency ?? 'PHP',
                postedById: userId,
            })
            if (jeId) {
                journalEntryId = jeId
                await this.prisma.deferredRevenue.update({ where: { id }, data: { journalEntryId: jeId } })
            }
        }

        const customerName = result.record.customerId
            ? (await this.prisma.customer.findFirst({
                where: { contactId: result.record.customerId },
                include: { contact: { select: { displayName: true } } },
            }))?.contact?.displayName ?? ''
            : ''

        return {
            ...this.normalizeDeferredRevenueRow({ ...result.record, journalEntryId }, customerName),
            recognizedAmount,
            journalEntryId,
        }
    }

    // ─── Payment Links ─────────────────────────────────────────────────────

    async listPaymentLinks(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        const rows = await this.repo.findPaymentLinks(companyId, {
            search: opts.search,
            status: opts.status,
        })
        return Promise.all(rows.map((row: any) => this.normalizePaymentLinkRow(row)))
    }

    async createPaymentLink(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)

        if (!data.invoiceId && (data.amount == null || Number(data.amount) <= 0)) {
            throw new BadRequestException('amount is required when invoiceId is not provided')
        }

        const created = await this.repo.createPaymentLink(workspaceId, companyId, {
            ...data,
            createdById: userId,
        })

        this.prisma.auditLog.create({
            data: {
                workspaceId,
                companyId,
                userId,
                action: 'CREATE',
                tableName: 'PaymentLink',
                recordId: created.id,
                changes: {
                    linkId: created.linkId,
                    description: created.description,
                    amount: Number(created.amount ?? 0),
                    invoiceId: created.invoiceId,
                    status: created.status,
                },
            },
        }).catch(() => {})

        return this.normalizePaymentLinkRow(created)
    }

    private normalizeCollection(c: any) {
        return {
            id: c.id,
            caseNumber: c.caseNumber,
            companyId: c.companyId,
            customerId: c.customerId ?? null,
            invoiceId: c.invoiceId ?? null,
            subject: c.subject,
            status: c.status,
            priority: c.priority,
            assignedTo: c.assignedTo ?? null,
            notes: c.notes ?? null,
            promisedAmount: c.promisedAmount ? Number(c.promisedAmount) : null,
            promisedDate: c.promisedDate instanceof Date ? c.promisedDate.toISOString().split('T')[0] : c.promisedDate ?? null,
            resolution: c.resolution ?? null,
            resolvedAt: c.resolvedAt instanceof Date ? c.resolvedAt.toISOString() : c.resolvedAt ?? null,
            createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
        }
    }

    async listCollections(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        const rows = await this.repo.findCollections(companyId, {
            search: opts.search,
            status: opts.status,
            priority: opts.priority,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        return rows.map((c: any) => this.normalizeCollection(c))
    }

    async getCollection(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const c = await this.repo.findCollectionById(companyId, id)
        if (!c) throw new NotFoundException('Collection case not found')
        return this.normalizeCollection(c)
    }

    async createCollection(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.subject) throw new BadRequestException('subject is required')
        const wid = await this.getWorkspaceId(companyId)
        const c = await this.repo.createCollectionsCase(companyId, wid, data)
        this.prisma.auditLog.create({
            data: {
                workspaceId: wid,
                companyId,
                userId,
                action: 'CREATE',
                tableName: 'CollectionsCase',
                recordId: c.id,
                changes: { caseNumber: c.caseNumber, subject: c.subject, status: c.status, priority: c.priority },
            },
        }).catch(() => {})
        return this.normalizeCollection(c)
    }

    async updateCollection(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const existing = await this.repo.findCollectionById(companyId, id)
        if (!existing) throw new NotFoundException('Collection case not found')
        const c = await this.repo.updateCollectionsCase(id, data)
        this.prisma.auditLog.create({
            data: {
                workspaceId: wid,
                companyId,
                userId,
                action: 'UPDATE',
                tableName: 'CollectionsCase',
                recordId: id,
                changes: {
                    caseNumber: existing.caseNumber,
                    subject: data.subject ?? existing.subject,
                    status: data.status ?? existing.status,
                    priority: data.priority ?? existing.priority,
                    assignedTo: data.assignedTo ?? existing.assignedTo,
                },
            },
        }).catch(() => {})
        return this.normalizeCollection(c)
    }

    async deleteCollection(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const existing = await this.repo.findCollectionById(companyId, id)
        if (!existing) throw new NotFoundException('Collection case not found')
        await this.repo.deleteCollectionsCase(id)
        this.prisma.auditLog.create({
            data: {
                workspaceId: wid,
                companyId,
                userId,
                action: 'DELETE',
                tableName: 'CollectionsCase',
                recordId: id,
                changes: { caseNumber: existing.caseNumber, subject: existing.subject },
            },
        }).catch(() => {})
        return { success: true, id }
    }

    async batchDeleteCollections(userId: string, companyId: string, ids: string[]) {
        await this.assertAccess(userId, companyId)
        if (!Array.isArray(ids) || ids.length === 0) throw new BadRequestException('ids array is required')
        const wid = await this.getWorkspaceId(companyId)
        const existing = await this.prisma.collectionsCase.findMany({
            where: { companyId, id: { in: ids } },
            select: { id: true, caseNumber: true, subject: true },
        })
        await this.repo.batchDeleteCollections(companyId, ids)
        await Promise.all(existing.map((row) => this.prisma.auditLog.create({
            data: {
                workspaceId: wid,
                companyId,
                userId,
                action: 'DELETE',
                tableName: 'CollectionsCase',
                recordId: row.id,
                changes: { caseNumber: row.caseNumber, subject: row.subject },
            },
        }).catch(() => {})))
        return { success: true, count: ids.length }
    }

    async batchUpdateCollectionStatus(userId: string, companyId: string, ids: string[], status: string) {
        await this.assertAccess(userId, companyId)
        if (!Array.isArray(ids) || ids.length === 0) throw new BadRequestException('ids array is required')
        if (!status) throw new BadRequestException('status is required')
        const wid = await this.getWorkspaceId(companyId)
        const existing = await this.prisma.collectionsCase.findMany({
            where: { companyId, id: { in: ids } },
            select: { id: true, caseNumber: true, subject: true },
        })
        await this.repo.batchUpdateCollectionStatus(companyId, ids, status)
        await Promise.all(existing.map((row) => this.prisma.auditLog.create({
            data: {
                workspaceId: wid,
                companyId,
                userId,
                action: 'UPDATE',
                tableName: 'CollectionsCase',
                recordId: row.id,
                changes: { caseNumber: row.caseNumber, subject: row.subject, status },
            },
        }).catch(() => {})))
        return { success: true, count: ids.length }
    }

    async exportCollections(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.repo.exportCollections(companyId, opts)
    }

    async listRefunds(userId: string, companyId: string) {
        return this.listRefundsEnriched(userId, companyId)
    }

    // ─── Credit Notes ─────────────────────────────────────────────────────────

    private normalizeCreditNote(cn: any) {
        return {
            ...cn,
            creditNoteNumber: cn.creditNoteNumber ?? `CN-${cn.id?.slice(0, 8)}`,
            customer: cn.customer?.contact?.displayName ?? cn.customerName ?? '',
            customerId: cn.customerId ?? '',
            date: cn.issuedAt ?? cn.date ?? null,
            amount: Number(cn.totalAmount ?? 0),
            balance: Number(cn.balance ?? 0),
            status: cn.status ?? 'DRAFT',
            memo: cn.reason ?? '',
            invoiceId: cn.invoiceId ?? null,
            invoiceNumber: cn.invoice?.invoiceNumber ?? null,
        }
    }

    async listCreditNotes(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const items = await this.repo.findCreditNotes(companyId, {
            status: opts.status,
            search: opts.search,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
        return items.map((cn: any) => this.normalizeCreditNote(cn))
    }

    async getCreditNote(userId: string, companyId: string, creditNoteId: string) {
        await this.assertAccess(userId, companyId)
        const cn = await this.repo.findCreditNoteById(companyId, creditNoteId)
        if (!cn) throw new NotFoundException('Credit note not found')
        return this.normalizeCreditNote(cn)
    }

    async createCreditNote(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.customerId) throw new BadRequestException('customerId is required')
        if (!data.reason && !data.memo) throw new BadRequestException('reason or memo is required')
        if (data.totalAmount == null && !data.amount) throw new BadRequestException('totalAmount is required')
        const cn = await this.repo.createCreditNote(companyId, {
            customerId: data.customerId,
            invoiceId: data.invoiceId,
            reason: data.reason ?? data.memo,
            totalAmount: Number(data.totalAmount ?? data.amount ?? 0),
        })
        // Post GL entry: DR Sales Returns & Allowances (4040), CR Accounts Receivable (1100)
        await this.subLedger.postCreditNoteToGL(cn.id, userId)
        return this.normalizeCreditNote(cn)
    }

    async voidCreditNote(userId: string, companyId: string, creditNoteId: string) {
        await this.assertAccess(userId, companyId)
        const result = await this.repo.voidCreditNote(companyId, creditNoteId)
        if (!result) throw new NotFoundException('Credit note not found')
        // Reverse GL entry: DR Accounts Receivable (1100), CR Sales Returns & Allowances (4040)
        await this.subLedger.reverseCreditNoteGL(creditNoteId, userId)
        return { success: true, id: creditNoteId, status: 'VOID' }
    }

    async applyCreditNote(userId: string, companyId: string, creditNoteId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.invoiceId) throw new BadRequestException('invoiceId is required')
        if (data.amount == null) throw new BadRequestException('amount is required')
        const result = await this.repo.applyCreditNoteToInvoice(companyId, creditNoteId, data.invoiceId, Number(data.amount))
        if (!result) throw new NotFoundException('Credit note or invoice not found')
        return this.normalizeCreditNote(result)
    }

    async batchDeleteCreditNotes(userId: string, companyId: string, ids: string[]) {
        await this.assertAccess(userId, companyId)
        if (!Array.isArray(ids) || ids.length === 0) throw new BadRequestException('ids array is required')
        await this.repo.batchDeleteCreditNotes(companyId, ids)
        return { success: true, count: ids.length }
    }

    async exportCreditNotes(userId: string, companyId: string, opts: any = {}) {
        await this.assertAccess(userId, companyId)
        return this.repo.exportCreditNotes(companyId, opts)
    }

    // ─── AR Aging ─────────────────────────────────────────────────────────────

    async getArAging(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const raw = await this.repo.getArAging(companyId)

        // Provide both original bucket names and frontend-expected aliases
        const summary = {
            current: raw.buckets.current,
            days1to30: raw.buckets.days1_30,
            days31to60: raw.buckets.days31_60,
            days61to90: raw.buckets.days61_90,
            over90: raw.buckets.over90,
            total: raw.buckets.current + raw.buckets.days1_30 + raw.buckets.days31_60 + raw.buckets.days61_90 + raw.buckets.over90,
        }

        // Group rows by customer for the frontend aging table
        const customerMap = new Map<string, any>()
        for (const row of raw.rows) {
            const custId = row.customer?.contactId ?? row.id
            const custName = row.customer?.contact?.displayName ?? ''
            if (!customerMap.has(custId)) {
                customerMap.set(custId, { customerId: custId, customerName: custName, current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0 })
            }
            const entry = customerMap.get(custId)!
            const bal = Number(row.balance ?? 0)
            const daysOverdue = row.daysOverdue ?? 0
            if (daysOverdue <= 0) entry.current += bal
            else if (daysOverdue <= 30) entry.days30 += bal
            else if (daysOverdue <= 60) entry.days60 += bal
            else if (daysOverdue <= 90) entry.days90 += bal
            else entry.over90 += bal
            entry.total += bal
        }

        // Provide bucket array for ArAgingPage
        const buckets = [
            { label: 'Current', amount: summary.current, count: 0 },
            { label: '1-30 Days', amount: summary.days1to30, count: 0 },
            { label: '31-60 Days', amount: summary.days31to60, count: 0 },
            { label: '61-90 Days', amount: summary.days61to90, count: 0 },
            { label: 'Over 90 Days', amount: summary.over90, count: 0 },
        ]

        return {
            ...raw,
            summary,
            buckets,
            customers: Array.from(customerMap.values()),
        }
    }

    // ─── Recurring Invoices ───────────────────────────────────────────────────

    async listRecurringInvoices(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const rows = await this.repo.findRecurringInvoices(wid, companyId)
        return rows.map((r: any) => ({
            id: r.id,
            customer: r.customer?.contact?.displayName ?? '',
            customerId: r.customerId,
            frequency: r.frequency,
            startDate: r.startDate instanceof Date ? r.startDate.toISOString().split('T')[0] : r.startDate,
            endDate: r.endDate ? (r.endDate instanceof Date ? r.endDate.toISOString().split('T')[0] : r.endDate) : null,
            nextRun: r.nextRun instanceof Date ? r.nextRun.toISOString().split('T')[0] : r.nextRun,
            lastRun: r.lastRun ? (r.lastRun instanceof Date ? r.lastRun.toISOString().split('T')[0] : r.lastRun) : null,
            status: r.status,
            isActive: r.isActive,
            templateData: r.templateData,
        }))
    }

    async getRecurringInvoice(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const r = await this.repo.findRecurringInvoiceById(wid, id)
        if (!r) throw new NotFoundException('Recurring invoice not found')
        return r
    }

    async createRecurringInvoice(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const result = await this.repo.createRecurringInvoice(wid, companyId, data)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'CREATE', tableName: 'RecurringInvoice', recordId: result.id, changes: { frequency: data.frequency } },
        }).catch(() => {})
        return result
    }

    async updateRecurringInvoice(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const result = await this.repo.updateRecurringInvoice(id, data)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'UPDATE', tableName: 'RecurringInvoice', recordId: id, changes: data },
        }).catch(() => {})
        return result
    }

    async deleteRecurringInvoice(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        await this.repo.deleteRecurringInvoice(id)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'DELETE', tableName: 'RecurringInvoice', recordId: id, changes: {} },
        }).catch(() => {})
        return { success: true }
    }

    async generateRecurringInvoice(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const recurring = await this.repo.findRecurringInvoiceById(wid, id)
        if (!recurring) throw new NotFoundException('Recurring invoice not found')
        // Create invoice from template
        const template: any = recurring.templateData
        const invoiceNumber = await this.repo.generateInvoiceNumber(companyId)
        const invoice = await this.prisma.invoice.create({
            data: {
                workspaceId: wid,
                companyId,
                customerId: recurring.customerId,
                invoiceNumber,
                status: 'DRAFT',
                date: new Date(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                totalAmount: template?.totalAmount ?? 0,
                balance: template?.totalAmount ?? 0,
            },
        })
        await this.prisma.recurringInvoice.update({
            where: { id },
            data: { lastRun: new Date(), nextRun: this.computeNextRun(recurring.frequency, new Date()) },
        })
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'GENERATE', tableName: 'RecurringInvoice', recordId: id, changes: { invoiceId: invoice.id } },
        }).catch(() => {})
        return { invoiceId: invoice.id, invoiceNumber }
    }

    async batchDeleteRecurringInvoices(userId: string, companyId: string, ids: string[]) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        return this.repo.batchDeleteRecurringInvoices(wid, companyId, ids)
    }

    private computeNextRun(frequency: string, from: Date): Date {
        const d = new Date(from)
        switch (frequency.toUpperCase()) {
            case 'WEEKLY': d.setDate(d.getDate() + 7); break
            case 'BIWEEKLY': d.setDate(d.getDate() + 14); break
            case 'MONTHLY': d.setMonth(d.getMonth() + 1); break
            case 'QUARTERLY': d.setMonth(d.getMonth() + 3); break
            case 'ANNUALLY': d.setFullYear(d.getFullYear() + 1); break
            default: d.setMonth(d.getMonth() + 1)
        }
        return d
    }

    // ─── Write-Offs ───────────────────────────────────────────────────────────

    async listWriteOffs(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        return this.repo.findWriteOffs(wid, companyId)
    }

    async getWriteOff(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const r = await this.repo.findWriteOffById(wid, id)
        if (!r) throw new NotFoundException('Write-off not found')
        return r
    }

    async createWriteOff(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const result = await this.repo.createWriteOff(wid, companyId, data)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'CREATE', tableName: 'WriteOff', recordId: result.id, changes: { amount: data.amount } },
        }).catch(() => {})
        return result
    }

    async updateWriteOff(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const result = await this.repo.updateWriteOff(id, data)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'UPDATE', tableName: 'WriteOff', recordId: id, changes: data },
        }).catch(() => {})
        return result
    }

    async approveWriteOff(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const result = await this.repo.approveWriteOff(id, userId)
        await this.subLedger.postWriteOffToGL(id, userId)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'APPROVE', tableName: 'WriteOff', recordId: id, changes: { status: 'APPROVED' } },
        }).catch(() => {})
        return result
    }

    async reverseWriteOff(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        await this.subLedger.reverseWriteOffGL(id, userId)
        const result = await this.repo.reverseWriteOff(id)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'REVERSE', tableName: 'WriteOff', recordId: id, changes: { status: 'REVERSED' } },
        }).catch(() => {})
        return result
    }

    async deleteWriteOff(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        await this.repo.deleteWriteOff(id)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'DELETE', tableName: 'WriteOff', recordId: id, changes: {} },
        }).catch(() => {})
        return { success: true }
    }

    async batchDeleteWriteOffs(userId: string, companyId: string, ids: string[]) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        return this.repo.batchDeleteWriteOffs(wid, companyId, ids)
    }

    // ─── Sales Orders ─────────────────────────────────────────────────────────

    async listSalesOrders(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        return this.repo.findSalesOrders(wid, companyId)
    }

    async getSalesOrder(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const r = await this.repo.findSalesOrderById(wid, id)
        if (!r) throw new NotFoundException('Sales order not found')
        return r
    }

    async createSalesOrder(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const result = await this.repo.createSalesOrder(wid, companyId, data)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'CREATE', tableName: 'SalesOrder', recordId: result.id, changes: { orderNumber: result.orderNumber } },
        }).catch(() => {})
        return result
    }

    async updateSalesOrder(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const result = await this.repo.updateSalesOrder(id, data)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'UPDATE', tableName: 'SalesOrder', recordId: id, changes: data },
        }).catch(() => {})
        return result
    }

    async deleteSalesOrder(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        await this.repo.deleteSalesOrder(id)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'DELETE', tableName: 'SalesOrder', recordId: id, changes: {} },
        }).catch(() => {})
        return { success: true }
    }

    async convertSalesOrder(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const result = await this.repo.convertSalesOrderToInvoice(wid, companyId, id)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'CONVERT', tableName: 'SalesOrder', recordId: id, changes: { invoiceId: result.invoiceId } },
        }).catch(() => {})
        return result
    }

    async batchDeleteSalesOrders(userId: string, companyId: string, ids: string[]) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        return this.repo.batchDeleteSalesOrders(wid, companyId, ids)
    }

    // ─── Refunds (extended) ───────────────────────────────────────────────────

    async listRefundsEnriched(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        return this.repo.findRefunds(wid, companyId)
    }

    async getRefund(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const r = await this.repo.findRefundById(wid, id)
        if (!r) throw new NotFoundException('Refund not found')
        return r
    }

    async createRefund(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const result = await this.repo.createRefund(wid, companyId, data)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'CREATE', tableName: 'CustomerRefund', recordId: result.id, changes: { amount: data.amount } },
        }).catch(() => {})
        return result
    }

    async processRefund(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        await this.prisma.customerRefund.update({ where: { id }, data: { approvalStatus: 'APPROVED' } })
        await this.subLedger.postRefundToGL(id, userId)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'APPROVE', tableName: 'CustomerRefund', recordId: id, changes: { status: 'APPROVED' } },
        }).catch(() => {})
        return this.repo.findRefundById(wid, id)
    }

    async batchDeleteRefunds(userId: string, companyId: string, ids: string[]) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        return this.repo.batchDeleteRefunds(wid, companyId, ids)
    }

    // ─── Dunning ─────────────────────────────────────────────────────────────

    async sendDunningReminder(userId: string, companyId: string, invoiceId: string, level: number) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, companyId } })
        if (!invoice) throw new NotFoundException('Invoice not found')
        const levelMap: Record<number, string> = { 1: 'REMINDER', 2: 'WARNING', 3: 'FINAL_NOTICE' }
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { dunningLevel: level, dunningLastSentAt: new Date() },
        }).catch(() => {}) // field may not exist — non-critical
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'SEND', tableName: 'Invoice', recordId: invoiceId, changes: { dunningLevel: level, type: levelMap[level] ?? 'REMINDER' } },
        }).catch(() => {})
        return { success: true, level, sentAt: new Date() }
    }

    async batchSendDunning(userId: string, companyId: string, invoiceIds: string[], level: number) {
        await this.assertAccess(userId, companyId)
        const results = await Promise.allSettled(invoiceIds.map(id => this.sendDunningReminder(userId, companyId, id, level)))
        return { sent: results.filter(r => r.status === 'fulfilled').length, total: invoiceIds.length }
    }

    async updateDunningLevel(userId: string, companyId: string, invoiceId: string, level: number) {
        await this.assertAccess(userId, companyId)
        const wid = await this.getWorkspaceId(companyId)
        this.prisma.auditLog.create({
            data: { workspaceId: wid, companyId, userId, action: 'UPDATE', tableName: 'Invoice', recordId: invoiceId, changes: { dunningLevel: level } },
        }).catch(() => {})
        return { success: true, invoiceId, level }
    }

    async getSalesOrderActivity(userId: string, companyId: string, orderId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const limit = opts.limit ? parseInt(opts.limit) : 20
        const offset = opts.offset ? parseInt(opts.offset) : 0
        const where: any = { tableName: 'SalesOrder', recordId: orderId, companyId }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({ where, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
            this.prisma.auditLog.count({ where }),
        ])
        return { data: logs, total }
    }

    async getCreditNoteActivity(userId: string, companyId: string, creditNoteId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const limit = opts.limit ? parseInt(opts.limit) : 20
        const offset = opts.offset ? parseInt(opts.offset) : 0
        const where: any = { tableName: 'CreditNote', recordId: creditNoteId, companyId }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({ where, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
            this.prisma.auditLog.count({ where }),
        ])
        return { data: logs, total }
    }

    async getCustomerPaymentActivity(userId: string, companyId: string, paymentId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const limit = opts.limit ? parseInt(opts.limit) : 20
        const offset = opts.offset ? parseInt(opts.offset) : 0
        const where: any = { tableName: 'CustomerPayment', recordId: paymentId, companyId }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({ where, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
            this.prisma.auditLog.count({ where }),
        ])
        return { data: logs, total }
    }
}
