import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RatingDocument = Rating & Document;

@Schema({ timestamps: true })
export class Rating {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    ratedUser: Types.ObjectId; // The user being rated

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    rater: Types.ObjectId; // The user who provided the rating

    @Prop({ required: true, min: 1, max: 5 })
    rating: number;

    @Prop()
    comment?: string;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
