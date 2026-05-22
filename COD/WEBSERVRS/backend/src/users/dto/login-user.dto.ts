import { IsNotEmpty, IsString, Length } from "class-validator";



export class LoginUserDto 
{
    @IsString()
    @IsNotEmpty()
    phone!: string;

    @IsString()
    @Length(6, 120, { message: "Password has to be at least 6 characters"})
    password_plaintext!: string;
}