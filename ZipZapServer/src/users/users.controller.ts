import { Controller, Get, Put, Body, Param, UseGuards, Post, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  // Get authenticated user's profile
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  // Update user settings (profile)
  @UseGuards(JwtAuthGuard)
  @Put('settings')
  async updateSettings(@Request() req, @Body() updateUserSettingsDto: UpdateUserSettingsDto) {
    return this.usersService.updateSettings(req.user.userId, updateUserSettingsDto);
  }
}
