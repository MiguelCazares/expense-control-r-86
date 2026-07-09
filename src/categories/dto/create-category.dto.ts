import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CategoryColor } from '../enums/category-color.enum';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Peaje', maxLength: 60 })
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  @MaxLength(60, { message: 'name too long' })
  name: string;

  @ApiPropertyOptional({ enum: CategoryColor, default: CategoryColor.DEFAULT })
  @IsOptional()
  @IsEnum(CategoryColor, {
    message: 'color must be: default, success, warning, danger, info or purple',
  })
  color?: CategoryColor;
}
