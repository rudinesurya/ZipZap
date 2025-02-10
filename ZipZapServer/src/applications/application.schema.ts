import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
    @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
    job: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    applicant: Types.ObjectId;

    @Prop()
    coverLetter?: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
