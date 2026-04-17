import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateBusDto {
  @ApiProperty({ example: 'ABC-123', maxLength: 20 })
  @IsString()
  @IsNotEmpty({ message: 'plate is required' })
  @MaxLength(20, { message: 'plate too long' })
  plate: string;

  @ApiProperty({ example: '42', maxLength: 20 })
  @IsString()
  @IsNotEmpty({ message: 'number is required' })
  @MaxLength(20, { message: 'number too long' })
  number: string;

  @ApiProperty({ example: 'Sprinter', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'model is required' })
  @MaxLength(100, { message: 'model too long' })
  model: string;

  @ApiProperty({ example: 'Mercedes-Benz', maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'brand is required' })
  @MaxLength(100, { message: 'brand too long' })
  brand: string;

  @ApiProperty({ example: 2020, minimum: 1990, maximum: 2100 })
  @Type(() => Number)
  @IsInt({ message: 'year must be an integer' })
  @Min(1990, { message: 'year must be 1990 or later' })
  @Max(2100, { message: 'year is invalid' })
  year: number;

  @ApiProperty({ example: 'Route 86 - Downtown', maxLength: 150 })
  @IsString()
  @IsNotEmpty({ message: 'route is required' })
  @MaxLength(150, { message: 'route too long' })
  route: string;
}
