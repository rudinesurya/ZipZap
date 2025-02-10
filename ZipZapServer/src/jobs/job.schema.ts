import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop()
    location?: string;

    @Prop()
    salary?: number;

    // Reference to the User who posted the job.
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    postedBy: Types.ObjectId;
}

export const JobSchema = SchemaFactory.createForClass(Job);
