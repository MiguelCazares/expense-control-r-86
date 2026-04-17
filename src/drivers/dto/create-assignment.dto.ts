import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssignmentDto {
  @ApiProperty({ example: 1, description: 'Bus ID to assign the driver to' })
  @Type(() => Number)
  @IsInt({ message: 'busId must be an integer' })
  @IsPositive({ message: 'busId must be positive' })
  busId: number;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Assignment date (YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'date is required' })
  @IsDateString({}, { message: 'date must be a valid ISO date (YYYY-MM-DD)' })
  date: string;
}
