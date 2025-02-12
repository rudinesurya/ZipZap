import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { CreateJobLocationDto } from './create-job-location.dto';

export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateJobLocationDto)
    location?: CreateJobLocationDto;

    @IsNumber()
    @IsOptional()
    salary?: number;
}
