import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateRatingDto {
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    comment?: string;
}
