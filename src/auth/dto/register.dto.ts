import { IsEmail, IsString } from 'class-validator';
import { SignInDto } from './sign-in.dto';

export class RegisterDto extends SignInDto {
  @IsString()
  @IsEmail()
  email: string;
}
