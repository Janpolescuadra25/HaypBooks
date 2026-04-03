import { Controller, Get, Post, Put, Delete, Param, Query, Body, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { ContactsService } from './contacts.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'

@Controller('api/companies/:companyId/contacts')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class ContactsController {
  constructor(private readonly svc: ContactsService) {}

  @Get('customers')
  async findCustomers(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findCustomers(req.user.userId, companyId, {
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
  }

  @Post('customers')
  async createCustomer(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.svc.createCustomer(req.user.userId, companyId, dto)
  }

  @Get('customers/:id')
  async getCustomer(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.svc.findCustomerById(req.user.userId, companyId, id)
  }

  @Put('customers/:id')
  async updateCustomer(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.svc.updateCustomer(req.user.userId, companyId, id, dto)
  }

  @Delete('customers/:id')
  async deleteCustomer(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.svc.softDeleteCustomer(req.user.userId, companyId, id)
  }

  @Get('vendors')
  async findVendors(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findVendors(req.user.userId, companyId, {
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
  }

  @Post('vendors')
  async createVendor(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Body() body: any,
  ) {
    return this.svc.createVendor(req.user.userId, companyId, body)
  }

  @Get('vendors/:id')
  async getVendor(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.svc.findVendorById(req.user.userId, companyId, id)
  }

  @Put('vendors/:id')
  async updateVendor(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.svc.updateVendor(req.user.userId, companyId, id, body)
  }

  @Delete('vendors/:id')
  async deleteVendor(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.svc.softDeleteVendor(req.user.userId, companyId, id)
  }
}
