import { Controller, Get, UseGuards, Request, Patch, Body } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UsersService } from './users.service'
import { SetPreferredHubDto } from './dto/set-preferred-hub.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId)
  }

  @Patch('preferred-hub')
  @UseGuards(JwtAuthGuard)
  async setPreferredHub(@Request() req, @Body() body: SetPreferredHubDto) {
    const userId = req.user.userId
    return this.usersService.setPreferredHub(userId, body.preferredHub)
  }

  @Patch('phone')
  @UseGuards(JwtAuthGuard)
  async updatePhone(@Request() req, @Body() body: any) {
    const userId = req.user.userId
    return this.usersService.updatePhone(userId, body.phone)
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() body: UpdateProfileDto) {
    const userId = req.user.userId
    // sanitize input: trim strings and convert empty -> null
    const payload: any = {}
    if (typeof body.companyName === 'string') payload.companyName = String(body.companyName).trim() || null
    if (typeof body.firmName === 'string') payload.firmName = String(body.firmName).trim() || null
    return this.usersService.updateProfile(userId, payload)
  }
}
