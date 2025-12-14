import { Controller, Post, Body, Get, Param, Request, UseGuards, Query } from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Post('items')
  @UseGuards(JwtAuthGuard)
  async createItem(@Request() req, @Body() payload: any) {
    const tenantId = payload.tenantId || req.user?.tenantId
    return this.service.createItem(tenantId, payload)
  }

  @Get('items/:id')
  @UseGuards(JwtAuthGuard)
  async getItem(@Param('id') id: string) {
    return this.service.getItem(id)
  }

  @Get('items')
  @UseGuards(JwtAuthGuard)
  async listItems(@Request() req, @Query() query: any) {
    const tenantId = query.tenantId || req.user?.tenantId
    return this.service.listItems(tenantId, query)
  }

  @Post('locations')
  @UseGuards(JwtAuthGuard)
  async createLocation(@Request() req, @Body() payload: any) {
    const tenantId = payload.tenantId || req.user?.tenantId
    return this.service.createStockLocation(tenantId, payload)
  }

  @Post('receive')
  @UseGuards(JwtAuthGuard)
  async receive(@Request() req, @Body() payload: any) {
    const tenantId = payload.tenantId || req.user?.tenantId
    return this.service.receiveStock(tenantId, payload)
  }

  @Post('ship')
  @UseGuards(JwtAuthGuard)
  async ship(@Request() req, @Body() payload: any) {
    const tenantId = payload.tenantId || req.user?.tenantId
    return this.service.shipStock(tenantId, payload)
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  async transfer(@Request() req, @Body() payload: any) {
    const tenantId = payload.tenantId || req.user?.tenantId
    return this.service.transferStock(tenantId, payload)
  }

  @Post('adjust')
  @UseGuards(JwtAuthGuard)
  async adjust(@Request() req, @Body() payload: any) {
    const tenantId = payload.tenantId || req.user?.tenantId
    return this.service.adjustStock(tenantId, payload)
  }
}
