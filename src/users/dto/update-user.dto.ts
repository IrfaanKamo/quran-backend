import { IsEmail, IsString, MinLength, IsOptional, ValidateIf } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string | null;

  @IsString()
  @MinLength(8)
  @IsOptional()
  newPassword?: string;

  @IsString()
  @ValidateIf((o) => o.password !== undefined)
  currentPassword?: string;
}
