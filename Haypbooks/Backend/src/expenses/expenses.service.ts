import { Injectable } from '@nestjs/common'
import { ApService } from '../ap/ap.service'

@Injectable()
export class ExpensesService {
  constructor(private readonly apService: ApService) {}

  async listVendors(userId: string, companyId: string, query: any) {
    return this.apService.listVendors(userId, companyId, query)
  }

  async createVendor(userId: string, companyId: string, data: any) {
    return this.apService.createVendor(userId, companyId, data)
  }

  async listBills(userId: string, companyId: string, query: any) {
    return this.apService.listBills(userId, companyId, query)
  }

  async createBill(userId: string, companyId: string, data: any) {
    return this.apService.createBill(userId, companyId, data)
  }

  async listBillPayments(userId: string, companyId: string, query: any) {
    return this.apService.listBillPayments(userId, companyId, query)
  }

  async recordBillPayment(userId: string, companyId: string, data: any) {
    return this.apService.recordBillPayment(userId, companyId, data)
  }
}
