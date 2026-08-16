import { Controller, Post, Body, Param, Req, UseGuards, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'
import { ZypraService } from './zypra.service'
import { ZypraChatRequestDto } from './zypra.dto'

@Controller('api/companies/:companyId/zypra')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ZypraController {
  constructor(private readonly zypraService: ZypraService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Body() body: ZypraChatRequestDto,
  ) {
    const message = body?.message?.trim()
    if (!message) {
      throw new BadRequestException('message is required')
    }

    const userId = req.user?.userId || req.user?.id
    return this.zypraService.chat(companyId, userId, message, body.context)
  }
}
