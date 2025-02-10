import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
    constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) { }

    /**
     * Sends a new message from the authenticated user (sender) to the recipient.
     */
    async sendMessage(createMessageDto: CreateMessageDto, senderId: string): Promise<Message> {
        const message = new this.messageModel({
            sender: new Types.ObjectId(senderId),
            recipient: new Types.ObjectId(createMessageDto.recipientId),
            content: createMessageDto.content,
        });
        return message.save();
    }

    /**
     * Retrieves the conversation between the authenticated user and the specified other user.
     * The conversation includes all messages where the authenticated user is either sender or recipient.
     */
    async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
        return this.messageModel
            .find({
                $or: [
                    { sender: new Types.ObjectId(userId), recipient: new Types.ObjectId(otherUserId) },
                    { sender: new Types.ObjectId(otherUserId), recipient: new Types.ObjectId(userId) },
                ],
            })
            .sort({ createdAt: 1 })
            .populate('sender', 'name email')
            .populate('recipient', 'name email')
            .exec();
    }
}
