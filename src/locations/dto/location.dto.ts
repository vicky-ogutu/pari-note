import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLocationDto {
    @IsString()
    name: string;

    @IsString()
    type: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    parentId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    createdById?: number;
}

export class UpdateLocationDto {
    name?: string;
    type?: string;
    parentId?: number;
}
