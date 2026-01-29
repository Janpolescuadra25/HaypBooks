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
    const tenantId = payload.workspaceId || req.user?.workspaceId
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
    const tenantId = query.workspaceId || req.user?.workspaceId
    const filter = query.status ? { status: query.status } : {}
    return this.billsService.listBills(tenantId, filter)
  }

  @Post(':id/payments')
  @UseGuards(JwtAuthGuard)
  async applyPayment(@Request() req, @Param('id') billId: string, @Body() payload: any) {
    const tenantId = payload.workspaceId || req.user?.workspaceId
    return this.billsService.applyPayment(tenantId, billId, payload.amount, payload)
  }
}
