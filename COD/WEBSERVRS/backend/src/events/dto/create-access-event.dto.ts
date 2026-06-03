import { IsNotEmpty, IsString } from "class-validator"



export class CreateAccessEventDto 
{
    @IsNotEmpty()
    @IsString()
    direction!: 'in' | 'out'

    @IsNotEmpty()
    @IsString()
    occurred_at!: string
}