import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginSessionDto {
  @IsString()
  @IsNotEmpty()
  phone_number!: string;

  @IsString()
  @MinLength(6)
  password_plaintext!: string;
}
