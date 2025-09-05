import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
export class CreateBabyDto {
  @IsDateString()
  dateOfDeath: string;

  @IsString()
  timeOfDeath: string;

  @IsNumber()
  gestationWeeks: number;

  @IsString()
  outcome: string;

  @IsOptional()
  @IsString()
  apgarScore1min?: string;

  @IsOptional()
  @IsString()
  apgarScore5min?: string;

  @IsOptional()
  @IsString()
  apgarScore10min?: string;

  @IsOptional()
  @IsNumber()
  ageAtDeathDays?: number;

  @IsOptional()
  @IsNumber()
  birthWeight?: number;

  @IsString()
  sex: string;
}
