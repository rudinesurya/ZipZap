import { Controller, Get, Put, Body, Param, UseGuards, Post, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  // Get authenticated user's profile
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  // Retrieve a user profile by handle.
  @Get('handle/:handle')
  async getProfileByHandle(@Param('handle') handle: string) {
    return this.usersService.findByHandle(handle);
  }

  // Get authenticated user's settings
  @UseGuards(JwtAuthGuard)
  @Get('settings')
  async getSettings(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  // Update user profile
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserProfileDto: UpdateUserProfileDto) {
    return this.usersService.updateUser(req.user.userId, updateUserProfileDto);
  }

  // Update user settings
  @UseGuards(JwtAuthGuard)
  @Put('settings')
  async updateSettings(
    @Request() req,
    @Body() updateUserSettingsDto: UpdateUserSettingsDto,
  ) {
    return this.usersService.updateUser(req.user.userId, updateUserSettingsDto);
  }
}
