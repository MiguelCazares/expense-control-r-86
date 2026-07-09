import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 1, description: 'Bus ID' })
  @Type(() => Number)
  @IsInt({ message: 'busId must be an integer' })
  @IsPositive({ message: 'busId must be positive' })
  busId: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsNotEmpty({ message: 'date is required' })
  @IsDateString({}, { message: 'date must be a valid ISO date (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ example: 850.0, description: 'Expense amount' })
  @Type(() => Number)
  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0, { message: 'amount must be positive' })
  amount: number;

  @ApiProperty({ example: 1, description: 'Expense category ID' })
  @Type(() => Number)
  @IsInt({ message: 'categoryId must be an integer' })
  @IsPositive({ message: 'categoryId must be positive' })
  categoryId: number;

  @ApiPropertyOptional({ example: 'Full tank, 80 liters' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Shift ID to link this expense to',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'shiftId must be an integer' })
  @IsPositive({ message: 'shiftId must be positive' })
  shiftId?: number;
}
