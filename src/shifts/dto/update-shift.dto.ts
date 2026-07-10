import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { CreateShiftDto } from './create-shift.dto';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {
  @ApiPropertyOptional({
    example: 12.5,
    description:
      'Number of route laps completed, in increments of 0.5 — set when closing the shift',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 1 },
    { message: 'laps must be a number with at most 1 decimal place' },
  )
  @Min(0, { message: 'laps must not be negative' })
  laps?: number;
}
