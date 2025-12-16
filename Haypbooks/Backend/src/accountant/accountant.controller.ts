import { Controller, Post, Body, Get, Param, Delete, UseGuards, Req, ForbiddenException, Inject } from '@nestjs/common'
import { AccountantService } from './accountant.service'
import { CreateAccountantClientDto } from './dto/create-accountant-client.dto'
import { CreateProAdvisorPerkDto } from './dto/create-proadvisor-perk.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { USER_REPOSITORY } from '../repositories/prisma/prisma-repositories.module'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'

@Controller('api/accountants')
export class AccountantController {
  constructor(
    private readonly svc: AccountantService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('clients')
  createClient(@Body() dto: CreateAccountantClientDto) {
    return this.svc.createClient(dto.accountantId, dto.tenantId, dto.accessLevel as any)
  }

  // Invite endpoint: logged-in accountant invites or links to a tenant (creates AccountantClient entry)
  @UseGuards(JwtAuthGuard)
  @Post('invite')
  async inviteClient(@Req() req: any, @Body() dto: { tenantId: string; accessLevel?: string }) {
    let accountantId = req.user?.userId
    // If userId missing or doesn't match DB (we've seen token payload `sub` get trimmed in tests), fallback to email lookup
    let user = accountantId ? await this.userRepository.findById(accountantId) : null
    if (!user && req.user?.email) {
      user = await this.userRepository.findByEmail(req.user.email)
      if (user) accountantId = user.id
    }

    if (!user) throw new ForbiddenException('Invalid user')

    // Ensure the caller is an accountant (userType === 'ACCOUNTANT')
    if ((user as any).userType !== 'ACCOUNTANT') {
      throw new ForbiddenException('Only accountants may invite clients')
    }

    return this.svc.createClient(accountantId!, dto.tenantId, dto.accessLevel as any)
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
