import {
  IsString,
  IsDateString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePersonDto {
  @IsString()
  name: string;

  @IsDateString()
  dateOfBirth: string;

  @IsInt()
  @Type(() => Number)
  score: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  salary: number;

  @IsBoolean()
  @IsOptional()
  @ValidateIf((o) => o.active !== undefined)
  active?: boolean;

  @IsString()
  @IsOptional()
  comment?: string;
}
