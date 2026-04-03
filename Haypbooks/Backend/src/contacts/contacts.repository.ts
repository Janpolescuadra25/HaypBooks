import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class ContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCustomers(workspaceId: string, opts: { search?: string; page?: number; limit?: number }) {
    const page = opts.page && opts.page > 0 ? opts.page : 1
    const limit = opts.limit && opts.limit > 0 ? Math.min(opts.limit, 200) : 50
    const where: any = { workspaceId, deletedAt: null }

    if (opts.search) {
      where.OR = [
        { displayName: { contains: opts.search, mode: 'insensitive' } },
        { email: { contains: opts.search, mode: 'insensitive' } },
        { phone: { contains: opts.search, mode: 'insensitive' } },
        { companyName: { contains: opts.search, mode: 'insensitive' } },
        { contact: { displayName: { contains: opts.search, mode: 'insensitive' } } },
        { contact: { contactEmails: { some: { email: { contains: opts.search, mode: 'insensitive' } } } } },
        { contact: { contactPhones: { some: { phone: { contains: opts.search, mode: 'insensitive' } } } } },
      ]
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        include: { contact: { include: { contactEmails: true, contactPhones: true } } },
        orderBy: { contactId: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ])

    const mappedItems = items.map((c) => ({
      ...c,
      status: c.deletedAt ? 'Inactive' : 'Active',
    }))

    return {
      items: mappedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findCustomerById(workspaceId: string, id: string) {
    return this.prisma.customer.findFirst({
      where: { contactId: id, workspaceId, deletedAt: null },
      include: { contact: true },
    })
  }

  async createCustomer(workspaceId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const contact = await tx.contact.create({
        data: {
          workspaceId,
          type: 'CUSTOMER',
          displayName: data.displayName,
        },
      })

      return tx.customer.create({
        data: {
          workspaceId,
          contactId: contact.id,
          paymentTermId: data.paymentTermId ?? null,
          priceListId: data.priceListId ?? null,
          creditLimit: data.creditLimit ?? null,
          groupId: data.groupId ?? null,
        },
        include: { contact: true },
      })
    })
  }

  async updateCustomer(workspaceId: string, id: string, data: any) {
    const customer = await this.prisma.customer.findFirst({ where: { contactId: id, workspaceId, deletedAt: null } })
    if (!customer) return null

    return this.prisma.$transaction(async (tx) => {
      if (data.displayName) {
        await tx.contact.update({ where: { id }, data: { displayName: data.displayName } })
      }

      return tx.customer.update({
        where: { contactId: id },
        data: {
          paymentTermId: data.paymentTermId ?? undefined,
          priceListId: data.priceListId ?? undefined,
          creditLimit: data.creditLimit ?? undefined,
          groupId: data.groupId ?? undefined,
        },
        include: { contact: true },
      })
    })
  }

  async softDeleteCustomer(workspaceId: string, id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { contactId: id },
        data: { deletedAt: new Date() },
      })
      return tx.contact.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: userId } })
    })
  }

  async findVendors(workspaceId: string, opts: { search?: string; page?: number; limit?: number }) {
    const page = opts.page && opts.page > 0 ? opts.page : 1
    const limit = opts.limit && opts.limit > 0 ? Math.min(opts.limit, 200) : 50
    const where: any = { workspaceId, deletedAt: null }

    if (opts.search) {
      where.displayName = { contains: opts.search, mode: 'insensitive' }
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.vendor.findMany({
        where,
        include: { contact: true },
        orderBy: { contactId: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vendor.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findVendorById(workspaceId: string, id: string) {
    return this.prisma.vendor.findFirst({
      where: { contactId: id, workspaceId, deletedAt: null },
      include: { contact: true },
    })
  }

  async createVendor(workspaceId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const contact = await tx.contact.create({
        data: {
          workspaceId,
          type: 'VENDOR',
          displayName: data.displayName,
        },
      })

      return tx.vendor.create({
        data: {
          workspaceId,
          contactId: contact.id,
          paymentTermId: data.paymentTermId ?? null,
          isNonResident: data.isNonResident ?? false,
          defaultWithholding: data.defaultWithholding ?? null,
        },
        include: { contact: true },
      })
    })
  }

  async updateVendor(workspaceId: string, id: string, data: any) {
    const vendor = await this.prisma.vendor.findFirst({ where: { contactId: id, workspaceId, deletedAt: null } })
    if (!vendor) return null

    return this.prisma.$transaction(async (tx) => {
      if (data.displayName) {
        await tx.contact.update({ where: { id }, data: { displayName: data.displayName } })
      }

      return tx.vendor.update({
        where: { contactId: id },
        data: {
          paymentTermId: data.paymentTermId ?? undefined,
          isNonResident: data.isNonResident ?? undefined,
          defaultWithholding: data.defaultWithholding ?? undefined,
        },
        include: { contact: true },
      })
    })
  }

  async softDeleteVendor(workspaceId: string, id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.vendor.update({
        where: { contactId: id },
        data: { deletedAt: new Date() },
      })
      return tx.contact.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: userId } })
    })
  }
}
