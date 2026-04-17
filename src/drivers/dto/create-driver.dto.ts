import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({ example: 'Carlos', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  @MaxLength(100, { message: 'name too long' })
  name: string;

  @ApiProperty({ example: 'Ramírez', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'lastName is required' })
  @MaxLength(100, { message: 'lastName too long' })
  lastName: string;

  @ApiProperty({ example: 'LIC-123456', maxLength: 50 })
  @IsString()
  @IsNotEmpty({ message: 'license is required' })
  @MinLength(4, { message: 'license too short' })
  @MaxLength(50, { message: 'license too long' })
  license: string;

  @ApiPropertyOptional({ example: '+521234567890' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'phone must be a valid format' })
  phone?: string;
}
