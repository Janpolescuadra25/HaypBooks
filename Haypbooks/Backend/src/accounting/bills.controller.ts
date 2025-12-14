import { Controller, Post, Body, Param, Get, UseGuards, Request, Query } from '@nestjs/common'
import { BillsService } from './bills.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('api/bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() payload: any) {
    // The payload must include tenantId or companyId
    const tenantId = payload.tenantId || req.user?.tenantId
    return this.billsService.createBill(tenantId, payload)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(@Param('id') id: string) {
    return this.billsService.getBill(id)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Request() req, @Query() query: any) {
    const tenantId = query.tenantId || req.user?.tenantId
    const filter = query.status ? { status: query.status } : {}
    return this.billsService.listBills(tenantId, filter)
  }

  @Post(':id/payments')
  @UseGuards(JwtAuthGuard)
  async applyPayment(@Request() req, @Param('id') billId: string, @Body() payload: any) {
    const tenantId = payload.tenantId || req.user?.tenantId
    return this.billsService.applyPayment(tenantId, billId, payload.amount, payload)
  }
}
