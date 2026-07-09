import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({
    description: 'Reactivate or deactivate the category',
  })
  @IsOptional()
  @IsBoolean({ message: 'active must be a boolean' })
  active?: boolean;
}
