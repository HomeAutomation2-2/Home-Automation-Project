import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

/** PATCH /users/me — câmpuri editabile de utilizatorul autentificat */
export class UpdateProfileDto {
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
    @IsString()
    @Length(6, 120, { message: "Password has to be at least 6 characters" })
    password_plaintext?: string;
}
