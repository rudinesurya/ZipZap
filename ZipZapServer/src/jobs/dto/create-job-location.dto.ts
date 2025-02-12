import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateJobLocationDto {
    @IsString()
    @IsNotEmpty()
    formattedAddress: string;

    @IsString()
    @IsNotEmpty()
    placeId: string;

    @IsNumber()
    lat: number;

    @IsNumber()
    lng: number;
}