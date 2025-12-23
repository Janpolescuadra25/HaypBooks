import { Controller, Get, UseGuards, Request, Patch, Body } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UsersService } from './users.service'
import { SetPreferredHubDto } from './dto/set-preferred-hub.dto'

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
}
