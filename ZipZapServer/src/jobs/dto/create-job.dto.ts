import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsNumber()
    @IsOptional()
    salary?: number;
}
