import { Type } from 'class-transformer';
import { IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { CreateBabyDto } from '../../babies/dto/create-baby.dto';
import { CreateMotherDto } from '../../mothers/dto/create-mother.dto';

export class CreateNotificationDto {

  @IsString()
  dateOfNotification: string;

  @IsInt()
  locationId: number;

   @ValidateNested()
  @Type(() => CreateMotherDto)
  mother: CreateMotherDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBabyDto)
  babies: CreateBabyDto[];
}
