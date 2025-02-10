import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(user: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(userId: string): Promise<UserDocument | undefined> {
    return this.userModel.findById(userId).exec();
  }

  async findByHandle(handle: string): Promise<User> {
    const user = await this.userModel.findOne({ handle });
    if (!user) {
      throw new NotFoundException(`User with handle ${handle} not found`);
    }
    return user;
  }

  async updateUser(userId: string, userProperties: any): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(userId, userProperties, { new: true }).exec();
  }
}
