import { IsString, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateMotherDto {
  @IsNumber()
  age: number;

  @IsBoolean()
  married: boolean;

  @IsString()
  parity: string;

  @IsString()
  outcome: string;

  @IsString()
  typeOfPregnancy: string;

  @IsString()
  attendedAntenatal: string;

  @IsString()
  placeOfDelivery: string;

  @IsOptional()
  facilityLevelOfCare?: string;

  @IsString()
  typeOfDelivery: string;

  @IsString()
  periodOfDeath: string;

  @IsString()
  perinatalCause: string;

  @IsString()
  maternalCondition: string;

  @IsArray()
  @IsOptional()
  conditions?: string[];
}
