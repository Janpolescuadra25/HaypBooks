import { Controller, Post, Get, Body, UseGuards, Request, Res, HttpCode, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { OnboardingService } from './onboarding.service'
import { SaveStepDto, CompleteDto } from './dto/onboarding.dto'

@Controller('api/onboarding')
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name)
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('save')
  @UseGuards(JwtAuthGuard)
  async saveStep(@Request() req, @Body() saveStepDto: SaveStepDto) {
    const userId = req.user.userId
    this.logger.log(`[save] step=${saveStepDto.step} userId=${userId}`)
    const result = await this.onboardingService.saveStep(userId, saveStepDto.step, saveStepDto.data)
    return result
  }

  @Get('save')
  @UseGuards(JwtAuthGuard)
  async loadProgress(@Request() req) {
    const userId = req.user.userId
    const steps = await this.onboardingService.loadProgress(userId)
    return { steps }
  }

  @Post('complete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async complete(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
    @Body() body: CompleteDto & { hub?: 'OWNER' | 'ACCOUNTANT'; mode?: 'append' | 'replace'; practiceName?: string; companyName?: string }
  ) {
    try {
      const userId = req.user.userId
      const type = body?.type || 'full'
      const hub = body?.hub || 'OWNER'
      const mode = body?.mode || 'replace'
      const practiceName = String(body?.practiceName || '').trim() || undefined
      const companyName = String(body?.companyName || '').trim() || undefined
      this.logger.log(`[complete] userId=${userId} type=${type} hub=${hub} mode=${mode} practiceName=${practiceName || '<none>'} companyName=${companyName || '<none>'}`)
      // Return the result from the service so callers can access the created company (if any)
      const result = await this.onboardingService.complete(userId, type, hub, mode, practiceName, companyName)

      // Set per-hub cookie
      if (hub === 'ACCOUNTANT') {
        res.cookie('onboardingAccountantComplete', 'true', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
      } else {
        res.cookie('onboardingOwnerComplete', 'true', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
      }

      // For backwards compatibility, also set the global cookie and mode
      res.cookie('onboardingComplete', 'true', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
      res.cookie('onboardingMode', type, { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })

      return { success: true, company: result?.company || null }
    } catch (err) {
      console.error('[ONBOARDING COMPLETE UNCAUGHT]', err)
      throw err
    }
  }
}
