import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('messages')
export class MessagesController {
    constructor(private messagesService: MessagesService) { }

    // Send a new message from the authenticated user.
    @UseGuards(JwtAuthGuard)
    @Post()
    async sendMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
        const senderId = req.user.userId;
        return this.messagesService.sendMessage(createMessageDto, senderId);
    }

    // Retrieve the conversation between the authenticated user and the specified user.
    @UseGuards(JwtAuthGuard)
    @Get('conversation/:userId')
    async getConversation(@Request() req, @Param('userId') otherUserId: string) {
        const userId = req.user.userId;
        return this.messagesService.getConversation(userId, otherUserId);
    }
}
