import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateIncomeDto {
  @ApiProperty({ example: 1, description: 'Bus ID' })
  @Type(() => Number)
  @IsInt({ message: 'busId must be an integer' })
  @IsPositive({ message: 'busId must be positive' })
  busId: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsNotEmpty({ message: 'date is required' })
  @IsDateString({}, { message: 'date must be a valid ISO date (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ example: 1500.5, description: 'Amount collected' })
  @Type(() => Number)
  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0, { message: 'amount must be positive' })
  amount: number;

  @ApiPropertyOptional({ example: 'Holiday route, extra passengers' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Shift ID to link this income to',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'shiftId must be an integer' })
  @IsPositive({ message: 'shiftId must be positive' })
  shiftId?: number;
}
