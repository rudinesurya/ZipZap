import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Location {
    // A human-readable address (as returned by Google Maps)
    @Prop({ required: true })
    formattedAddress: string;

    // The Google Maps Place ID for the location
    @Prop({ required: true })
    placeId: string;

    // Latitude of the location
    @Prop({ required: true })
    lat: number;

    // Longitude of the location
    @Prop({ required: true })
    lng: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);