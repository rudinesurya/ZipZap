import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Location, LocationSchema } from './location.schema';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: LocationSchema, required: false })
    location?: Location;

    @Prop()
    salary?: number;

    // Reference to the User who posted the job.
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    postedBy: Types.ObjectId;
}

export const JobSchema = SchemaFactory.createForClass(Job);