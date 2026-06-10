import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";



export class UpdateUserDto
{
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    firstName?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    lastName?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    phone?: string;

    @IsOptional()
    @IsBoolean()
    isAdmin?: boolean;

    @IsOptional()
    @IsString()
    @Length(6, 120, { message: "Password has to be at least 6 characters" })
    password_plaintext?: string;
}
