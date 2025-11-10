import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AtLeastOneField } from './validators/at-least-one-field.validator';

export class UpdatePersonDto {
  @AtLeastOneField(['name', 'salary', 'comment'])
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.name !== undefined)
  name?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @ValidateIf((o) => o.salary !== undefined)
  @Type(() => Number)
  salary?: number;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.comment !== undefined)
  comment?: string;
}
