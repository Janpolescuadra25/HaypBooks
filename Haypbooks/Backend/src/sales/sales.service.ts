import { Injectable } from '@nestjs/common'
import { ArService } from '../ar/ar.service'

@Injectable()
export class SalesService {
  constructor(private readonly arService: ArService) {}

  async listCustomers(userId: string, companyId: string, query: any) {
    return this.arService.listCustomers(userId, companyId, query)
  }

  async createCustomer(userId: string, companyId: string, data: any) {
    return this.arService.createCustomer(userId, companyId, data)
  }

  async listInvoices(userId: string, companyId: string, query: any) {
    return this.arService.listInvoices(userId, companyId, query)
  }

  async createInvoice(userId: string, companyId: string, data: any) {
    return this.arService.createInvoice(userId, companyId, data)
  }

  async listPayments(userId: string, companyId: string, query: any) {
    return this.arService.listPayments(userId, companyId, query)
  }

  async recordPayment(userId: string, companyId: string, data: any) {
    return this.arService.recordPayment(userId, companyId, data)
  }

  async voidPayment(userId: string, companyId: string, paymentId: string) {
    return this.arService.voidPayment(userId, companyId, paymentId)
  }

  async getCustomer(userId: string, companyId: string, contactId: string) {
    return this.arService.getCustomer(userId, companyId, contactId)
  }

  async updateCustomer(userId: string, companyId: string, contactId: string, data: any) {
    return this.arService.updateCustomer(userId, companyId, contactId, data)
  }

  async deleteCustomer(userId: string, companyId: string, contactId: string) {
    return this.arService.deleteCustomer(userId, companyId, contactId)
  }

  async getInvoice(userId: string, companyId: string, invoiceId: string) {
    return this.arService.getInvoice(userId, companyId, invoiceId)
  }

  async updateInvoice(userId: string, companyId: string, invoiceId: string, data: any) {
    return this.arService.updateInvoice(userId, companyId, invoiceId, data)
  }

  async getPayment(userId: string, companyId: string, paymentId: string) {
    return this.arService.getPayment(userId, companyId, paymentId)
  }
}
