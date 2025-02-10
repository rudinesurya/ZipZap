import { IsOptional, IsString } from 'class-validator';

export class UpdateUserSettingsDto {
  // Add other settings properties as needed
  @IsOptional()
  @IsString()
  theme?: string;
}
