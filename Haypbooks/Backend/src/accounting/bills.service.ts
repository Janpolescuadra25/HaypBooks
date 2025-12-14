import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { assertCompanyBelongsToTenant } from '../common/company-utils'

@Injectable()
export class BillsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBill(tenantId: string, payload: any) {
    await assertCompanyBelongsToTenant(this.prisma as any, payload.companyId, tenantId)
    if (!payload.vendorId) {
      throw new BadRequestException('vendorId is required')
    }
    
    // Create bill header with lines in transaction
    const bill = await this.prisma.$transaction(async (tx) => {
      const newBill = await tx.bill.create({ 
        data: { 
          tenantId, 
          companyId: payload.companyId, 
          vendorId: payload.vendorId, 
          billNumber: payload.billNumber, 
          status: payload.status || 'DRAFT', 
          total: payload.totalAmount || 0, 
          balance: payload.totalAmount || 0, 
          issuedAt: payload.date ? new Date(payload.date) : new Date(), 
          dueAt: payload.dueDate ? new Date(payload.dueDate) : null, 
          description: payload.description || null 
        } 
      })
      
      for (const line of payload.lines || []) {
        await tx.billLine.create({
          data: {
            companyId: payload.companyId,
            bill: { connect: { id: newBill.id } },
            accountId: line.accountId,
            itemId: line.itemId,
            description: line.description,
            quantity: line.quantity || 1,
            rate: line.unitPrice || line.rate || 0,
            amount: line.totalPrice || line.amount || 0,
            taxCodeId: line.taxCodeId || null,
            tenant: { connect: { id: tenantId } }
          }
        })
      }
      
      return newBill
    })
    
    return bill
  }

  async getBill(id: string) {
    const bill = await this.prisma.bill.findUnique({ 
      where: { id }, 
      include: { lines: true, payments: true } 
    })
    
    if (!bill) {
      throw new NotFoundException(`Bill with id ${id} not found`)
    }
    
    return bill
  }

  async listBills(tenantId: string, filter?: any) {
    return this.prisma.bill.findMany({ 
      where: { tenantId, ...filter }, 
      include: { lines: true, payments: true },
      orderBy: { issuedAt: 'desc' }
    })
  }

  async applyPayment(tenantId: string, billId: string, amount: number, payload: any) {
    await assertCompanyBelongsToTenant(this.prisma as any, payload.companyId, tenantId)
    // Validate bill exists and has sufficient balance
    const bill = await this.prisma.bill.findUnique({ where: { id: billId } })
    
    if (!bill) {
      throw new NotFoundException(`Bill with id ${billId} not found`)
    }
    
    if (bill.balance.toNumber() < amount) {
      throw new BadRequestException(`Payment amount ${amount} exceeds bill balance ${bill.balance}`)
    }
    
    // Create payment and update bill in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.billPayment.create({ 
        data: { 
          tenantId, 
          billId, 
          companyId: payload.companyId, 
          amount, 
          paymentDate: payload.paymentDate ? new Date(payload.paymentDate) : new Date(), 
          method: payload.paymentMethod || 'CHECK', 
          referenceNumber: payload.referenceNumber || null,
          bankAccountId: payload.bankAccountId || null, 
          vendorPaymentMethodId: payload.vendorPaymentMethodId || null 
        } 
      })
      
      const newBalance = bill.balance.toNumber() - amount
      const newStatus = newBalance === 0 ? 'PAID' : bill.status
      
      await tx.bill.update({ 
        where: { id: billId }, 
        data: { 
          balance: newBalance,
          status: newStatus
        } 
      })
      
      return payment
    })
    
    return result
  }
}

