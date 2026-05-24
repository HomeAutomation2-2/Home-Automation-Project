import { IsBoolean, IsNotEmpty, IsString, Length } from "class-validator";



export class CreateUserDto 
{
    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @Length(13, 13, { message: "CNP has to be 13 character long" })
    cnp!: string;

    @IsString()
    @IsNotEmpty()
    phone!: string;

    @IsString()
    @Length(6, 120, { message: "Password has to be at least 6 characters"})
    password_plaintext!: string;

    @IsBoolean()
    isAdmin: boolean = false
}