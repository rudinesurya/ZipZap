import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    // Add other profile properties as needed
    @Prop({ required: true })
    name: string;

    // Add other settings properties as needed
    @Prop()
    theme: string;
}

export const UserSchema = SchemaFactory.createForClass(User);