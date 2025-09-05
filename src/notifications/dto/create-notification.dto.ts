import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { CreateBabyDto } from '../../babies/dto/create-baby.dto';
import { CreateMotherDto } from '../../mothers/dto/create-mother.dto';

export class CreateNotificationDto {
  @IsString()
  facilityName: string;

  @IsString()
  mflCode: string;

  @IsString()
  dateOfNotification: string;

  @IsString()
  locality: string;

  @IsString()
  county: string;

  @IsString()
  subCounty: string;

  @IsString()
  levelOfCare: string;

  @IsString()
  managingAuthority: string;

   @ValidateNested()
  @Type(() => CreateMotherDto)
  mother: CreateMotherDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBabyDto)
  babies: CreateBabyDto[];
}
