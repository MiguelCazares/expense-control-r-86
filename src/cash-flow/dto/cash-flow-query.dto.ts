import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CashFlowQueryDto {
  @ApiProperty({
    example: '2026-07-01',
    description: 'Start of the range (YYYY-MM-DD), inclusive',
  })
  @IsNotEmpty({ message: 'dateFrom is required' })
  @IsDateString({}, { message: 'dateFrom must be a valid ISO date' })
  dateFrom: string;

  @ApiProperty({
    example: '2026-07-07',
    description: 'End of the range (YYYY-MM-DD), inclusive',
  })
  @IsNotEmpty({ message: 'dateTo is required' })
  @IsDateString({}, { message: 'dateTo must be a valid ISO date' })
  dateTo: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by bus ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  busId?: number;
}
