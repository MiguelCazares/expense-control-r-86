import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({ example: 1, description: 'Driver ID' })
  @Type(() => Number)
  @IsInt({ message: 'driverId must be an integer' })
  @IsPositive({ message: 'driverId must be positive' })
  driverId: number;

  @ApiProperty({ example: 1, description: 'Bus ID' })
  @Type(() => Number)
  @IsInt({ message: 'busId must be an integer' })
  @IsPositive({ message: 'busId must be positive' })
  busId: number;

  @ApiProperty({ example: '2026-04-17' })
  @IsNotEmpty({ message: 'date is required' })
  @IsDateString({}, { message: 'date must be a valid ISO date (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ example: '05:30', description: 'Start time (HH:MM)' })
  @IsNotEmpty({ message: 'startTime is required' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be HH:MM format',
  })
  startTime: string;

  @ApiPropertyOptional({
    example: '22:20',
    description: 'End time (HH:MM) — set when closing the shift',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be HH:MM format',
  })
  endTime?: string;

  @ApiPropertyOptional({ example: 'Holiday route' })
  @IsOptional()
  @IsString()
  notes?: string;
}
