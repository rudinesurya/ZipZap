import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateApplicationDto {
    @IsNotEmpty()
    @IsString()
    jobId: string;

    @IsOptional()
    @IsString()
    coverLetter?: string;
}
