import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsPositive } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ShiftQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filter by driver ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  driverId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by bus ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  busId?: number;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString({}, { message: 'dateFrom must be a valid ISO date' })
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsOptional()
  @IsDateString({}, { message: 'dateTo must be a valid ISO date' })
  dateTo?: string;
}
