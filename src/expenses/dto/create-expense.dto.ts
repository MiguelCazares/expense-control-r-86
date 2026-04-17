import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '../enums/expense-category.enum';

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

  @ApiProperty({ enum: ExpenseCategory, example: ExpenseCategory.FUEL })
  @IsEnum(ExpenseCategory, {
    message: 'category must be: fuel, maintenance, repair or other',
  })
  category: ExpenseCategory;

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
