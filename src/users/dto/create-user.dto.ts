import { IsEmail, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsInt()
    roleId: number;

    @IsOptional()
    @IsInt()
    locationId?: number;

    @IsOptional()
    @IsInt()
    createdById?: number;
}
