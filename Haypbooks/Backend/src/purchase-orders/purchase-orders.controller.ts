import { Controller, Post, Body, UseGuards, Request, Param, Get } from '@nestjs/common'
import { PurchaseOrdersService } from './purchase-orders.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('api/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly svc: PurchaseOrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() payload: any) {
    const tenantId = payload.tenantId || req.user?.tenantId
    return this.svc.createPurchaseOrder(tenantId, payload)
  }

  @Post(':id/receive')
  @UseGuards(JwtAuthGuard)
  async receive(@Request() req, @Param('id') id: string, @Body() payload: any) {
    const tenantId = payload.tenantId || req.user?.tenantId
    return this.svc.receivePurchaseOrder(tenantId, id, payload)
  }
}
