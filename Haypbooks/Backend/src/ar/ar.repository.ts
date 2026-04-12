import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { resolveAccount, createAndPostJE, createReversingJE, SYSTEM_ACCOUNTS } from '../shared/gl-integration'

@Injectable()
export class ArRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Contacts / Customers ─────────────────────────────────────────────────

    async findCustomers(workspaceId: string, companyId: string | undefined, opts: {
        search?: string; status?: string; groupId?: string;
        sort?: string; direction?: 'asc' | 'desc';
        limit?: number; offset?: number
    } = {}) {
        const { search, status, groupId, sort, direction = 'asc', limit = 50, offset = 0 } = opts
        const deletedFilter = status === 'INACTIVE'
            ? { deletedAt: { not: null as Date | null } }
            : status === 'ALL'
                ? {}
                : { deletedAt: null }
        const where: any = {
            workspaceId,
            ...deletedFilter,
            ...(groupId ? { groupId } : {}),
            ...(search ? { contact: { displayName: { contains: search, mode: 'insensitive' } } } : {}),
        }
        const orderBy = sort === 'creditLimit'
            ? { creditLimit: direction as any }
            : { contact: { displayName: direction as any } }
        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                include: {
                    contact: { select: { id: true, displayName: true, contactEmails: true, contactPhones: true } },
                    group: { select: { id: true, name: true } },
                },
                take: limit,
                skip: offset,
                orderBy,
            }),
            this.prisma.customer.count({ where }),
        ])
        if (!customers.length) return { data: [], total: 0 }
        const contactIds = customers.map(c => c.contactId)
        const [addresses, balances] = await Promise.all([
            this.prisma.contactAddress.findMany({ where: { contactId: { in: contactIds }, type: 'BILLING' } }),
            companyId
                ? this.prisma.invoice.groupBy({
                    by: ['customerId'],
                    where: { companyId, customerId: { in: contactIds }, deletedAt: null },
                    _sum: { balance: true, totalAmount: true },
                    _count: { id: true },
                })
                : Promise.resolve([]),
        ])
        const addrMap = new Map(addresses.map(a => [a.contactId, a]))
        const balMap = new Map((balances as any[]).map(b => [b.customerId, b]))
        return {
            data: customers.map(c => ({
                ...c,
                contactAddress: addrMap.get(c.contactId) ?? null,
                openBalance: Number(balMap.get(c.contactId)?._sum?.balance ?? 0),
                totalRevenue: Number(balMap.get(c.contactId)?._sum?.totalAmount ?? 0),
                invoiceCount: balMap.get(c.contactId)?._count?.id ?? 0,
            })),
            total,
        }
    }

    async findCustomerById(workspaceId: string, contactId: string) {
        const customer = await this.prisma.customer.findFirst({
            where: { contactId, workspaceId, deletedAt: null },
            include: {
                contact: { include: { contactEmails: true, contactPhones: true } },
                paymentTerm: true,
                group: { select: { id: true, name: true } },
            },
        })
        if (!customer) return null
        const addr = await this.prisma.contactAddress.findFirst({
            where: { contactId, type: 'BILLING' },
        })
        return { ...customer, contactAddress: addr ?? null }
    }

    async getCustomerDetail(workspaceId: string, companyId: string, contactId: string) {
        const customer = await this.prisma.customer.findFirst({
            where: { contactId, workspaceId },
            include: {
                contact: { include: { contactEmails: true, contactPhones: true } },
                paymentTerm: true,
                group: { select: { id: true, name: true } },
            },
        })
        if (!customer) return null
        const [addr, invoiceAgg, recentInvoices, recentPayments, openInvoiceCount] = await Promise.all([
            this.prisma.contactAddress.findFirst({ where: { contactId, type: 'BILLING' } }),
            this.prisma.invoice.aggregate({
                where: { companyId, customerId: contactId, deletedAt: null },
                _sum: { totalAmount: true, balance: true },
                _count: { id: true },
            }),
            this.prisma.invoice.findMany({
                where: { companyId, customerId: contactId, deletedAt: null },
                orderBy: { date: 'desc' },
                take: 5,
                select: { id: true, invoiceNumber: true, date: true, totalAmount: true, balance: true, status: true },
            }),
            this.prisma.paymentReceived.findMany({
                where: { companyId, customerId: contactId },
                orderBy: { paymentDate: 'desc' },
                take: 5,
                select: { id: true, referenceNumber: true, paymentDate: true, amount: true },
            }),
            this.prisma.invoice.count({
                where: { companyId, customerId: contactId, deletedAt: null, status: { notIn: ['PAID', 'VOID'] } },
            }),
        ])
        return {
            ...customer,
            contactAddress: addr ?? null,
            totalRevenue: Number(invoiceAgg._sum.totalAmount ?? 0),
            openBalance: Number(invoiceAgg._sum.balance ?? 0),
            invoiceCount: invoiceAgg._count.id,
            openInvoiceCount,
            recentInvoices: recentInvoices.map(inv => ({
                ...inv,
                total: Number(inv.totalAmount),
                balance: Number(inv.balance),
            })),
            recentPayments: recentPayments.map(p => ({
                ...p,
                amount: Number(p.amount),
            })),
        }
    }

    async createCustomer(workspaceId: string, data: {
        displayName: string
        email?: string
        phone?: string
        address?: string
        line1?: string
        city?: string
        state?: string
        zip?: string
        postalCode?: string
        country?: string
        paymentTermId?: string
        creditLimit?: number
    }) {
        return this.prisma.$transaction(async (tx) => {
            const contact = await tx.contact.create({
                data: {
                    workspaceId,
                    type: 'CUSTOMER',
                    displayName: data.displayName,
                    ...(data.email ? {
                        contactEmails: { create: [{ email: data.email, type: 'WORK', isPrimary: true }] },
                    } : {}),
                    ...(data.phone ? {
                        contactPhones: { create: [{ phone: data.phone, type: 'WORK', isPrimary: true }] },
                    } : {}),
                },
                include: { contactEmails: true, contactPhones: true },
            })
            const line1 = data.address ?? data.line1
            if (line1) {
                await tx.contactAddress.create({
                    data: {
                        contactId: contact.id,
                        workspaceId,
                        type: 'BILLING',
                        line1,
                        city: data.city ?? '',
                        state: data.state ?? '',
                        postalCode: data.zip ?? data.postalCode ?? '',
                        country: data.country ?? 'US',
                    },
                })
            }
            const customer = await tx.customer.create({
                data: {
                    contactId: contact.id,
                    workspaceId,
                    paymentTermId: data.paymentTermId ?? null,
                    creditLimit: data.creditLimit ?? null,
                },
            })
            const addr = line1
                ? await tx.contactAddress.findFirst({ where: { contactId: contact.id, type: 'BILLING' } })
                : null
            return { ...customer, contact, contactAddress: addr ?? null }
        })
    }

    async updateCustomer(workspaceId: string, contactId: string, data: any) {
        return this.prisma.$transaction(async (tx) => {
            if (data.displayName) {
                await tx.contact.update({ where: { id: contactId }, data: { displayName: data.displayName } })
            }
            // Persist email changes
            if (data.email !== undefined) {
                await tx.contactEmail.deleteMany({ where: { contactId } })
                if (data.email) {
                    await tx.contactEmail.create({ data: { contactId, email: data.email, type: 'WORK', isPrimary: true } })
                }
            }
            // Persist phone changes
            if (data.phone !== undefined) {
                await tx.contactPhone.deleteMany({ where: { contactId } })
                if (data.phone) {
                    await tx.contactPhone.create({ data: { contactId, phone: data.phone, type: 'WORK', isPrimary: true } })
                }
            }
            // Persist address changes
            const line1 = data.address ?? data.line1
            if (line1 !== undefined) {
                await tx.contactAddress.deleteMany({ where: { contactId, type: 'BILLING' } })
                if (line1) {
                    await tx.contactAddress.create({
                        data: {
                            contactId,
                            workspaceId,
                            type: 'BILLING',
                            line1,
                            city: data.city ?? '',
                            state: data.state ?? '',
                            postalCode: data.zip ?? data.postalCode ?? '',
                            country: data.country ?? 'US',
                        },
                    })
                }
            }
            const customer = await tx.customer.update({
                where: { contactId },
                data: {
                    paymentTermId: data.paymentTermId,
                    creditLimit: data.creditLimit,
                },
                include: {
                    contact: { include: { contactEmails: true, contactPhones: true } },
                },
            })
            const addr = await tx.contactAddress.findFirst({ where: { contactId, type: 'BILLING' } })
            return { ...customer, contactAddress: addr ?? null }
        })
    }

    async softDeleteCustomer(workspaceId: string, contactId: string) {
        await this.prisma.customer.update({ where: { contactId }, data: { deletedAt: new Date() } })
        return { success: true }
    }

    async batchDeleteCustomers(workspaceId: string, ids: string[]) {
        await this.prisma.customer.updateMany({
            where: { workspaceId, contactId: { in: ids } },
            data: { deletedAt: new Date() },
        })
        return { deleted: ids.length }
    }

    async batchUpdateCustomerStatus(workspaceId: string, ids: string[], status: 'ACTIVE' | 'INACTIVE') {
        const data = status === 'ACTIVE' ? { deletedAt: null } : { deletedAt: new Date() }
        await this.prisma.customer.updateMany({
            where: { workspaceId, contactId: { in: ids } },
            data,
        })
        return { updated: ids.length }
    }

    async batchUpdateCustomerGroup(workspaceId: string, ids: string[], groupId: string | null) {
        await this.prisma.customer.updateMany({
            where: { workspaceId, contactId: { in: ids } },
            data: { groupId },
        })
        return { updated: ids.length }
    }

    async getCustomersForExport(workspaceId: string, companyId: string, opts: {
        search?: string; status?: string; groupId?: string
    } = {}) {
        const { search, status, groupId } = opts
        const deletedFilter = status === 'INACTIVE'
            ? { deletedAt: { not: null as Date | null } }
            : status === 'ALL'
                ? {}
                : { deletedAt: null }
        const where: any = {
            workspaceId,
            ...deletedFilter,
            ...(groupId ? { groupId } : {}),
            ...(search ? { contact: { displayName: { contains: search, mode: 'insensitive' } } } : {}),
        }
        const customers = await this.prisma.customer.findMany({
            where,
            include: {
                contact: { include: { contactEmails: true, contactPhones: true } },
                paymentTerm: { select: { name: true } },
                group: { select: { name: true } },
            },
            orderBy: { contact: { displayName: 'asc' } },
        })
        if (!customers.length) return []
        const contactIds = customers.map(c => c.contactId)
        const [addresses, balances] = await Promise.all([
            this.prisma.contactAddress.findMany({ where: { contactId: { in: contactIds }, type: 'BILLING' } }),
            this.prisma.invoice.groupBy({
                by: ['customerId'],
                where: { companyId, customerId: { in: contactIds }, deletedAt: null },
                _sum: { balance: true, totalAmount: true },
                _count: { id: true },
            }),
        ])
        const addrMap = new Map(addresses.map(a => [a.contactId, a]))
        const balMap = new Map(balances.map((b: any) => [b.customerId, b]))
        return customers.map(c => ({
            ...c,
            contactAddress: addrMap.get(c.contactId) ?? null,
            openBalance: Number(balMap.get(c.contactId)?._sum?.balance ?? 0),
            totalRevenue: Number(balMap.get(c.contactId)?._sum?.totalAmount ?? 0),
            invoiceCount: balMap.get(c.contactId)?._count?.id ?? 0,
        }))
    }

    async listCustomerGroups(workspaceId: string) {
        const groups = await this.prisma.customerGroup.findMany({
            where: { workspaceId },
            select: {
                id: true, name: true, description: true,
                _count: { select: { customers: true } },
            },
            orderBy: { name: 'asc' },
        })
        return groups.map(g => ({
            id: g.id,
            name: g.name,
            description: g.description ?? '',
            customerCount: g._count.customers,
        }))
    }

    async createCustomerGroup(workspaceId: string, companyId: string, data: { name: string; description?: string }) {
        return this.prisma.customerGroup.create({
            data: { workspaceId, companyId, name: data.name, description: data.description ?? null },
        })
    }

    async getCustomerGroup(workspaceId: string, id: string) {
        const group = await this.prisma.customerGroup.findFirst({
            where: { id, workspaceId },
            select: {
                id: true, name: true, description: true,
                _count: { select: { customers: true } },
            },
        })
        if (!group) return null
        return { id: group.id, name: group.name, description: group.description ?? '', customerCount: group._count.customers }
    }

    async updateCustomerGroup(workspaceId: string, id: string, data: { name?: string; description?: string }) {
        return this.prisma.customerGroup.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
            },
            select: { id: true, name: true, description: true },
        })
    }

    async deleteCustomerGroup(workspaceId: string, id: string) {
        await this.prisma.customer.updateMany({ where: { groupId: id, workspaceId }, data: { groupId: null } })
        return this.prisma.customerGroup.delete({ where: { id } })
    }

    async listGroupMembers(workspaceId: string, groupId: string, opts: { search?: string; limit?: number; offset?: number } = {}) {
        const where: any = {
            workspaceId,
            groupId,
            deletedAt: null,
            ...(opts.search ? { contact: { displayName: { contains: opts.search, mode: 'insensitive' } } } : {}),
        }
        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                include: {
                    contact: { select: { displayName: true, contactEmails: true } },
                    paymentTerm: { select: { name: true } },
                },
                orderBy: { contact: { displayName: 'asc' } },
                take: opts.limit ?? 50,
                skip: opts.offset ?? 0,
            }),
            this.prisma.customer.count({ where }),
        ])
        return {
            data: customers.map(c => ({
                id: c.contactId,
                name: c.contact.displayName,
                email: (c.contact.contactEmails as any[])?.[0]?.email ?? '',
                paymentTermName: c.paymentTerm?.name ?? '',
            })),
            total,
        }
    }

    async addGroupMembers(workspaceId: string, groupId: string, customerIds: string[]) {
        return this.prisma.customer.updateMany({
            where: { contactId: { in: customerIds }, workspaceId, groupId: null },
            data: { groupId },
        })
    }

    async removeGroupMembers(workspaceId: string, groupId: string, customerIds: string[]) {
        return this.prisma.customer.updateMany({
            where: { contactId: { in: customerIds }, workspaceId, groupId },
            data: { groupId: null },
        })
    }

    async batchDeleteCustomerGroups(workspaceId: string, ids: string[]) {
        await this.prisma.customer.updateMany({ where: { groupId: { in: ids }, workspaceId }, data: { groupId: null } })
        return this.prisma.customerGroup.deleteMany({ where: { id: { in: ids }, workspaceId } })
    }

    async exportCustomerGroupsCsv(workspaceId: string) {
        const groups = await this.prisma.customerGroup.findMany({
            where: { workspaceId },
            select: { id: true, name: true, description: true, _count: { select: { customers: true } } },
            orderBy: { name: 'asc' },
        })
        return groups.map(g => ({ id: g.id, name: g.name, description: g.description ?? '', customerCount: g._count.customers }))
    }

    async findPaymentTerms(workspaceId: string) {
        return this.prisma.paymentTerm.findMany({
            where: { workspaceId, isActive: true },
            orderBy: { dueDays: 'asc' },
            select: { id: true, name: true, dueDays: true },
        })
    }

    // ─── Quotes ───────────────────────────────────────────────────────────────

    async findQuotes(companyId: string, opts: { customerId?: string; status?: string; limit?: number; offset?: number } = {}) {
        return this.prisma.quote.findMany({
            where: {
                companyId,
                deletedAt: null,
                ...(opts.customerId ? { customerId: opts.customerId } : {}),
                ...(opts.status ? { status: opts.status as any } : {}),
            },
            include: {
                customer: { include: { contact: { select: { id: true, displayName: true } } } },
                lines: true,
            },
            orderBy: { issuedAt: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findQuoteById(companyId: string, quoteId: string) {
        return this.prisma.quote.findFirst({
            where: { id: quoteId, companyId, deletedAt: null },
            include: {
                customer: { include: { contact: { select: { displayName: true, contactEmails: true } } } },
                lines: { include: { item: { select: { id: true, name: true } } } },
            },
        })
    }

    async createQuote(data: {
        workspaceId: string, companyId: string, customerId: string, expiryDate?: Date, lines: any[]
    }) {
        const count = await this.prisma.quote.count({ where: { companyId: data.companyId } })
        const quoteNumber = `QT-${String(count + 1).padStart(4, '0')}`
        const totalAmount = data.lines.reduce((s: number, l: any) => s + Number(l.amount ?? 0), 0)
        return this.prisma.quote.create({
            data: {
                workspaceId: data.workspaceId,
                companyId: data.companyId,
                customerId: data.customerId,
                quoteNumber,
                totalAmount,
                expiryDate: data.expiryDate ?? null,
                lines: {
                    create: data.lines.map((l: any) => ({
                        companyId: data.companyId,
                        description: l.description,
                        quantity: l.quantity ?? 1,
                        unitPrice: l.unitPrice ?? 0,
                        amount: l.amount ?? Number(l.quantity ?? 1) * Number(l.unitPrice ?? 0),
                        itemId: l.itemId ?? null,
                    })),
                },
            },
            include: { lines: true },
        })
    }

    async updateQuoteStatus(companyId: string, quoteId: string, status: string) {
        return this.prisma.quote.update({ where: { id: quoteId }, data: { status: status as any } })
    }

    async updateQuote(companyId: string, quoteId: string, data: { customerId?: string; expiryDate?: Date | null; lines?: any[] }) {
        const updates: any = {}
        if (data.customerId !== undefined) updates.customerId = data.customerId
        if (data.expiryDate !== undefined) updates.expiryDate = data.expiryDate
        if (data.lines !== undefined) {
            const totalAmount = data.lines.reduce((s: number, l: any) => s + Number(l.amount ?? (Number(l.quantity ?? 1) * Number(l.unitPrice ?? 0))), 0)
            updates.totalAmount = totalAmount
            await this.prisma.quoteLine.deleteMany({ where: { quoteId } })
            updates.lines = {
                create: data.lines.map((l: any) => ({
                    companyId,
                    description: l.description,
                    quantity: l.quantity ?? 1,
                    unitPrice: l.unitPrice ?? 0,
                    amount: l.amount ?? Number(l.quantity ?? 1) * Number(l.unitPrice ?? 0),
                    itemId: l.itemId ?? null,
                })),
            }
        }
        return this.prisma.quote.update({
            where: { id: quoteId },
            data: updates,
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
                lines: true,
            },
        })
    }

    async deleteQuote(companyId: string, quoteId: string) {
        await this.prisma.quote.update({ where: { id: quoteId }, data: { deletedAt: new Date() } })
    }

    async batchDeleteQuotes(companyId: string, ids: string[]) {
        return this.prisma.quote.updateMany({ where: { id: { in: ids }, companyId }, data: { deletedAt: new Date() } })
    }

    async batchUpdateQuoteStatus(companyId: string, ids: string[], status: string) {
        return this.prisma.quote.updateMany({ where: { id: { in: ids }, companyId, deletedAt: null }, data: { status: status as any } })
    }

    async exportQuotes(companyId: string, opts: { status?: string; search?: string } = {}) {
        const rows = await this.prisma.quote.findMany({
            where: {
                companyId,
                deletedAt: null,
                ...(opts.status ? { status: opts.status as any } : {}),
            },
            include: { customer: { include: { contact: { select: { displayName: true } } } }, lines: true },
            orderBy: { issuedAt: 'desc' },
        })
        const header = ['Quote #', 'Customer', 'Date', 'Expiry', 'Amount', 'Status', 'Line Count']
        const data = rows.map(q => [
            q.quoteNumber ?? `QT-${q.id.slice(0, 8)}`,
            q.customer?.contact?.displayName ?? '',
            q.issuedAt instanceof Date ? q.issuedAt.toISOString().split('T')[0] : (q.issuedAt ?? ''),
            q.expiryDate instanceof Date ? q.expiryDate.toISOString().split('T')[0] : (q.expiryDate ?? ''),
            q.totalAmount.toString(),
            q.status,
            q.lines?.length ?? 0,
        ])
        return [header, ...data].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    }

    async convertQuoteToInvoice(companyId: string, workspaceId: string, quoteId: string, createdById: string) {
        const quote = await this.prisma.quote.findFirst({
            where: { id: quoteId, companyId, deletedAt: null },
            include: { lines: true },
        })
        if (!quote) return null

        return this.prisma.$transaction(async (tx) => {
            const invoiceDate = new Date()
            const dueDate = quote.expiryDate ?? new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            const invoice = await tx.invoice.create({
                data: {
                    workspaceId,
                    companyId,
                    customerId: quote.customerId,
                    totalAmount: quote.totalAmount,
                    balance: quote.totalAmount,
                    date: invoiceDate,
                    dueDate,
                    status: 'DRAFT',
                    postingStatus: 'DRAFT',
                    createdById,
                    lines: {
                        create: quote.lines.map((l) => ({
                            companyId,
                            workspaceId,
                            description: l.description,
                            quantity: l.quantity,
                            unitPrice: l.unitPrice,
                            totalPrice: l.amount,
                        })),
                    },
                },
                include: { lines: true },
            })
            // Mark quote as converted
            await tx.quote.update({
                where: { id: quoteId },
                data: { status: 'CONVERTED', convertedToInvoiceId: invoice.id, acceptedAt: new Date() },
            })
            return invoice
        })
    }

    // ─── Invoices ─────────────────────────────────────────────────────────────

    async findInvoices(companyId: string, opts: {
        customerId?: string, status?: string, from?: Date, to?: Date, limit?: number, offset?: number
    } = {}) {
        return this.prisma.invoice.findMany({
            where: {
                companyId,
                deletedAt: null,
                ...(opts.customerId ? { customerId: opts.customerId } : {}),
                ...(opts.status ? { status: opts.status as any } : {}),
                ...(opts.from || opts.to ? {
                    date: {
                        ...(opts.from ? { gte: opts.from } : {}),
                        ...(opts.to ? { lte: opts.to } : {}),
                    },
                } : {}),
            },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
                lines: { select: { id: true, description: true, quantity: true, unitPrice: true, totalPrice: true } },
                createdBy: { select: { id: true, name: true } },
            },
            orderBy: { date: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findInvoiceById(companyId: string, invoiceId: string) {
        return this.prisma.invoice.findFirst({
            where: { id: invoiceId, companyId, deletedAt: null },
            include: {
                customer: { include: { contact: { include: { contactEmails: true } } } },
                lines: { include: { item: { select: { id: true, name: true } } } },
                InvoicePaymentApplication: { include: { payment: true } },
                createdBy: { select: { id: true, name: true } },
                journalEntry: { select: { id: true, entryNumber: true, postingStatus: true } },
            },
        })
    }

    async createInvoice(data: {
        workspaceId: string, companyId: string, customerId: string, dueDate?: Date,
        paymentTermId?: string, currency?: string, createdById: string, lines: any[]
    }) {
        const totalAmount = data.lines.reduce((s: number, l: any) => s + Number(l.amount ?? 0), 0)
        return this.prisma.invoice.create({
            data: {
                workspaceId: data.workspaceId,
                companyId: data.companyId,
                customerId: data.customerId,
                status: 'DRAFT',
                postingStatus: 'DRAFT',
                totalAmount,
                balance: totalAmount,
                currency: data.currency ?? 'PHP',
                date: new Date(),
                dueDate: data.dueDate ?? null,
                paymentTermId: data.paymentTermId ?? null,
                createdById: data.createdById,
                lines: {
                    create: data.lines.map((l: any) => ({
                        companyId: data.companyId,
                        workspaceId: data.workspaceId,
                        description: l.description,
                        quantity: l.quantity ?? 1,
                        unitPrice: l.unitPrice ?? 0,
                        totalPrice: l.amount ?? Number(l.quantity ?? 1) * Number(l.unitPrice ?? 0),
                        itemId: l.itemId ?? null,
                        discountPercent: l.discountPercent ?? null,
                        discountAmount: l.discountAmount ?? null,
                    })),
                },
            },
            include: { lines: true },
        })
    }

    async updateInvoice(companyId: string, invoiceId: string, data: any, updatedById: string) {
        const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, companyId, deletedAt: null } })
        if (!invoice || invoice.status !== 'DRAFT') return null

        return this.prisma.$transaction(async (tx) => {
            if (data.lines) {
                await tx.invoiceLine.deleteMany({ where: { invoiceId } })
            }
            const totalAmount = data.lines
                ? data.lines.reduce((s: number, l: any) => s + Number(l.amount ?? 0), 0)
                : invoice.totalAmount

            return tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    customerId: data.customerId,
                    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                    paymentTermId: data.paymentTermId,
                    currency: data.currency,
                    totalAmount,
                    balance: totalAmount,
                    updatedById,
                    ...(data.lines ? {
                        lines: {
                            create: data.lines.map((l: any) => ({
                                companyId,
                                workspaceId: invoice.workspaceId,
                                description: l.description,
                                quantity: l.quantity ?? 1,
                                unitPrice: l.unitPrice ?? 0,
                                totalPrice: l.amount ?? Number(l.quantity ?? 1) * Number(l.unitPrice ?? 0),
                                itemId: l.itemId ?? null,
                            })),
                        },
                    } : {}),
                } as any,
                include: { lines: true },
            })
        })
    }

    async sendInvoice(companyId: string, invoiceId: string) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id: invoiceId, companyId },
            include: { lines: true },
        })
        if (!invoice) return null
        const invoiceNumber = invoice.invoiceNumber ?? `INV-${Date.now()}`

        return this.prisma.$transaction(async (tx) => {
            // Resolve system accounts
            const arAcct  = await resolveAccount(tx, companyId, SYSTEM_ACCOUNTS.ACCOUNTS_RECEIVABLE)
            const revAcct = await resolveAccount(tx, companyId, SYSTEM_ACCOUNTS.SERVICE_REVENUE)

            const total = Number(invoice.totalAmount)

            // Create & post JE: Dr Accounts Receivable, Cr Revenue
            const jeId = await createAndPostJE(tx, {
                workspaceId: invoice.workspaceId,
                companyId,
                date: invoice.date ?? new Date(),
                description: `Invoice ${invoiceNumber}`,
                createdById: invoice.createdById ?? 'system',
                lines: [
                    { accountId: arAcct.id,  debit: total, credit: 0, description: `AR – ${invoiceNumber}` },
                    { accountId: revAcct.id, debit: 0, credit: total, description: `Revenue – ${invoiceNumber}` },
                ],
            })

            return tx.invoice.update({
                where: { id: invoiceId },
                data: { status: 'SENT', invoiceNumber, journalEntryId: jeId, postingStatus: 'POSTED' },
            })
        })
    }

    async voidInvoice(companyId: string, invoiceId: string) {
        const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, companyId } })
        if (!invoice) return null

        return this.prisma.$transaction(async (tx) => {
            // Reverse the JE if one was posted
            if (invoice.journalEntryId) {
                await createReversingJE(tx, companyId, invoice.journalEntryId, `Void invoice ${invoice.invoiceNumber ?? invoiceId}`)
            }
            return tx.invoice.update({
                where: { id: invoiceId },
                data: { status: 'VOID', postingStatus: 'VOIDED', deletedAt: new Date() },
            })
        })
    }

    // ─── Payments Received ────────────────────────────────────────────────────

    async findPayments(companyId: string, opts: {
        customerId?: string, invoiceId?: string, from?: Date, to?: Date, limit?: number, offset?: number
    } = {}) {
        return this.prisma.paymentReceived.findMany({
            where: {
                companyId,
                deletedAt: null,
                ...(opts.customerId ? { customerId: opts.customerId } : {}),
                ...(opts.invoiceId ? { InvoicePaymentApplication: { some: { invoiceId: opts.invoiceId } } } : {}),
                ...(opts.from || opts.to ? {
                    paymentDate: {
                        ...(opts.from ? { gte: opts.from } : {}),
                        ...(opts.to ? { lte: opts.to } : {}),
                    },
                } : {}),
            },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
                InvoicePaymentApplication: { include: { invoice: { select: { id: true, invoiceNumber: true, totalAmount: true } } } },
            },
            orderBy: { paymentDate: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findPaymentById(companyId: string, paymentId: string) {
        return this.prisma.paymentReceived.findFirst({
            where: { id: paymentId, companyId, deletedAt: null },
            include: {
                customer: { include: { contact: true } },
                InvoicePaymentApplication: { include: { invoice: true } },
                journalEntry: { select: { id: true, entryNumber: true } },
            },
        })
    }

    async recordPayment(data: {
        workspaceId: string, companyId: string, customerId: string,
        amount: number, paymentDate: Date, referenceNumber?: string,
        paymentMethodId?: string, bankAccountId?: string, createdById: string,
        applications: Array<{ invoiceId: string, amount: number }>
    }) {
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.paymentReceived.create({
                data: {
                    workspaceId: data.workspaceId,
                    companyId: data.companyId,
                    customerId: data.customerId,
                    amount: data.amount,
                    paymentDate: data.paymentDate,
                    referenceNumber: data.referenceNumber ?? null,
                    paymentMethodId: data.paymentMethodId ?? null,
                    bankAccountId: data.bankAccountId ?? null,
                    createdById: data.createdById,
                },
            })

            // Apply payment to invoices
            for (const app of data.applications ?? []) {
                await tx.invoicePaymentApplication.create({
                    data: {
                        workspaceId: data.workspaceId,
                        invoiceId: app.invoiceId,
                        paymentId: payment.id,
                        amount: app.amount,
                    },
                })
                // Update invoice balance
                const invoice = await tx.invoice.findUnique({ where: { id: app.invoiceId } })
                if (invoice) {
                    const newBalance = Math.max(0, Number(invoice.balance) - Number(app.amount))
                    const newStatus = newBalance <= 0 ? 'PAID' : (Number(app.amount) > 0 ? 'PARTIAL' : invoice.status)
                    await tx.invoice.update({
                        where: { id: app.invoiceId },
                        data: { balance: newBalance, status: newStatus as any, paymentStatus: newBalance <= 0 ? 'PAID' : 'PARTIAL' as any },
                    })
                }
            }

            // GL: Dr Cash/Bank, Cr Accounts Receivable
            const cashAcct = await resolveAccount(tx, data.companyId, SYSTEM_ACCOUNTS.CASH)
            const arAcct   = await resolveAccount(tx, data.companyId, SYSTEM_ACCOUNTS.ACCOUNTS_RECEIVABLE)
            const jeId = await createAndPostJE(tx, {
                workspaceId: data.workspaceId,
                companyId: data.companyId,
                date: data.paymentDate,
                description: `Payment received – ${data.referenceNumber ?? payment.id}`,
                createdById: data.createdById,
                lines: [
                    { accountId: cashAcct.id, debit: data.amount, credit: 0, description: 'Cash received' },
                    { accountId: arAcct.id,   debit: 0, credit: data.amount, description: 'AR applied' },
                ],
            })
            return tx.paymentReceived.update({ where: { id: payment.id }, data: { journalEntryId: jeId } })
        })
    }

    async applyPaymentToInvoices(companyId: string, paymentId: string, allocations: Array<{ invoiceId: string; amount: number }>) {
        const payment = await this.prisma.paymentReceived.findFirst({ where: { id: paymentId, companyId, deletedAt: null } })
        if (!payment) throw new Error('Payment not found')

        return this.prisma.$transaction(async (tx) => {
            let remaining = Number(payment.amount)
            for (const alloc of allocations || []) {
                if (alloc.amount <= 0) continue
                if (alloc.amount > remaining) throw new Error('Allocation exceeds payment amount')

                const invoice = await tx.invoice.findFirst({ where: { id: alloc.invoiceId, companyId, deletedAt: null } })
                if (!invoice) throw new Error('Invoice not found')

                await tx.invoicePaymentApplication.create({
                    data: {
                        workspaceId: payment.workspaceId,
                        invoiceId: alloc.invoiceId,
                        paymentId,
                        amount: alloc.amount,
                    },
                })

                const newBalance = Math.max(0, Number(invoice.balance) - Number(alloc.amount))
                const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIAL'

                await tx.invoice.update({
                    where: { id: alloc.invoiceId },
                    data: {
                        balance: newBalance,
                        status: newStatus as any,
                        paymentStatus: newBalance <= 0 ? 'PAID' : 'PARTIAL' as any,
                    },
                })

                remaining -= alloc.amount
            }

            return { paymentId, allocations, remaining }
        })
    }

    async voidPayment(companyId: string, paymentId: string) {
        const payment = await this.prisma.paymentReceived.findFirst({ where: { id: paymentId, companyId, deletedAt: null } })
        if (!payment) return null

        return this.prisma.$transaction(async (tx) => {
            // Reverse invoice applications
            const applications = await tx.invoicePaymentApplication.findMany({ where: { paymentId } })
            for (const app of applications) {
                const invoice = await tx.invoice.findUnique({ where: { id: app.invoiceId } })
                if (invoice && invoice.status !== 'VOID') {
                    const restoredBalance = Number(invoice.balance) + Number(app.amount)
                    await tx.invoice.update({
                        where: { id: app.invoiceId },
                        data: {
                            balance: restoredBalance,
                            status: restoredBalance >= Number(invoice.totalAmount) ? 'SENT' : 'PARTIAL' as any,
                            paymentStatus: 'PARTIAL' as any,
                        },
                    })
                }
                await tx.invoicePaymentApplication.delete({ where: { id: app.id } })
            }

            // Reverse the JE
            if (payment.journalEntryId) {
                await createReversingJE(tx, companyId, payment.journalEntryId, `Void payment ${paymentId}`)
            }

            return tx.paymentReceived.update({ where: { id: paymentId }, data: { deletedAt: new Date() } })
        })
    }

    // ─── Aging Report ─────────────────────────────────────────────────────────

    async getArAging(companyId: string) {
        const invoices = await this.prisma.invoice.findMany({
            where: {
                companyId,
                deletedAt: null,
                status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] as any },
                balance: { gt: 0 },
            },
            select: {
                id: true, invoiceNumber: true, date: true, dueDate: true, totalAmount: true, balance: true,
                customer: { include: { contact: { select: { displayName: true } } } },
            },
        })

        const today = new Date()
        const buckets = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, over90: 0 }

        const rows = invoices.map((inv) => {
            const daysOverdue = inv.dueDate ? Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / 86400000) : 0
            const bal = Number(inv.balance)
            if (daysOverdue <= 0) buckets.current += bal
            else if (daysOverdue <= 30) buckets.days1_30 += bal
            else if (daysOverdue <= 60) buckets.days31_60 += bal
            else if (daysOverdue <= 90) buckets.days61_90 += bal
            else buckets.over90 += bal
            return { ...inv, daysOverdue }
        })

        return { rows, buckets, generatedAt: today.toISOString() }
    }

    // ─── Credit Notes ─────────────────────────────────────────────────────────

    async findCreditNotes(companyId: string, opts: {
        status?: string; search?: string; limit?: number; offset?: number
    } = {}) {
        return this.prisma.creditNote.findMany({
            where: {
                companyId,
                ...(opts.status ? { status: opts.status as any } : {}),
                ...(opts.search ? {
                    OR: [
                        { creditNoteNumber: { contains: opts.search, mode: 'insensitive' } },
                        { reason: { contains: opts.search, mode: 'insensitive' } },
                        { customer: { contact: { displayName: { contains: opts.search, mode: 'insensitive' } } } },
                    ],
                } : {}),
            },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
                invoice: { select: { id: true, invoiceNumber: true } },
            },
            orderBy: { issuedAt: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findCreditNoteById(companyId: string, creditNoteId: string) {
        return this.prisma.creditNote.findFirst({
            where: { id: creditNoteId, companyId },
            include: {
                customer: { include: { contact: true } },
                invoice: { select: { id: true, invoiceNumber: true, balance: true, totalAmount: true } },
            },
        })
    }

    async createCreditNote(companyId: string, data: {
        customerId: string
        invoiceId?: string
        reason: string
        totalAmount: number
        status?: string
    }) {
        const count = await this.prisma.creditNote.count({ where: { companyId } })
        const creditNoteNumber = `CN-${String(count + 1).padStart(4, '0')}`
        return this.prisma.creditNote.create({
            data: {
                companyId,
                customerId: data.customerId,
                invoiceId: data.invoiceId ?? null,
                creditNoteNumber,
                reason: data.reason,
                totalAmount: data.totalAmount,
                status: (data.status ?? 'DRAFT') as any,
            },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
                invoice: { select: { id: true, invoiceNumber: true } },
            },
        })
    }

    async voidCreditNote(companyId: string, creditNoteId: string) {
        const cn = await this.prisma.creditNote.findFirst({ where: { id: creditNoteId, companyId } })
        if (!cn) return null
        return this.prisma.creditNote.update({
            where: { id: creditNoteId },
            data: { status: 'VOID' as any },
        })
    }

    async applyCreditNoteToInvoice(companyId: string, creditNoteId: string, invoiceId: string, amount: number) {
        const cn = await this.prisma.creditNote.findFirst({ where: { id: creditNoteId, companyId } })
        if (!cn) return null
        const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, companyId, deletedAt: null } })
        if (!invoice) return null

        const applyAmt = Math.min(amount, Number(invoice.balance), Number(cn.totalAmount))

        return this.prisma.$transaction(async (tx) => {
            const newBalance = Math.max(0, Number(invoice.balance) - applyAmt)
            await tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    balance: newBalance,
                    status: newBalance <= 0 ? 'PAID' as any : invoice.status,
                },
            })
            const updated = await tx.creditNote.update({
                where: { id: creditNoteId },
                data: { status: 'APPLIED' as any, invoiceId },
                include: { customer: { include: { contact: { select: { displayName: true } } } }, invoice: { select: { id: true, invoiceNumber: true } } },
            })
            return updated
        })
    }

    // ─── Recurring Invoices ───────────────────────────────────────────────────

    async findRecurringInvoices(workspaceId: string, companyId: string) {
        const rows = await this.prisma.recurringInvoice.findMany({
            where: { workspaceId, companyId, deletedAt: null },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        })
        return rows.map(r => this.normalizeRecurringInvoice(r))
    }

    private normalizeRecurringInvoice(r: any) {
        return {
            id: r.id,
            customer: r.customer?.contact?.displayName ?? '',
            customerId: r.customerId,
            frequency: r.frequency,
            startDate: r.startDate instanceof Date ? r.startDate.toISOString().split('T')[0] : r.startDate,
            endDate: r.endDate ? (r.endDate instanceof Date ? r.endDate.toISOString().split('T')[0] : r.endDate) : null,
            nextRun: r.nextRun instanceof Date ? r.nextRun.toISOString().split('T')[0] : r.nextRun,
            status: r.status,
            isActive: r.isActive,
            templateData: r.templateData ?? {},
            recurrenceRule: r.recurrenceRule ?? null,
        }
    }

    async findRecurringInvoiceById(workspaceId: string, id: string) {
        return this.prisma.recurringInvoice.findFirst({
            where: { id, workspaceId, deletedAt: null },
            include: {
                customer: { include: { contact: { select: { displayName: true, contactEmails: true } } } },
            },
        })
    }

    async createRecurringInvoice(workspaceId: string, companyId: string, data: any) {
        return this.prisma.recurringInvoice.create({
            data: {
                workspaceId,
                companyId,
                customerId: data.customerId,
                frequency: data.frequency,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                nextRun: new Date(data.startDate),
                status: data.status ?? 'ACTIVE',
                isActive: data.status !== 'PAUSED',
                templateData: data.templateData ?? {},
                recurrenceRule: data.recurrenceRule ?? null,
            },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
            },
        })
    }

    async updateRecurringInvoice(id: string, data: any) {
        const updateData: any = {}
        if (data.frequency !== undefined) updateData.frequency = data.frequency
        if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
        if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
        if (data.status !== undefined) { updateData.status = data.status; updateData.isActive = data.status === 'ACTIVE' }
        if (data.templateData !== undefined) updateData.templateData = data.templateData
        if (data.customerId !== undefined) updateData.customerId = data.customerId
        return this.prisma.recurringInvoice.update({
            where: { id },
            data: updateData,
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
            },
        })
    }

    async deleteRecurringInvoice(id: string) {
        return this.prisma.recurringInvoice.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } })
    }

    async batchDeleteRecurringInvoices(workspaceId: string, companyId: string, ids: string[]) {
        return this.prisma.recurringInvoice.updateMany({
            where: { id: { in: ids }, workspaceId, companyId },
            data: { deletedAt: new Date(), isActive: false },
        })
    }

    // ─── Write-Offs ───────────────────────────────────────────────────────────

    async findWriteOffs(workspaceId: string, companyId: string) {
        const rows = await this.prisma.writeOff.findMany({
            where: { workspaceId, companyId },
            include: {
                invoice: {
                    select: {
                        invoiceNumber: true,
                        customer: { include: { contact: { select: { displayName: true } } } },
                    },
                },
            },
            orderBy: { writeOffDate: 'desc' },
        })
        return rows.map(r => this.normalizeWriteOff(r))
    }

    async findWriteOffById(workspaceId: string, id: string) {
        const r = await this.prisma.writeOff.findFirst({
            where: { id, workspaceId },
            include: {
                invoice: {
                    select: {
                        invoiceNumber: true,
                        totalAmount: true,
                        customer: { include: { contact: { select: { displayName: true } } } },
                    },
                },
                journalEntry: { select: { id: true, entryNumber: true } },
            },
        })
        if (!r) return null
        return this.normalizeWriteOff(r)
    }

    private normalizeWriteOff(r: any) {
        return {
            id: r.id,
            writeOffNumber: `WO-${r.id.slice(0, 8).toUpperCase()}`,
            customer: r.invoice?.customer?.contact?.displayName ?? '',
            invoiceNumber: r.invoice?.invoiceNumber ?? '',
            amount: r.amount.toString(),
            reason: r.reason ?? '',
            date: r.writeOffDate instanceof Date ? r.writeOffDate.toISOString().split('T')[0] : r.writeOffDate,
            approvedBy: r.approvedBy ?? '',
            status: r.status ?? 'DRAFT',
            journalEntryId: r.journalEntryId ?? null,
            journalEntryNumber: r.journalEntry?.entryNumber ?? null,
            invoiceId: r.invoiceId ?? null,
        }
    }

    async createWriteOff(workspaceId: string, companyId: string, data: any) {
        const r = await this.prisma.writeOff.create({
            data: {
                workspaceId,
                companyId,
                invoiceId: data.invoiceId ?? null,
                amount: data.amount,
                writeOffDate: data.writeOffDate ? new Date(data.writeOffDate) : new Date(),
                reason: data.reason ?? null,
                status: 'DRAFT',
            },
            include: {
                invoice: {
                    select: {
                        invoiceNumber: true,
                        customer: { include: { contact: { select: { displayName: true } } } },
                    },
                },
            },
        })
        return this.normalizeWriteOff(r)
    }

    async updateWriteOff(id: string, data: any) {
        const updateData: any = {}
        if (data.amount !== undefined) updateData.amount = data.amount
        if (data.reason !== undefined) updateData.reason = data.reason
        if (data.writeOffDate !== undefined) updateData.writeOffDate = new Date(data.writeOffDate)
        if (data.invoiceId !== undefined) updateData.invoiceId = data.invoiceId
        const r = await this.prisma.writeOff.update({
            where: { id },
            data: updateData,
            include: {
                invoice: {
                    select: {
                        invoiceNumber: true,
                        customer: { include: { contact: { select: { displayName: true } } } },
                    },
                },
            },
        })
        return this.normalizeWriteOff(r)
    }

    async approveWriteOff(id: string, userId: string) {
        const r = await this.prisma.writeOff.update({
            where: { id },
            data: { status: 'APPROVED', approvedBy: userId },
            include: {
                invoice: {
                    select: {
                        invoiceNumber: true,
                        customer: { include: { contact: { select: { displayName: true } } } },
                    },
                },
            },
        })
        return this.normalizeWriteOff(r)
    }

    async reverseWriteOff(id: string) {
        const r = await this.prisma.writeOff.update({
            where: { id },
            data: { status: 'REVERSED', journalEntryId: null },
            include: {
                invoice: {
                    select: {
                        invoiceNumber: true,
                        customer: { include: { contact: { select: { displayName: true } } } },
                    },
                },
            },
        })
        return this.normalizeWriteOff(r)
    }

    async deleteWriteOff(id: string) {
        return this.prisma.writeOff.delete({ where: { id } })
    }

    async batchDeleteWriteOffs(workspaceId: string, companyId: string, ids: string[]) {
        return this.prisma.writeOff.deleteMany({ where: { id: { in: ids }, workspaceId, companyId } })
    }

    // ─── Sales Orders ─────────────────────────────────────────────────────────

    async findSalesOrders(workspaceId: string, companyId: string) {
        const rows = await this.prisma.salesOrder.findMany({
            where: { workspaceId, companyId },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
            },
            orderBy: { orderDate: 'desc' },
        })
        return rows.map(r => this.normalizeSalesOrder(r))
    }

    async findSalesOrderById(workspaceId: string, id: string) {
        const r = await this.prisma.salesOrder.findFirst({
            where: { id, workspaceId },
            include: {
                customer: { include: { contact: { select: { displayName: true, contactEmails: true } } } },
                lines: { include: { item: { select: { id: true, name: true } } } },
                invoice: { select: { id: true, invoiceNumber: true, status: true } },
            },
        })
        if (!r) return null
        return { ...this.normalizeSalesOrder(r), lines: r.lines, invoice: r.invoice }
    }

    private normalizeSalesOrder(r: any) {
        return {
            id: r.id,
            orderNumber: r.orderNumber,
            customer: r.customer?.contact?.displayName ?? '',
            customerId: r.customerId,
            orderDate: r.orderDate instanceof Date ? r.orderDate.toISOString().split('T')[0] : r.orderDate,
            shipDate: r.shipmentDate ? (r.shipmentDate instanceof Date ? r.shipmentDate.toISOString().split('T')[0] : r.shipmentDate) : '',
            total: r.totalAmount.toString(),
            status: r.status,
            invoiceId: r.invoiceId ?? null,
        }
    }

    async createSalesOrder(workspaceId: string, companyId: string, data: any) {
        const count = await this.prisma.salesOrder.count({ where: { companyId } })
        const orderNumber = data.orderNumber ?? `SO-${String(count + 1).padStart(6, '0')}`
        const totalAmount = (data.lines ?? []).reduce((s: number, l: any) => s + (Number(l.quantity) * Number(l.unitPrice)), 0)
        const r = await this.prisma.salesOrder.create({
            data: {
                workspaceId,
                companyId,
                customerId: data.customerId,
                orderNumber,
                status: 'DRAFT',
                orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
                shipmentDate: data.shipDate ? new Date(data.shipDate) : null,
                totalAmount,
                lines: {
                    create: (data.lines ?? []).map((l: any) => ({
                        description: l.description,
                        quantity: l.quantity,
                        unitPrice: l.unitPrice,
                        amount: Number(l.quantity) * Number(l.unitPrice),
                        itemId: l.itemId ?? null,
                    })),
                },
            },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
            },
        })
        return this.normalizeSalesOrder(r)
    }

    async updateSalesOrder(id: string, data: any) {
        const updateData: any = {}
        if (data.status !== undefined) updateData.status = data.status
        if (data.shipDate !== undefined) updateData.shipmentDate = data.shipDate ? new Date(data.shipDate) : null
        if (data.orderDate !== undefined) updateData.orderDate = new Date(data.orderDate)
        if (data.customerId !== undefined) updateData.customerId = data.customerId
        const r = await this.prisma.salesOrder.update({
            where: { id },
            data: updateData,
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
            },
        })
        return this.normalizeSalesOrder(r)
    }

    async deleteSalesOrder(id: string) {
        await this.prisma.salesOrderLine.deleteMany({ where: { salesOrderId: id } })
        return this.prisma.salesOrder.delete({ where: { id } })
    }

    async batchDeleteSalesOrders(workspaceId: string, companyId: string, ids: string[]) {
        await this.prisma.salesOrderLine.deleteMany({ where: { salesOrderId: { in: ids } } })
        return this.prisma.salesOrder.deleteMany({ where: { id: { in: ids }, workspaceId, companyId } })
    }

    async convertSalesOrderToInvoice(workspaceId: string, companyId: string, orderId: string) {
        const order = await this.prisma.salesOrder.findFirst({
            where: { id: orderId, workspaceId },
            include: {
                lines: true,
                customer: { include: { contact: { select: { displayName: true } } } },
            },
        })
        if (!order) throw new Error('Sales order not found')
        const invCount = await this.prisma.invoice.count({ where: { companyId } })
        const invoiceNumber = `INV-${String(invCount + 1).padStart(6, '0')}`
        const invoice = await this.prisma.invoice.create({
            data: {
                workspaceId,
                companyId,
                customerId: order.customerId,
                invoiceNumber,
                status: 'DRAFT' as any,
                date: new Date(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                totalAmount: order.totalAmount,
                lines: {
                    create: order.lines.map((l: any) => ({
                        companyId,
                        workspaceId,
                        description: l.description,
                        quantity: l.quantity,
                        unitPrice: l.unitPrice,
                        totalPrice: l.amount,
                        itemId: l.itemId ?? null,
                    })),
                },
            },
        })
        await this.prisma.salesOrder.update({
            where: { id: orderId },
            data: { status: 'FULFILLED', invoiceId: invoice.id },
        })
        return { invoiceId: invoice.id, invoiceNumber }
    }

    // ─── Refunds ──────────────────────────────────────────────────────────────

    async findRefunds(workspaceId: string, companyId: string) {
        const rows = await this.prisma.customerRefund.findMany({
            where: { workspaceId, companyId },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
                paymentReceived: { select: { referenceNumber: true } },
                reason: { select: { name: true } },
            },
            orderBy: { refundDate: 'desc' },
        })
        return rows.map(r => this.normalizeRefund(r))
    }

    async findRefundById(workspaceId: string, id: string) {
        const r = await this.prisma.customerRefund.findFirst({
            where: { id, workspaceId },
            include: {
                customer: { include: { contact: { select: { displayName: true, contactEmails: true } } } },
                paymentReceived: { select: { id: true, referenceNumber: true, amount: true } },
                reason: { select: { id: true, name: true } },
                journalEntry: { select: { id: true, entryNumber: true } },
                approvals: { orderBy: { createdAt: 'desc' } },
            },
        })
        if (!r) return null
        return { ...this.normalizeRefund(r), approvals: (r as any).approvals, journalEntryNumber: (r as any).journalEntry?.entryNumber }
    }

    private normalizeRefund(r: any) {
        return {
            id: r.id,
            refundNumber: `RF-${r.id.slice(0, 8).toUpperCase()}`,
            customer: r.customer?.contact?.displayName ?? '',
            customerId: r.customerId,
            invoiceNumber: r.paymentReceived?.referenceNumber ?? '',
            paymentReceivedId: r.paymentReceivedId ?? null,
            date: r.refundDate instanceof Date ? r.refundDate.toISOString().split('T')[0] : r.refundDate,
            method: r.method,
            amount: Number(r.amount),
            reason: r.reason?.name ?? '',
            reasonId: r.reasonId ?? null,
            status: r.approvalStatus,
            journalEntryId: r.journalEntryId ?? null,
        }
    }

    async createRefund(workspaceId: string, companyId: string, data: any) {
        const r = await this.prisma.customerRefund.create({
            data: {
                workspaceId,
                companyId,
                customerId: data.customerId,
                paymentReceivedId: data.paymentReceivedId ?? null,
                amount: data.amount,
                refundDate: data.refundDate ? new Date(data.refundDate) : new Date(),
                method: data.method ?? 'CASH',
                reasonId: data.reasonId ?? null,
                referenceNumber: data.referenceNumber ?? null,
                approvalStatus: 'PENDING',
                currency: data.currency ?? null,
            },
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
                reason: { select: { name: true } },
            },
        })
        return this.normalizeRefund(r)
    }

    async batchDeleteRefunds(workspaceId: string, companyId: string, ids: string[]) {
        return this.prisma.customerRefund.deleteMany({ where: { id: { in: ids }, workspaceId, companyId } })
    }

    // ─── Credit Notes Batch ──────────────────────────────────────────────────

    async batchDeleteCreditNotes(companyId: string, ids: string[]) {
        return this.prisma.creditNote.deleteMany({ where: { id: { in: ids }, companyId } })
    }

    async exportCreditNotes(companyId: string, opts: { status?: string; search?: string }) {
        const where: any = { companyId }
        if (opts.status) where.status = opts.status
        if (opts.search) where.creditNoteNumber = { contains: opts.search, mode: 'insensitive' }
        const rows = await this.prisma.creditNote.findMany({
            where,
            include: {
                customer: { include: { contact: { select: { displayName: true } } } },
                invoice: { select: { invoiceNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
        const header = 'CreditNoteNumber,Customer,InvoiceNumber,Date,Amount,Status,Memo'
        const lines = rows.map((cn: any) => {
            const customer = cn.customer?.contact?.displayName ?? ''
            const date = cn.issuedAt ? new Date(cn.issuedAt).toISOString().split('T')[0] : ''
            return `${cn.creditNoteNumber ?? ''},${JSON.stringify(customer)},${cn.invoice?.invoiceNumber ?? ''},${date},${Number(cn.totalAmount ?? 0).toFixed(2)},${cn.status ?? ''},${JSON.stringify(cn.reason ?? '')}`
        })
        return [header, ...lines].join('\n')
    }

    // ─── Collections ─────────────────────────────────────────────────────────

    async findCollections(companyId: string, opts: { search?: string; status?: string; priority?: string; limit?: number; offset?: number }) {
        const where: any = { companyId }
        if (opts.status) where.status = opts.status
        if (opts.priority) where.priority = opts.priority
        if (opts.search) where.OR = [
            { caseNumber: { contains: opts.search, mode: 'insensitive' } },
            { subject: { contains: opts.search, mode: 'insensitive' } },
            { assignedTo: { contains: opts.search, mode: 'insensitive' } },
        ]
        return this.prisma.collectionsCase.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findCollectionById(companyId: string, id: string) {
        return this.prisma.collectionsCase.findFirst({ where: { id, companyId } })
    }

    async createCollectionsCase(companyId: string, workspaceId: string, data: any) {
        const count = await this.prisma.collectionsCase.count({ where: { companyId } })
        const caseNumber = `COL-${String(count + 1).padStart(4, '0')}`
        return this.prisma.collectionsCase.create({
            data: {
                companyId,
                workspaceId,
                caseNumber,
                subject: data.subject ?? 'Collection Case',
                status: data.status ?? 'OPEN',
                priority: data.priority ?? 'MEDIUM',
                invoiceId: data.invoiceId ?? null,
                customerId: data.customerId ?? null,
                assignedTo: data.assignedTo ?? null,
                notes: data.notes ?? null,
                promisedAmount: data.promisedAmount ? Number(data.promisedAmount) : null,
                promisedDate: data.promisedDate ? new Date(data.promisedDate) : null,
            },
        })
    }

    async updateCollectionsCase(id: string, data: any) {
        const upd: any = {}
        if (data.subject !== undefined) upd.subject = data.subject
        if (data.status !== undefined) upd.status = data.status
        if (data.priority !== undefined) upd.priority = data.priority
        if (data.assignedTo !== undefined) upd.assignedTo = data.assignedTo
        if (data.notes !== undefined) upd.notes = data.notes
        if (data.promisedAmount !== undefined) upd.promisedAmount = data.promisedAmount ? Number(data.promisedAmount) : null
        if (data.promisedDate !== undefined) upd.promisedDate = data.promisedDate ? new Date(data.promisedDate) : null
        if (data.resolution !== undefined) upd.resolution = data.resolution
        if (data.resolvedAt !== undefined) upd.resolvedAt = data.resolvedAt ? new Date(data.resolvedAt) : null
        return this.prisma.collectionsCase.update({ where: { id }, data: upd })
    }

    async deleteCollectionsCase(id: string) {
        return this.prisma.collectionsCase.delete({ where: { id } })
    }

    async batchDeleteCollections(companyId: string, ids: string[]) {
        return this.prisma.collectionsCase.deleteMany({ where: { id: { in: ids }, companyId } })
    }

    async batchUpdateCollectionStatus(companyId: string, ids: string[], status: string) {
        return this.prisma.collectionsCase.updateMany({ where: { id: { in: ids }, companyId }, data: { status } })
    }

    async exportCollections(companyId: string, opts: { status?: string; priority?: string; search?: string }) {
        const where: any = { companyId }
        if (opts.status) where.status = opts.status
        if (opts.priority) where.priority = opts.priority
        const rows = await this.prisma.collectionsCase.findMany({ where, orderBy: { createdAt: 'desc' } })
        const header = 'CaseNumber,CustomerId,Subject,Status,Priority,AssignedTo,PromisedAmount,PromisedDate,Notes,CreatedAt'
        const lines = rows.map((c: any) => {
            const date = c.promisedDate ? new Date(c.promisedDate).toISOString().split('T')[0] : ''
            const created = c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : ''
            return `${c.caseNumber},${c.customerId ?? ''},${JSON.stringify(c.subject ?? '')},${c.status},${c.priority},${c.assignedTo ?? ''},${c.promisedAmount ?? ''},${date},${JSON.stringify(c.notes ?? '')},${created}`
        })
        return [header, ...lines].join('\n')
    }
}
