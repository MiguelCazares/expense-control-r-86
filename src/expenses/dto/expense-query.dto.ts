import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ExpenseCategory } from '../enums/expense-category.enum';

export class ExpenseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filter by bus ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  busId?: number;

  @ApiPropertyOptional({
    enum: ExpenseCategory,
    description: 'Filter by category',
  })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString({}, { message: 'dateFrom must be a valid ISO date' })
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2024-01-31' })
  @IsOptional()
  @IsDateString({}, { message: 'dateTo must be a valid ISO date' })
  dateTo?: string;
}
