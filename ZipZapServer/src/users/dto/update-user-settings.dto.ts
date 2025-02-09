import { IsOptional, IsString } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  name?: string;

  // Add other settings properties as needed
  @IsOptional()
  @IsString()
  theme?: string;
}
