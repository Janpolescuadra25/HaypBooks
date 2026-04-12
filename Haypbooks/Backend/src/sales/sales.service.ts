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

  async listPaymentTerms(userId: string, companyId: string) {
    return this.arService.listPaymentTerms(userId, companyId)
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

  async sendInvoice(userId: string, companyId: string, invoiceId: string, opts?: { subject?: string; body?: string }) {
    return this.arService.sendInvoice(userId, companyId, invoiceId, opts)
  }

  async voidInvoice(userId: string, companyId: string, invoiceId: string) {
    return this.arService.voidInvoice(userId, companyId, invoiceId)
  }

  async listSubscriptions(userId: string, companyId: string, query: any) {
    return []
  }

  async listRevenueRecognition(userId: string, companyId: string, query: any = {}) {
    return this.arService.listRevenueRecognition(userId, companyId, query)
  }

  async createRevenueRecognition(userId: string, companyId: string, data: any) {
    return this.arService.createRevenueRecognition(userId, companyId, data)
  }

  async recognizeRevenue(userId: string, companyId: string, id: string, data: any) {
    return this.arService.recognizeRevenue(userId, companyId, id, data)
  }

  async listDeferredRevenue(userId: string, companyId: string, query: any = {}) {
    return this.arService.listDeferredRevenue(userId, companyId, query)
  }

  async createDeferredRevenue(userId: string, companyId: string, data: any) {
    return this.arService.createDeferredRevenue(userId, companyId, data)
  }

  async recognizeDeferredRevenue(userId: string, companyId: string, id: string, data: any) {
    return this.arService.recognizeDeferredRevenue(userId, companyId, id, data)
  }

  async listPaymentLinks(userId: string, companyId: string, query: any = {}) {
    return this.arService.listPaymentLinks(userId, companyId, query)
  }

  async createPaymentLink(userId: string, companyId: string, data: any) {
    return this.arService.createPaymentLink(userId, companyId, data)
  }

  // ─── Quotes (facade to AR service) ───────────────────────────────────────

  async listQuotes(userId: string, companyId: string, query: any) {
    return this.arService.listQuotes(userId, companyId, query)
  }

  async createQuote(userId: string, companyId: string, data: any) {
    return this.arService.createQuote(userId, companyId, data)
  }

  async getQuote(userId: string, companyId: string, quoteId: string) {
    return this.arService.getQuote(userId, companyId, quoteId)
  }

  async convertQuoteToInvoice(userId: string, companyId: string, quoteId: string) {
    return this.arService.convertToInvoice(userId, companyId, quoteId)
  }
}
