import { IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileDto {
  // Add other profile properties as needed
  @IsOptional()
  @IsString()
  name?: string;
}
