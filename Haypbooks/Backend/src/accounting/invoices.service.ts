import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { assertCompanyBelongsToTenant } from '../common/company-utils'

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvoice(companyId: string, payload: any) {
    const tenantId = payload.workspaceId || companyId
    const workspaceId = tenantId
    await assertCompanyBelongsToTenant(this.prisma as any, companyId, tenantId)
    const invoice = await this.prisma.invoice.create({ 
      data: { 
        workspace: { connect: { id: workspaceId } },
        company: { connect: { id: companyId } },
        customer: { connect: { contactId: payload.customerId } },
        invoiceNumber: payload.invoiceNumber, 
        date: new Date(payload.date), 
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null, 
        totalAmount: payload.totalAmount, 
        balance: payload.totalAmount,  // Initialize balance to total amount
        status: payload.status || 'DRAFT'
      } 
    })
    for (const line of payload.lines || []) {
      await this.prisma.invoiceLine.create({
        data: {
          company: { connect: { id: companyId } },
          invoiceId: invoice.id,
          description: line.description,
          quantity: line.quantity || 1,
          unitPrice: line.unitPrice || line.rate || 0,
          totalPrice: line.totalPrice || line.amount || 0,
          // InvoiceLine CreateInput shape can vary across generated clients; cast to any for compatibility
        } as any
      })
    }
    return invoice
  }

  async getInvoice(id: string) {
    return this.prisma.invoice.findUnique({ where: { id }, include: { lines: true } })
  }
}
