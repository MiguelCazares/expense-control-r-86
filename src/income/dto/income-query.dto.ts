import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsPositive } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class IncomeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filter by bus ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  busId?: number;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'From date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'dateFrom must be a valid ISO date' })
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2024-01-31',
    description: 'To date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'dateTo must be a valid ISO date' })
  dateTo?: string;
}
