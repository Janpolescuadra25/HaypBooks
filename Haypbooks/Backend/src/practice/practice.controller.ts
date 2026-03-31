import { Controller, Get, Req, UseGuards, Post, Body, BadRequestException } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PracticeService } from './practice.service'

@UseGuards(JwtAuthGuard)
@Controller('api/practices')
export class PracticeController {
  constructor(private readonly service: PracticeService) {}

  @Post()
  async createPractice(@Req() req: any, @Body() body: { name?: string; displayName?: string; servicesOffered?: string }) {
    const userId = req.user?.userId
    console.log('[PracticeController] POST /api/practices called:', {
      userId,
      body,
    })
    if (!userId) {
      throw new BadRequestException('User not authenticated')
    }
    try {
      return await this.service.createPractice(userId, body.name ?? '', body.servicesOffered, body.displayName)
    } catch (error: any) {
      console.error('[PracticeController] createPractice failed', error)
      throw new BadRequestException(error?.message ?? 'Unable to create practice')
    }
  }

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    const userId = req.user?.userId
    return this.service.getDashboardForUser(userId)
  }

  @Get('clients')
  async getClients(@Req() req: any) {
    const userId = req.user?.userId
    return this.service.getClientsForUser(userId)
  }
}
