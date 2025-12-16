import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common'
import { AccountantService } from './accountant.service'
import { CreateAccountantClientDto } from './dto/create-accountant-client.dto'
import { CreateProAdvisorPerkDto } from './dto/create-proadvisor-perk.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('api/accountants')
export class AccountantController {
  constructor(private readonly svc: AccountantService) {}

  @UseGuards(JwtAuthGuard)
  @Post('clients')
  createClient(@Body() dto: CreateAccountantClientDto) {
    return this.svc.createClient(dto.accountantId, dto.tenantId, dto.accessLevel as any)
  }

  @UseGuards(JwtAuthGuard)
  @Get('clients/:accountantId')
  listClients(@Param('accountantId') accountantId: string) {
    return this.svc.listClientsForAccountant(accountantId)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clients/:id')
  removeClient(@Param('id') id: string) {
    return this.svc.removeClient(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/perks')
  createPerk(@Param('userId') userId: string, @Body() dto: CreateProAdvisorPerkDto) {
    return this.svc.createPerk({ userId, type: dto.type as any, name: dto.name, issuer: dto.issuer })
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/perks')
  listPerks(@Param('userId') userId: string) {
    return this.svc.listPerks(userId)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('perks/:id')
  removePerk(@Param('id') id: string) {
    return this.svc.removePerk(id)
  }
}
