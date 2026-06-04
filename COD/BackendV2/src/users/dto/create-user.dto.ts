import { IsBoolean, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsString()
  @Length(13, 13)
  cnp!: string;

  @IsString()
  @MinLength(10)
  phone!: string;

  @IsString()
  @MinLength(6)
  password_plaintext!: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
